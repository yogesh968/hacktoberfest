*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 1: Touch Grass](https://dev.to/challenges/hacktoberfest-week1-2026-10-05)*

## What I Built

I built **AI Garden Buddy**, a project designed to help people spend less time looking at screens and more time exploring the world around them. 🌿

**Less scrolling. More growing.**

The idea behind this project was to solve a simple problem: lots of people *want* to start growing something, but they don't know which plants suit their space, light and experience, so they end up scrolling through endless gardening videos instead of actually going outside. AI Garden Buddy uses open-source AI to turn a few details about your space into a short, personal starter plan, and then gives you one small thing to go and do *today*.

### Key Features

- **Personalised plant picks:** Tell it your city, your space (balcony, terrace, backyard or indoor), how much sun it gets and your experience level. It suggests plants that suit those conditions and explains why each one fits, with watering, sunlight and difficulty info.
- **A gentle 7-day plan:** A day-by-day starter plan plus a tools list, scaled to the minutes per day you say you have.
- **Safety and honesty built in:** Every plan includes safety notes (toxic plants, heat, heavy pots, tools) and an "uncertainty note" explaining what the AI *couldn't* know, such as your local weather or frost dates.
- **AI-powered assistance:** A Gemma model running locally through Ollama writes the whole plan. The backend forces it to answer in a strict JSON schema and validates the result, so the UI always gets a complete, well-formed plan or a clear error. It never shows a fake plan.
- **Outdoor experience:** Each plan ends with **one small outdoor task for today**, with step-by-step instructions and a time estimate. You can tick it off with "Mark as done" and write a short reflection on what you noticed. That's stored only in your browser.

The project is designed for **beginner gardeners, especially people with just a balcony or a small corner of space,** who want **a realistic, low-pressure reason to get their hands in the soil instead of their thumbs on a screen.**

## Demo

**Live Demo:** There isn't a hosted demo. The app is intentionally local-first: the AI model runs on your own computer through Ollama, so there's no cloud AI service behind it. Setup takes a few minutes (see the README).

**Demo Video:** [INSERT YOUR VIDEO URL, OR DELETE THIS LINE]

Here are some screenshots of the project in action:

[INSERT SCREENSHOTS: the form, the loading state, a generated plan, and the "today" task marked as done]

I tested the backend with **13 automated API tests** (pytest). Ollama is swapped for a fake HTTP transport inside the tests, so they cover valid plans, malformed model output plus the retry, Ollama being offline, a missing model, timeouts and invalid form input. I also ran the full app end to end with **`gemma3:1b`** on Ollama 0.40.4. One thing I learned from testing was that **a 1B model doesn't always follow a strict schema on the first try**. That's exactly why the backend validates every reply and retries once, and why the UI recommends a larger model (like `gemma3:4b`) if you keep seeing `invalid_model_output`.

## Code

**GitHub Repository:** https://github.com/yogesh968/hacktoberfest

The repository contains the source code, setup instructions, and implementation details.

To run the project locally, follow the installation instructions in the repository's README.

## How I Built It

I built this project using the following technologies:

- **Frontend:** React 18 + Vite 6, styled with Tailwind CSS v4
- **Backend:** Python FastAPI with Pydantic v2 (served with Uvicorn)
- **Open-source AI model:** Google **Gemma 3** (`gemma3:1b` tested; `gemma3:4b` is the default and `gemma4:e2b` is supported)
- **AI framework or inference runtime:** **Ollama**, running locally, using its structured-outputs (`format` JSON Schema) feature
- **Other technologies:** httpx (async calls to Ollama), pydantic-settings (config), lucide-react (icons), Fontsource (self-hosted fonts so the UI works offline), pytest, ESLint

The core AI workflow works like this:

1. The user **fills in a short form: city, garden type, sunlight, experience level and (optionally) minutes per day.**
2. The application processes the input using **Gemma running locally in Ollama. The FastAPI backend builds a system prompt and passes a JSON Schema (generated from the Pydantic `GardenPlan` model) in Ollama's `format` field, so the model has to answer in exactly the shape the UI needs.**
3. The system produces **a validated plan: suitable plants with care tips, a tools list, a 7-day plan, today's outdoor task, safety notes and an uncertainty note. It's shown in cards and labelled with the model that wrote it.**
4. The user can use that result to **go outside, do today's small task, mark it done and jot down what they noticed. It's a first step toward a real garden.**

The most interesting part of building this project was **getting reliable structured output from a small local model.** Free-text answers were hard to render, and small models sometimes return JSON that's missing fields or has the wrong number of days. I solved it in layers: Ollama's structured outputs constrain the response to a JSON Schema, Pydantic then checks the rules the schema can't express well (exactly 7 days, 2–6 plants), and if validation fails the backend retries once before returning a clear `502` with a helpful hint. I also decided **never** to fall back to a fake "AI" plan. If the model is unavailable, the UI shows troubleshooting steps and a few general tips that are clearly labelled **"Not AI-generated"**.

## Why Does Open Innovation Matter?

Open innovation was an important consideration in this project because it gives developers more control over the technologies they build with.

Using **Gemma through Ollama** made it possible to **run the whole AI pipeline on my own laptop, with no API key, no account, no per-request cost and no garden data leaving the machine.**

Depending on the model and deployment setup, open-source AI can provide opportunities to:

- Run inference locally and reduce dependence on external AI services.
- Keep sensitive inputs on the user's device when the implementation supports it.
- Experiment with different models and customize the AI workflow.
- Understand, modify, and improve the underlying technology.

For this project, the specific advantage was **privacy and swappability. With the default setup, data only flows browser → `localhost:8000` → `localhost:11434`, and the backend doesn't log the city or other form inputs. Switching models is a single environment variable (`OLLAMA_MODEL`): I could test on the small `gemma3:1b`, default to `gemma3:4b` for better quality, or use `gemma4:e2b`. The prompt and schema are in the repo for anyone to read and improve, and someone could fine-tune a model on regional plant knowledge.**

A quick note on licensing, because I tried to be accurate: Gemma 3 is **open-weight** under Google's Gemma Terms of Use, a custom licence with use restrictions, so I don't call it "open source" in the strict OSI sense. Gemma 4 is published under Apache 2.0, and the app supports it with that one-line config change.

My goal was not just to add AI to an application, but to use open technology to build something useful beyond the screen.

## My Agent Session

[OPTIONAL: ADD YOUR DEVRELAY AGENT SESSION LINK HERE, OR DELETE THIS SECTION]

## Prize Categories

[CHECK THE CHALLENGE PAGE: if there's a Google / Gemma or Ollama partner category, list it here. Otherwise delete this section.]

Thanks to the DEV community and the Hacktoberfest organizers for this challenge. Building this project gave me an opportunity to explore open-source AI and think about how technology can encourage more meaningful real-world experiences. 🌱
