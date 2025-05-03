from typing import Any, Optional

from pydantic import BaseModel


class CommonResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
