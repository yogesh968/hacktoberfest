"""Pydantic models: what the API accepts (requests) and what it returns (responses).

GardenPlan is also turned into a JSON Schema and sent to Ollama, so the model
is constrained to answer in exactly this shape.
"""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

GardenType = Literal["balcony", "terrace", "backyard", "indoor"]
Sunlight = Literal["full_sun", "partial_sun", "shade"]
Experience = Literal["beginner", "intermediate", "experienced"]


# ---------- Request ----------

class GardenRequest(BaseModel):
    city: str = Field(min_length=2, max_length=80, description="City or general location")
    garden_type: GardenType
    sunlight: Sunlight
    experience: Experience
    minutes_per_day: Optional[int] = Field(default=None, ge=5, le=240)

    @field_validator("city")
    @classmethod
    def clean_city(cls, v: str) -> str:
        v = " ".join(v.split())  # collapse whitespace
        if len(v) < 2:
            raise ValueError("Please enter a city or region (at least 2 characters).")
        return v


# ---------- What the model must produce ----------

class Plant(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    why_it_suits: str = Field(min_length=1, max_length=400)
    watering: str = Field(min_length=1, max_length=300)
    sunlight: str = Field(min_length=1, max_length=300)
    difficulty: Literal["easy", "moderate", "challenging"]


class DayPlan(BaseModel):
    day: int = Field(ge=1, le=7)
    title: str = Field(min_length=1, max_length=80)
    task: str = Field(min_length=1, max_length=400)


class TodayTask(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    steps: list[str] = Field(min_length=1, max_length=6)
    duration_minutes: int = Field(ge=1, le=240)


class GardenPlan(BaseModel):
    summary: str = Field(min_length=1, max_length=600)
    plants: list[Plant] = Field(min_length=2, max_length=6)
    tools: list[str] = Field(min_length=1, max_length=10)
    seven_day_plan: list[DayPlan] = Field(min_length=7, max_length=7)
    today_task: TodayTask
    safety_notes: list[str] = Field(min_length=1, max_length=6)
    uncertainty_note: str = Field(min_length=1, max_length=500)

    @field_validator("seven_day_plan")
    @classmethod
    def days_are_1_to_7(cls, days: list[DayPlan]) -> list[DayPlan]:
        days = sorted(days, key=lambda d: d.day)
        if [d.day for d in days] != list(range(1, 8)):
            raise ValueError("seven_day_plan must contain days 1 to 7 exactly once")
        return days


# ---------- API responses ----------

class PlanMeta(BaseModel):
    source: Literal["ollama"] = "ollama"  # always real model output — never a fallback
    model: str
    runs_locally: bool
    generated_at: datetime
    duration_seconds: float


class GardenPlanResponse(BaseModel):
    plan: GardenPlan
    meta: PlanMeta


class HealthResponse(BaseModel):
    backend: Literal["ok"] = "ok"
    ollama_reachable: bool
    model: str
    model_available: bool
    runs_locally: bool
    detail: Optional[str] = None


class ErrorResponse(BaseModel):
    code: str
    message: str
    hint: Optional[str] = None
