from fastapi import APIRouter
from depends import db_dep, user_dep
from schemas.vaultItem import VaultItemRequest
from services.vault_se import process_new_item, find_all_items

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

