from fastapi import APIRouter, HTTPException, Response
from schemas.user import UserRequest
from depends import db_dep, form_dep
from core.exceptions import UserExists
from services.auth_se import register_user, authenticate_user

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
    

@router.get('/login')
async def login(session: db_dep, request_form: form_dep):
    await authenticate_user(
        session, 
        UserRequest(
            email=request_form.username,
            password=request_form.password
        )
    )
