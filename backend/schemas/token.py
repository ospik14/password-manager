from pydantic import BaseModel
from datetime import datetime

class TokenBase(BaseModel):
    token: str
    expires_at: datetime