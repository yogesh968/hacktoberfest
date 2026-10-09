"""Talks to the Ollama server and turns its answer into a validated GardenPlan.

Flow: build prompt -> POST /api/chat with a JSON Schema in `format`
-> parse JSON -> validate with Pydantic -> return (or raise a clear error).

There is deliberately NO fake/fallback plan here: if the model fails, we raise.
"""

import json
import logging
import time
from copy import deepcopy

import httpx
from pydantic import ValidationError

from app.config import Settings
from app.schemas import GardenPlan, GardenRequest

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are AI Garden Buddy, a friendly and careful gardening coach.
Your goal is to get people off their screens and into their garden with small, achievable actions.

Rules:
- You have NO access to live weather, local climate data, frost dates, soil tests or the current season at the user's location. Never invent them. Do not state specific temperatures, dates or rainfall.
- Use only general, widely-accepted gardening knowledge. If a plant's suitability depends on local climate or season, say so and tell the user to check with a local nursery or extension service.
- Prefer forgiving, common plants that suit the stated garden type, sunlight and experience level. For beginners, favour easy plants.
- Keep tasks realistic for the user's available time.
- Include practical safety notes where relevant (e.g. plants toxic to pets or children, sun and heat, lifting heavy pots, sharp tools, balcony weight/drainage, washing hands after handling soil).
- "today_task" must be one concrete thing the user can do outside (or at their indoor plants) today, away from the screen.
- "seven_day_plan" must have exactly 7 entries, days 1 to 7.
- "uncertainty_note" must honestly explain what you could not know (e.g. local climate, season) and how the user can verify.
- Write plain, encouraging English. Respond ONLY with JSON matching the provided schema."""

LABELS = {
    "balcony": "balcony", "terrace": "terrace / rooftop", "backyard": "backyard", "indoor": "indoor space",
    "full_sun": "full sun (6+ hours of direct sun)", "partial_sun": "partial sun (3-6 hours)",
    "shade": "shade (under 3 hours of direct sun)",
}


class GardenAIError(Exception):
    """An error we can explain to the user. `status` is the HTTP status to return."""

    def __init__(self, code: str, message: str, hint: str | None = None, status: int = 503):
        super().__init__(message)
        self.code, self.message, self.hint, self.status = code, message, hint, status


def build_user_prompt(req: GardenRequest) -> str:
    time_line = (
        f"About {req.minutes_per_day} minutes per day." if req.minutes_per_day
        else "Not specified — assume about 15 minutes per day."
    )
    return (
        "Create a personalised starter gardening plan.\n"
        f"- Location (city/region, as typed by user): {req.city}\n"
        f"- Garden type: {LABELS[req.garden_type]}\n"
        f"- Sunlight: {LABELS[req.sunlight]}\n"
        f"- Experience: {req.experience}\n"
        f"- Time available: {time_line}\n\n"
        "Recommend 3 to 5 plants. Remember: you do not know the current season or local weather, "
        "so keep advice general and flag anything that depends on climate."
    )


def _inline_refs(schema: dict) -> dict:
    """Pydantic puts nested models in "$defs" and links them with "$ref".
    Inline them so the schema is simple and self-contained for Ollama."""
    schema = deepcopy(schema)
    defs = schema.pop("$defs", {})

    def resolve(node):
        if isinstance(node, dict):
            if "$ref" in node:
                return resolve(defs[node["$ref"].split("/")[-1]])
            return {k: resolve(v) for k, v in node.items()}
        if isinstance(node, list):
            return [resolve(x) for x in node]
        return node

    return resolve(schema)


PLAN_SCHEMA = _inline_refs(GardenPlan.model_json_schema())


async def check_ollama(settings: Settings) -> tuple[bool, bool, str | None]:
    """Returns (reachable, model_available, detail)."""
    try:
        async with httpx.AsyncClient(base_url=settings.ollama_base_url, timeout=5) as client:
            r = await client.get("/api/tags")
            r.raise_for_status()
    except httpx.HTTPError:
        return False, False, f"Cannot reach Ollama at {settings.ollama_base_url}. Is it running?"
    names = {m.get("name") for m in r.json().get("models", [])} | {m.get("model") for m in r.json().get("models", [])}
    wanted = settings.ollama_model
    available = wanted in names or f"{wanted}:latest" in names
    detail = None if available else f"Model '{wanted}' is not downloaded. Run: ollama pull {wanted}"
    return True, available, detail


async def generate_plan(req: GardenRequest, settings: Settings) -> tuple[GardenPlan, float]:
    """Ask the model for a plan. Retries once if the output is malformed."""
    payload = {
        "model": settings.ollama_model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_prompt(req)},
        ],
        "format": PLAN_SCHEMA,  # structured outputs: constrains the reply to our schema
        "stream": False,
        "options": {"temperature": settings.ollama_temperature},
    }
    start = time.perf_counter()
    last_problem = ""
    async with httpx.AsyncClient(base_url=settings.ollama_base_url, timeout=settings.ollama_timeout_seconds) as client:
        for attempt in (1, 2):
            data = await _post_chat(client, payload, settings)
            content = data.get("message", {}).get("content", "")
            try:
                plan = GardenPlan.model_validate(json.loads(content))
                return plan, round(time.perf_counter() - start, 1)
            except (json.JSONDecodeError, ValidationError) as e:
                # Log the shape of the problem, not the user's inputs.
                last_problem = type(e).__name__
                logger.warning("Model output failed validation on attempt %d: %s", attempt, last_problem)

    raise GardenAIError(
        "invalid_model_output",
        "The AI model replied, but its answer wasn't a complete gardening plan.",
        "Click Regenerate to try again. If this keeps happening, try a larger model "
        "(e.g. set OLLAMA_MODEL=gemma3:4b instead of a 1b model).",
        status=502,
    )


async def _post_chat(client: httpx.AsyncClient, payload: dict, settings: Settings) -> dict:
    model = settings.ollama_model
    try:
        r = await client.post("/api/chat", json=payload)
    except httpx.ConnectError:
        raise GardenAIError(
            "ollama_unreachable",
            f"Can't connect to Ollama at {settings.ollama_base_url}.",
            "Start Ollama (open the Ollama app, or run `ollama serve`), then try again.",
        )
    except httpx.TimeoutException:
        raise GardenAIError(
            "model_timeout",
            f"The model took longer than {settings.ollama_timeout_seconds:.0f} seconds.",
            "The first request after starting can be slow while the model loads. Try again, "
            "use a smaller model (gemma3:1b), or raise OLLAMA_TIMEOUT_SECONDS.",
            status=504,
        )
    except httpx.HTTPError as e:
        raise GardenAIError("ollama_error", f"Error talking to Ollama: {type(e).__name__}.")

    if r.status_code == 404:
        raise GardenAIError(
            "model_not_found",
            f"The model '{model}' isn't downloaded in Ollama.",
            f"Run: ollama pull {model}",
        )
    if r.status_code >= 400:
        try:
            err = r.json().get("error", r.text)
        except ValueError:
            err = r.text
        raise GardenAIError("ollama_error", f"Ollama returned an error: {err[:300]}", status=502)
    return r.json()
