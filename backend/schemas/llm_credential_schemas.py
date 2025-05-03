from pydantic import BaseModel
from schemas.common_schemas import CommonResponse
from utils.types import LLMProviders


class LLMCredentialCreate(BaseModel):
    api_key: str
    label: str
    provider: LLMProviders


class LLMCredentialOut(BaseModel):
    id: int
    user_id: int
    label: str
    provider: LLMProviders


class LLMCredentialResponse(CommonResponse):
    data: LLMCredentialOut

    class Config:
        from_attributes = True
