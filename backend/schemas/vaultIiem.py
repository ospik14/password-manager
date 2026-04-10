from pydantic import BaseModel, Field

class VaultItemRequest(BaseModel):
    title: str = Field(max_length=100)
    login: str = Field(max_length=100)
    password: str = Field(min_length=4, max_length=100)
    url: str | None = None