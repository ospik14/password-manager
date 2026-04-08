from pydantic import BaseModel
from datetime import datetime

class TokenBase(BaseModel):
    access_token: str
    refresh_token: str