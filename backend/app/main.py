"""FastAPI entry point. Run with:  uvicorn app.main:app --reload --port 8000"""

import logging
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import Settings, get_settings
from app.schemas import ErrorResponse, GardenPlanResponse, GardenRequest, HealthResponse, PlanMeta
from app.services.garden_ai import GardenAIError, check_ollama, generate_plan

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")

app = FastAPI(title="AI Garden Buddy API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_origin_list,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.exception_handler(GardenAIError)
async def garden_ai_error_handler(_: Request, exc: GardenAIError):
    body = ErrorResponse(code=exc.code, message=exc.message, hint=exc.hint)
    return JSONResponse(status_code=exc.status, content=body.model_dump())


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_: Request, exc: RequestValidationError):
    # Return field names + messages only (not the submitted values).
    fields = {".".join(str(p) for p in e["loc"][1:]): e["msg"] for e in exc.errors()}
    body = ErrorResponse(code="invalid_input", message="Some fields need attention.",
                         hint="Check the highlighted fields and try again.")
    return JSONResponse(status_code=422, content={**body.model_dump(), "fields": fields})


@app.get("/api/health", response_model=HealthResponse)
async def health(settings: Settings = Depends(get_settings)):
    reachable, available, detail = await check_ollama(settings)
    return HealthResponse(
        ollama_reachable=reachable,
        model=settings.ollama_model,
        model_available=available,
        runs_locally=settings.model_runs_locally,
        detail=detail,
    )


@app.post(
    "/api/garden-plan",
    response_model=GardenPlanResponse,
    responses={422: {"model": ErrorResponse}, 502: {"model": ErrorResponse},
               503: {"model": ErrorResponse}, 504: {"model": ErrorResponse}},
)
async def garden_plan(req: GardenRequest, settings: Settings = Depends(get_settings)):
    plan, duration = await generate_plan(req, settings)
    meta = PlanMeta(
        model=settings.ollama_model,
        runs_locally=settings.model_runs_locally,
        generated_at=datetime.now(timezone.utc),
        duration_seconds=duration,
    )
    return GardenPlanResponse(plan=plan, meta=meta)
