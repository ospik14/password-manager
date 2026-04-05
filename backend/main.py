from fastapi import FastAPI
from backend.routers import auth

app = FastAPI()

app.include_router(auth.router)