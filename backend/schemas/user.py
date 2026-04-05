from pydantic import BaseModel, Field

class UserRequest(BaseModel):
    email: str = Field(min_length=6, max_length=254)
    password: str = Field(min_length=8, max_length=22)