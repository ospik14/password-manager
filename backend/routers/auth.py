from fastapi import APIRouter, HTTPException, Response
from schemas.user import UserRequest
from depends import db_dep, form_dep
from core.exceptions import UserExists, InvalidCredentialsError
from services.auth_se import register_user, authenticate_user

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

async def set_refresh_token(response: Response, token: str):
    response.set_cookie(
            key='refresh_token',
            value=token,
            httponly=True,
            samesite='lax'
        )

@router.post('/register', status_code=201)
async def add_person_data(session: db_dep, user_request: UserRequest, response: Response):
    tokens = await register_user(session, user_request)
    await set_refresh_token(response, tokens.refresh_token)

    return {
        'access_token': tokens.access_token,
        'token_type': 'bearer'
    }
    

@router.post('/login')
async def login(session: db_dep, request_form: form_dep, response: Response):
    tokens = await authenticate_user(
        session, 
        request_form
    )
    await set_refresh_token(response, tokens.refresh_token)

    return {
        'access_token': tokens.access_token,
        'token_type': 'bearer'
    }
    

