from enum import Enum


class LLMProviders(Enum):
    OPENAI = "openai"
    OLLAMA = "ollama"
    ANTHROPIC = "anthropic"
    PERPLEXITY = "perplexity"
    COHERE = "cohere"
    GROQ = "groq"
    XAI = "xai"
    LM_STUDIO = "lm_studio"
    MISTRAL = "mistral"
    GEMINI = "gemini"
    AZURE = "azure"
    AZURE_AI = "azure_ai"
    VLLM = "vllm"
    HOSTED_VLLM = "hosted_vllm"
    LLAMAFILE = "llamafile"
    HUGGINGFACE = "huggingface"
    DATABRICKS = "databricks"
    WATSONX = "watsonx"
    BEDROCK = "bedrock"

    @classmethod
    def get_providers(cls) -> list[str]:
        return [provider.value for provider in cls]
