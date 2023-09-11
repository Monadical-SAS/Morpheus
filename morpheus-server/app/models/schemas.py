from enum import Enum
from typing import Any

from pydantic import BaseModel

from app.config import get_settings

settings = get_settings()


class Response(BaseModel):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Any = None


class TaskStatus(str, Enum):
    processing = "Processing"
    success = "Success"
    failed = "Failed"


class TaskResponse(BaseModel):
    task_id: str
    status: TaskStatus
    message: str = "Operation completed successfully"
    data: Any = None
