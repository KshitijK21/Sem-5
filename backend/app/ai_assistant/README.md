# AI Assistant

Provider-agnostic LLM assistant grounded strictly in warehouse data.

## Flow
1. `POST /api/insights/query` `{question, context_limit?}`
2. `context.build_context(db, role)` gathers a fixed set of real aggregates
   (no arbitrary SQL): monthly revenue, top categories, order statuses, and ML
   status. Both supported roles (analyst/admin) get this same business context;
   platform administration data and secrets are never included.
3. `provider.ProviderFactory.get_provider()` selects the LLM:
   - `OllamaProvider` when `ENABLE_LLM_ASSISTANT=true` and `LLM_PROVIDER=ollama`
     (calls `${OLLAMA_BASE_URL}/api/generate`).
   - `DisabledProvider` otherwise.
4. If the LLM is unavailable, the endpoint returns a deterministic, data-grounded
   summary (`status: llm_unavailable`) instead of failing.

## Status
`GET /api/insights/status` returns the configured provider, model, whether the
provider is `reachable`, and the fallback behaviour. It never raises — a failed
probe is reported as `reachable: false`.

## Live run (local Ollama)
```powershell
ollama pull llama3.2
ollama serve                      # or run the Ollama desktop app
# set ENABLE_LLM_ASSISTANT=true in backend/.env
cd backend; python -m uvicorn app.main:app --reload
```
Confirm `reachable: true` at `/api/insights/status` before asking questions.
With the flag off (default), responses come from the deterministic fallback.

## Config (env)
- `ENABLE_LLM_ASSISTANT` (default false)
- `LLM_PROVIDER` (default `ollama`)
- `OLLAMA_BASE_URL` (default `http://localhost:11434`)
- `OLLAMA_MODEL` (default `llama3.2`)
- `LLM_TIMEOUT_SECONDS` (default 20)

## Permission awareness
- Context scope depends on the caller's role (from the JWT).
- The LLM only ever sees the pre-computed context; it cannot query the database.
