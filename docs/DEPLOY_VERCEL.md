# Deploying AI Garden Buddy on Vercel

## The one thing to understand first

Vercel can host the **frontend** (React/Vite) and the **backend** (FastAPI as a Python function),
but it **cannot run Ollama or the Gemma model**. Vercel functions have no GPU, limited memory, and
no persistent process. So the model must live somewhere else and the backend reaches it through
`OLLAMA_BASE_URL`:

```
Browser ──▶ Vercel: frontend (static)
        ──▶ Vercel: backend (FastAPI function) ──▶ Ollama + Gemma (your laptop via tunnel, or a server)
```

## Plan (recommended): 2 Vercel projects + Ollama on your laptop via Cloudflare Tunnel

The demo works **only while your laptop is on and the tunnel is running**. That's fine for
judging/screenshots and keeps the "model runs on my own hardware" story true.

### Step 1: Expose Ollama with a tunnel (on your laptop)

```powershell
winget install --id Cloudflare.cloudflared
ollama pull gemma3:1b            # already done; or gemma3:4b for better quality
cloudflared tunnel --url http://localhost:11434 --http-host-header="localhost:11434"
```

It prints a URL like `https://random-words.trycloudflare.com`. Copy it. (The URL changes every
time you restart the tunnel. Update the Vercel env var when it does.)

> ⚠️ Ollama has **no authentication**. Anyone who finds this URL can use your model/GPU.
> Only run the tunnel while you're demoing, and stop it (`Ctrl+C`) afterwards.

### Step 2: Backend project on Vercel

1. Vercel dashboard → **Add New → Project** → import `yogesh968/hacktoberfest`.
2. **Root Directory:** `backend`. Framework preset: **FastAPI** (Vercel auto-detects `app/main.py`).
3. **Environment variables:**

   | Name | Value |
   |---|---|
   | `OLLAMA_BASE_URL` | the `https://….trycloudflare.com` URL from step 1 |
   | `OLLAMA_MODEL` | `gemma3:1b` (must match what you pulled) |
   | `OLLAMA_TIMEOUT_SECONDS` | `120` |
   | `CORS_ORIGINS` | your frontend URL from step 3 (fill after step 3, then redeploy) |

4. Add `backend/vercel.json` so slow generations aren't cut off (Vercel's default function time
   limit may be shorter than a model generation):

   ```json
   {
     "$schema": "https://openapi.vercel.sh/vercel.json",
     "functions": { "app/main.py": { "maxDuration": 300 } }
   }
   ```

5. Deploy. Test: open `https://<backend>.vercel.app/api/health`. You should see
   `"ollama_reachable": true, "model_available": true`.

### Step 3: Frontend project on Vercel

1. **Add New → Project** → import the same repo again.
2. **Root Directory:** `frontend`. Framework preset: **Vite** (build `npm run build`, output `dist`).
3. **Environment variable:** `VITE_API_BASE_URL` = `https://<backend>.vercel.app` (no trailing slash).
4. Deploy. You get `https://<frontend>.vercel.app`.

### Step 4: Connect CORS

Back in the **backend** project → Settings → Environment Variables → set
`CORS_ORIGINS=https://<frontend>.vercel.app` → **Redeploy** the backend.

### Step 5: Test end to end

- [ ] Badge in the top-right says the model is ready
- [ ] Generate a plan (the first one is slow while the model loads)
- [ ] Plan shows "via a remote Ollama server" (correct: the backend is on Vercel, not next to Ollama)
- [ ] Stop the tunnel → app shows the "Can't connect to Ollama" message, not a crash

### Step 6: Update the DEV post

Put the frontend URL under **Live Demo** and add a note like:
*"The live demo talks to Gemma running on my own laptop through a tunnel, so it's only up while I'm
online. To try it any time, run it locally (see README)."*

## Alternatives

| Option | Pros | Cons |
|---|---|---|
| **Laptop + tunnel** (above) | Free, model truly on your hardware | Only up while laptop is on; URL changes |
| **Ollama on a cloud VM/GPU server** (e.g. a VPS with 8 GB+ RAM for `gemma3:1b`) | Always on | Costs money; you must lock it down (firewall / reverse proxy with auth) |
| **Frontend only on Vercel, no backend** | Simplest | AI doesn't work online; viewers see the "not connected" state. Only useful with a demo video |

## Common problems

| Symptom | Fix |
|---|---|
| CORS error in browser console | `CORS_ORIGINS` must exactly match the frontend URL (https, no trailing slash); redeploy backend |
| `ollama_unreachable` | Tunnel not running, or `OLLAMA_BASE_URL` has the old tunnel URL |
| `model_not_found` | `OLLAMA_MODEL` on Vercel doesn't match `ollama list` on your laptop |
| `model_timeout` / 504 | First load is slow; retry. Use `gemma3:1b`; raise `maxDuration` |
| Frontend still calls `localhost:8000` | `VITE_API_BASE_URL` is baked in at build time. Set it, then **redeploy** the frontend |
