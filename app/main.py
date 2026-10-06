from contextlib import asynccontextmanager, contextmanager

from fastapi import FastAPI
from fastapi.logger import logger
from fastapi.middleware.cors import CORSMiddleware
from pydantic_core import Url
from sqlalchemy import URL
from app.api.router import api_router
from app.config import get_settings
from app.database import sessionmanager
from app.models.base import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    ds = settings.data_source
    url = URL.create(
        drivername = ds.drivername,
        host=ds.host,
        username= ds.username,
        password= ds.password.get_secret_value() if ds.password else None,
        port = ds.port,
        database = ds.database

    ).render_as_string(hide_password=False)
    sessionmanager.init(url, pool_size=ds.pool_size)
    
    created = sessionmanager.create_missing_tables(Base)
    if created:
        logger.debug(f"Created missing tables: {created}")
    yield
    sessionmanager.close()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router)
    return app

app = create_app()