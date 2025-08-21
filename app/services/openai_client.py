import os
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from openai import OpenAI, APIError, RateLimitError, APIConnectionError, APITimeoutError

MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
EMBED_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-large")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class OpenAIService:
    @staticmethod
    @retry(reraise=True,
           stop=stop_after_attempt(3),
           wait=wait_exponential(multiplier=1, min=1, max=8),
           retry=retry_if_exception_type((APIError, RateLimitError, APIConnectionError, APITimeoutError)))
    def chat(messages: list[dict]) -> str:
        resp = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.2,
        )
        return resp.choices[0].message.content

    @staticmethod
    @retry(reraise=True,
           stop=stop_after_attempt(3),
           wait=wait_exponential(multiplier=1, min=1, max=8),
           retry=retry_if_exception_type((APIError, RateLimitError, APIConnectionError, APITimeoutError)))
    def embed(texts: list[str]) -> list[list[float]]:
        resp = client.embeddings.create(model=EMBED_MODEL, input=texts)
        return [d.embedding for d in resp.data]
