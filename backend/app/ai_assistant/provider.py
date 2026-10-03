"""Provider-agnostic LLM interface with a graceful fallback.

Ollama is the preferred provider. If the assistant is disabled or the provider
is unreachable, `generate` returns a structured `unavailable` result so the API
can fall back to a deterministic, data-grounded summary instead of failing.
"""

from __future__ import annotations

from app.core.config import settings


class LLMProvider:
    name = "base"

    def generate(self, prompt: str, context: dict | None = None) -> dict:
        raise NotImplementedError


class OllamaProvider(LLMProvider):
    name = "ollama"

    def __init__(self, base_url: str, model: str, timeout: int) -> None:
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.timeout = timeout

    def generate(self, prompt: str, context: dict | None = None) -> dict:
        try:
            import httpx

            r = httpx.post(
                f"{self.base_url}/api/generate",
                json={"model": self.model, "prompt": prompt, "stream": False},
                timeout=self.timeout,
            )
            r.raise_for_status()
            text = (r.json().get("response") or "").strip()
            if not text:
                return {"text": "", "status": "unavailable", "provider": self.name}
            return {"text": text, "status": "available", "provider": self.name, "model": self.model}
        except Exception as exc:  # network, timeout, bad response
            return {
                "text": "",
                "status": "unavailable",
                "provider": self.name,
                "error": str(exc)[:200],
            }


class DisabledProvider(LLMProvider):
    name = "disabled"

    def generate(self, prompt: str, context: dict | None = None) -> dict:
        return {"text": "", "status": "disabled", "provider": self.name}


class ProviderFactory:
    @staticmethod
    def get_provider() -> LLMProvider:
        if not settings.ENABLE_LLM_ASSISTANT:
            return DisabledProvider()
        if settings.LLM_PROVIDER == "ollama":
            return OllamaProvider(
                settings.OLLAMA_BASE_URL, settings.OLLAMA_MODEL, settings.LLM_TIMEOUT_SECONDS
            )
        return DisabledProvider()
