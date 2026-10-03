# provider.py (stub)
class LLMProvider:
    def generate(self, prompt: str, context: dict = None) -> dict:
        raise NotImplementedError

class OllamaProvider(LLMProvider):
    def generate(self, prompt: str, context: dict = None) -> dict:
        return {"text": "ollama_not_configured", "status": "unavailable"}

class ProviderFactory:
    @staticmethod
    def get_provider(name: str = "ollama"):
        return OllamaProvider()
