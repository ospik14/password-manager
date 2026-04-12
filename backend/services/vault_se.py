from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4
from schemas.token import TokenPayload
from schemas.vaultItem import VaultItemRequest, VaultItemResponse
from models.db_tables import VaultItem
from core.security import encrypt_data
from repositories.vault_repo import create_item, get_all_items_for_user

async def process_new_item(
    session: AsyncSession, 
    item: VaultItemRequest, 
    user_payload: TokenPayload
):
    cipher_login = await encrypt_data(item.login)
    cipher_password = await encrypt_data(item.password)

    vault_item = VaultItem(
        id=str(uuid4()),
        user_id=user_payload.user_id,
        title=item.title,
        encrypted_login=cipher_login,
        encrypted_password=cipher_password,
        url=item.url
    )

    await create_item(session, vault_item)

async def find_all_items(session: AsyncSession, user_payload: TokenPayload):
    items = await get_all_items_for_user(session, user_payload.user_id)

    return [
        VaultItemResponse(**item)
        for item in items
    ]