# AI Assistant

Provider-agnostic LLM assistant grounded strictly in warehouse data.

## Flow
1. `POST /api/insights/query` `{question, context_limit?}`
2. `context.build_context(db, role)` gathers a fixed, role-scoped set of real
   aggregates (no arbitrary SQL). Viewers get KPIs only; analysts/admins also get
   monthly revenue, top categories, order statuses, and ML status.
3. `provider.ProviderFactory.get_provider()` selects the LLM:
   - `OllamaProvider` when `ENABLE_LLM_ASSISTANT=true` and `LLM_PROVIDER=ollama`
     (calls `${OLLAMA_BASE_URL}/api/generate`).
   - `DisabledProvider` otherwise.
4. If the LLM is unavailable, the endpoint returns a deterministic, data-grounded
   summary (`status: llm_unavailable`) instead of failing.

## Config (env)
- `ENABLE_LLM_ASSISTANT` (default false)
- `LLM_PROVIDER` (default `ollama`)
- `OLLAMA_BASE_URL` (default `http://localhost:11434`)
- `OLLAMA_MODEL` (default `llama3.2`)
- `LLM_TIMEOUT_SECONDS` (default 20)

## Permission awareness
- Context scope depends on the caller's role (from the JWT).
- The LLM only ever sees the pre-computed context; it cannot query the database.
