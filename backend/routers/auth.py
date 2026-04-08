from fastapi import APIRouter, HTTPException, Response
from schemas.user import UserRequest
from depends import db_dep
from core.exceptions import UserExists
from services.auth_se import register_user

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

@router.post('/register', status_code=201)
async def add_person_data(session: db_dep, user_request: UserRequest, response: Response):
    try:
        tokens = await register_user(session, user_request)

        response.set_cookie(
            key='refresh_token',
            value=tokens.refresh_token,
            httponly=True,
            samesite='lax'
        )

        return {
            'access_token': tokens.access_token,
            'token_type': 'bearer'
        }
    
    except UserExists:
        raise HTTPException(status_code=400, detail='the person already exists')
    

