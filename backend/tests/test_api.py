"""API tests. Ollama is replaced by a fake HTTP transport so these run without a model.
(The fake lives only in tests — the real app always calls Ollama.)"""

import json

import httpx
import pytest
from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import app
from app.services import garden_ai

VALID_REQUEST = {"city": "Pune", "garden_type": "balcony", "sunlight": "partial_sun", "experience": "beginner"}

VALID_PLAN = {
    "summary": "A small herb balcony.",
    "plants": [
        {"name": "Mint", "why_it_suits": "Tolerates part sun.", "watering": "Keep soil moist.",
         "sunlight": "3-6 hours.", "difficulty": "easy"},
        {"name": "Basil", "why_it_suits": "Grows well in pots.", "watering": "When top soil is dry.",
         "sunlight": "4+ hours.", "difficulty": "easy"},
    ],
    "tools": ["Pots with drainage holes"],
    "seven_day_plan": [{"day": d, "title": f"Day {d}", "task": "Do a thing."} for d in range(7, 0, -1)],
    "today_task": {"title": "Observe your light", "steps": ["Go outside", "Note sunny spots"], "duration_minutes": 10},
    "safety_notes": ["Wash hands after handling soil."],
    "uncertainty_note": "I don't know your local climate.",
}

client = TestClient(app)
MODEL = get_settings().ollama_model


def fake_ollama(handler):
    """Patch httpx.AsyncClient inside garden_ai so requests go to `handler`."""
    real = httpx.AsyncClient

    def factory(*args, **kwargs):
        kwargs["transport"] = httpx.MockTransport(handler)
        return real(*args, **kwargs)

    return factory


def chat_reply(content: str):
    def handler(request: httpx.Request):
        if request.url.path == "/api/chat":
            return httpx.Response(200, json={"message": {"role": "assistant", "content": content}})
        return httpx.Response(200, json={"models": [{"name": MODEL, "model": MODEL}]})
    return handler


def test_valid_plan(monkeypatch):
    monkeypatch.setattr(garden_ai.httpx, "AsyncClient", fake_ollama(chat_reply(json.dumps(VALID_PLAN))))
    r = client.post("/api/garden-plan", json=VALID_REQUEST)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["meta"]["source"] == "ollama"
    assert [d["day"] for d in body["plan"]["seven_day_plan"]] == list(range(1, 8))  # sorted


def test_request_sends_schema_and_no_stream(monkeypatch):
    seen = {}

    def handler(request):
        seen.update(json.loads(request.content))
        return httpx.Response(200, json={"message": {"content": json.dumps(VALID_PLAN)}})

    monkeypatch.setattr(garden_ai.httpx, "AsyncClient", fake_ollama(handler))
    client.post("/api/garden-plan", json=VALID_REQUEST)
    assert seen["stream"] is False
    assert seen["format"]["type"] == "object" and "$defs" not in json.dumps(seen["format"])
    assert "Pune" in seen["messages"][1]["content"]


def test_malformed_output_is_error_not_fake_plan(monkeypatch):
    monkeypatch.setattr(garden_ai.httpx, "AsyncClient", fake_ollama(chat_reply("not json")))
    r = client.post("/api/garden-plan", json=VALID_REQUEST)
    assert r.status_code == 502
    assert r.json()["code"] == "invalid_model_output"


def test_wrong_number_of_days_rejected(monkeypatch):
    bad = {**VALID_PLAN, "seven_day_plan": VALID_PLAN["seven_day_plan"][:5]}
    monkeypatch.setattr(garden_ai.httpx, "AsyncClient", fake_ollama(chat_reply(json.dumps(bad))))
    assert client.post("/api/garden-plan", json=VALID_REQUEST).status_code == 502


def test_model_not_found(monkeypatch):
    monkeypatch.setattr(garden_ai.httpx, "AsyncClient",
                        fake_ollama(lambda req: httpx.Response(404, json={"error": "model not found"})))
    r = client.post("/api/garden-plan", json=VALID_REQUEST)
    assert r.status_code == 503 and r.json()["code"] == "model_not_found"
    assert "ollama pull" in r.json()["hint"]


def test_ollama_unreachable(monkeypatch):
    def handler(request):
        raise httpx.ConnectError("refused")

    monkeypatch.setattr(garden_ai.httpx, "AsyncClient", fake_ollama(handler))
    r = client.post("/api/garden-plan", json=VALID_REQUEST)
    assert r.status_code == 503 and r.json()["code"] == "ollama_unreachable"
    h = client.get("/api/health").json()
    assert h["backend"] == "ok" and h["ollama_reachable"] is False


def test_timeout(monkeypatch):
    def handler(request):
        raise httpx.ReadTimeout("slow")

    monkeypatch.setattr(garden_ai.httpx, "AsyncClient", fake_ollama(handler))
    assert client.post("/api/garden-plan", json=VALID_REQUEST).json()["code"] == "model_timeout"


@pytest.mark.parametrize("patch", [
    {"city": ""}, {"city": " a "}, {"garden_type": "moon"}, {"sunlight": "lots"}, {"minutes_per_day": 2},
])
def test_input_validation(patch):
    r = client.post("/api/garden-plan", json={**VALID_REQUEST, **patch})
    assert r.status_code == 422 and r.json()["code"] == "invalid_input"


def test_health_reports_model(monkeypatch):
    monkeypatch.setattr(garden_ai.httpx, "AsyncClient", fake_ollama(chat_reply("{}")))
    h = client.get("/api/health").json()
    assert h == {"backend": "ok", "ollama_reachable": True, "model": MODEL,
                 "model_available": True, "runs_locally": get_settings().model_runs_locally, "detail": None}
