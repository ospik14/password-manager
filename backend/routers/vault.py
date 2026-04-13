from fastapi import APIRouter
from depends import db_dep, user_dep
from schemas.vaultItem import VaultItemRequest, UpdatedVaultItem
from services.vault_se import process_new_item, find_all_items, find_item_by_id, change_item_data

router = APIRouter(
    prefix='/vault',
    tags=['vault']
)

@router.post('/api/items/')
async def create_items(
    session: db_dep, 
    item_request: VaultItemRequest, 
    user_payload: user_dep
):
    await process_new_item(session, item_request, user_payload)

@router.get('/api/items/')
async def get_my_items(session: db_dep, user_payload: user_dep):
    return await find_all_items(session, user_payload)

@router.get('/api/items/{id}')
async def get_item_by_id(session: db_dep, id: str, user_payload: user_dep):
    return await find_item_by_id(session, id, user_payload)

@router.patch('/api/items/{id}')
async def update_item(
    session: db_dep, 
    id: str, 
    item_update: UpdatedVaultItem, 
    user_payload: user_dep
):
    return await change_item_data(session, id, item_update, user_payload)
