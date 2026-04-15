from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import auth, vault
from core.exceptions import *

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

app.include_router(auth.router)
app.include_router(vault.router)

@app.exception_handler(InvalidCredentialsError)
async def authentication_failed(request: Request, exc: InvalidCredentialsError):
    return JSONResponse(status_code=401, content={'detail': 'Incorrect login or password!'})

@app.exception_handler(UserExists)
async def user_exist(request: Request, exc: UserExists):
    return JSONResponse(status_code=400, content={'detail': 'A user with this address already exists!'})

@app.exception_handler(NotFoundError)
async def user_exist(request: Request, exc: NotFoundError):
    return JSONResponse(status_code=404, content={'detail': 'data not found!'})

@app.exception_handler(UnprocessableContent)
async def user_exist(request: Request, exc: NotFoundError):
    return JSONResponse(status_code=422, content={'detail': 'incorrect data!'})

@app.exception_handler(PasswordLeak)
async def user_exist(request: Request, exc: PasswordLeak):
    return JSONResponse(status_code=400, content={'detail': 'PWNED_PASSWORD!', 'message': str(exc)})
