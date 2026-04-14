from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional

class VaultItemBase(BaseModel):
    title: str = Field(max_length=100)

class VaultItemRequest(VaultItemBase):
    login: str = Field(max_length=100)
    password: str = Field(min_length=4, max_length=100)
    url: Optional[str] = None
    force_save: Optional[bool] = False

class VaultItemResponse(VaultItemBase):
    id: str

    class Config:
        from_attributes = True

class FullVaultItemResponse(VaultItemResponse):
    login: str = Field(max_length=100)
    password: str = Field(min_length=4, max_length=100)
    user_id: str
    url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class UpdatedVaultItem(BaseModel):
    title: Optional[str] = Field(max_length=100, default=None)
    encrypted_login: Optional[str] = Field(max_length=100, default=None)
    encrypted_password: Optional[str] = Field(min_length=4, max_length=100, default=None)
    url: Optional[str] = None