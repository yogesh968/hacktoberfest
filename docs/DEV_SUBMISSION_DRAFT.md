---
title: "AI Garden Buddy: Less scrolling, more growing with a local open-weight model"
published: false
tags: devchallenge, hf26challenge, opensource, ai
---

<!-- Draft for the Hacktoberfest 2026 DEV Challenge (Week 1: Touch Grass). Deadline on your challenge page: October 11, 2026.
     Replace every TODO, add your screenshots, then set published: true. Re-read the official challenge page for any
     required template sections before submitting. -->

*This is a submission for the Hacktoberfest 2026 DEV Challenge: Touch Grass.*

## What I Built

**AI Garden Buddy** is a gardening assistant built to get you *off* your screen. You tell it where you live,
what kind of space you have (balcony, terrace, backyard or indoors), how much sun it gets and how experienced
you are. A locally-running open-weight AI model then writes you:

- 3–5 plants that suit your conditions, with the reasons why
- Simple watering and sunlight guidance
- A tools list and a gentle 7-day plan
- **One small outdoor task for today**, with a "Mark as done" button and a space to write what you noticed

The whole point is the last bit: the AI's output is a reason to go outside, not more content to scroll.

## Demo

<!-- TODO: screenshots / short GIF of: form → loading → plan → task marked done -->
<!-- TODO: GitHub repo link -->

## How open-source AI powers it

- **Model:** Google's **Gemma** (`TODO: exact tag, e.g. gemma3:4b`), an open-weight model, run with **Ollama** on my laptop
  (`TODO: hardware`). Typical generation time: `TODO` seconds.
- **Structured output:** the FastAPI backend sends Ollama a JSON Schema (generated from a Pydantic model) in the
  `format` field, so the model has to answer with plants, a 7-day plan, today's task, safety notes and an
  "uncertainty note". The backend validates the reply and, if it's malformed, retries once. **It never fakes a plan.**
  If the model is down, the UI says so and shows a few general tips that are clearly labelled *not AI-generated*.
- **Honest prompting:** the app has no weather or climate data, so the system prompt forbids inventing frost dates or
  temperatures and asks the model to say what it couldn't know.

### About the licence
<!-- Keep whichever applies to the model you actually used -->
Gemma 3 is *open-weight* under Google's Gemma Terms of Use. That's a custom licence with use restrictions, so I
don't call it "open source". Gemma 4 is published under Apache 2.0, and the app can switch models with one
environment variable (`OLLAMA_MODEL`).

### Why open weights matter for this project
- Garden profiles stay on my machine. With the default setup, nothing goes to a cloud AI API.
- No API key, account or per-request cost after the one-time model download.
- Anyone can inspect the prompt and schema, swap the model, or fine-tune one on regional plant knowledge.

## Tech stack
React + Vite, Tailwind CSS, Lucide icons · Python FastAPI + Pydantic · Ollama + Gemma

## Limitations
No live weather or climate data, small models can be confidently wrong, and speed depends on your hardware.
The app says all of this in its UI, too.

## What I learned
<!-- TODO: 2–4 honest sentences in your own words, e.g. structured outputs, error handling, React state -->

## Did I touch grass?
<!-- TODO: tell us what your first "today task" was and whether you did it 🌱 -->
