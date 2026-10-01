from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router


def create_app() -> FastAPI:
    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        # allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router)
    return app

app = create_app()