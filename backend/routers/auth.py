from fastapi import APIRouter, HTTPException
from backend.schemas.user import UserRequest
from backend.depends import db_dep
from backend.core.exceptions import UserExists
from backend.services.auth_se import register_user

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

@router.post('/register', status_code=201)
async def add_person_data(session: db_dep, user_request: UserRequest):
    try:
        await register_user(session, user_request)
    except UserExists:
        raise HTTPException(status_code=400, detail='the person already exists')
    

