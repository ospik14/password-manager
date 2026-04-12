from pydantic import BaseModel, Field

class VaultItemBase(BaseModel):
    title: str = Field(max_length=100)

class VaultItemRequest(VaultItemBase):
    login: str = Field(max_length=100)
    password: str = Field(min_length=4, max_length=100)
    url: str | None = None

class VaultItemResponse(VaultItemBase):
    id: str

    class Config:
        from_attributes = True