from pydantic import BaseModel
from datetime import datetime

class TokenBase(BaseModel):
    access_token: str
    refresh_token: str

class TokenPayload(BaseModel):
    user_id: str
    token_type: str