from typing import Any

from pydantic import BaseModel


class Response(BaseModel):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Any = None
