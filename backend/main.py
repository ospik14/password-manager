from fastapi import FastAPI
from routers import auth, vault

app = FastAPI()

app.include_router(auth.router)
app.include_router(vault.router)