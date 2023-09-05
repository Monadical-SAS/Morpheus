from pydantic import BaseModel


class PromptRequest(BaseModel):
    prompt: str
    img_size: int = 512
