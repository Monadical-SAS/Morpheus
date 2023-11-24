from typing import Any

from pydantic import BaseModel, Extra


class Response(BaseModel):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Any = None

    class Config:
        extra = Extra.allow
