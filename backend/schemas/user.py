from pydantic import BaseModel, Field
from datetime import datetime

class UserBase(BaseModel):
    email: str = Field(min_length=6, max_length=254)
    

class UserRequest(UserBase):
    password: str = Field(min_length=8, max_length=22)

class UserResponse(UserBase):
    id: str
    email: str
    created_at: datetime