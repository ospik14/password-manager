from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4
from schemas.token import TokenPayload
from schemas.vaultItem import VaultItemRequest, VaultItemResponse, FullVaultItemResponse, \
UpdatedVaultItem
from models.db_tables import VaultItem
from core.security import encrypt_data, decrypt_data
from repositories.vault_repo import create_item, get_all_items_for_user, get_item_by_id, \
update_item, delete_item
from core.exceptions import NotFoundError, UnprocessableContent, PasswordLeak
from clients.hibp_client import check_password_leak

async def process_new_item(
    session: AsyncSession, 
    item: VaultItemRequest, 
    user_payload: TokenPayload
):
    leaks_count = await check_password_leak(item.password)
    if not item.force_save and leaks_count > 0:
        raise PasswordLeak(f'Цей пароль знайдено у витоках {leaks_count} разів.')

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

async def find_item_by_id(session: AsyncSession, id: str, user_payload: TokenPayload):
    item = await get_item_by_id(session, id, user_payload.user_id)

    if not item: raise NotFoundError

    decrypted_login = await decrypt_data(item.encrypted_login)
    decrypted_password = await decrypt_data(item.encrypted_password)

    return FullVaultItemResponse(
            id=item.id,
            user_id=item.user_id,
            title=item.title,
            login=decrypted_login,
            password=decrypted_password,
            url=item.url,
            created_at=item.created_at,
            updated_at=item.updated_at
        )
    
async def change_item_data(
    session: AsyncSession, 
    id: str, 
    item_update: UpdatedVaultItem,
    user_payload: TokenPayload
):
    update_data = item_update.model_dump(exclude_unset=True)

    if not update_data:
        raise UnprocessableContent
    
    if 'encrypted_login' in update_data:
        cipher_login = await encrypt_data(update_data['encrypted_login'])
        update_data['encrypted_login'] = cipher_login

    if 'encrypted_password' in update_data:
        cipher_password = await encrypt_data(update_data['encrypted_password'])
        update_data['encrypted_password'] = cipher_password

    new_item_data = await update_item(session, id, user_payload.user_id, update_data)

    if not new_item_data: raise NotFoundError

    decrypted_login = await decrypt_data(new_item_data.encrypted_login)
    decrypted_password = await decrypt_data(new_item_data.encrypted_password)

    return FullVaultItemResponse(
            id=new_item_data.id,
            user_id=new_item_data.user_id,
            title=new_item_data.title,
            login=decrypted_login,
            password=decrypted_password,
            url=new_item_data.url,
            created_at=new_item_data.created_at,
            updated_at=new_item_data.updated_at
        )
        
async def remove_item(
    session: AsyncSession,
    id: str, 
    user_payload: TokenPayload
):
    await delete_item(session, id, user_payload.user_id)