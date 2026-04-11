from fastapi import APIRouter
from depends import db_dep, user_dep
from schemas.vaultIiem import VaultItemRequest
from services.vault_se import process_new_item

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