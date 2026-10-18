from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import URL

from app.api.router import api_router
from app.config import get_settings
from app.database import sessionmanager
from app.models.base import Base

logger = logging.getLogger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    ds = settings.data_source
    url = URL.create(
        drivername=ds.drivername,
        host=ds.host,
        username=ds.username,
        password=ds.password.get_secret_value() if ds.password else None,
        port=ds.port,
        database=ds.database,
    ).render_as_string(hide_password=False)

    try:
        sessionmanager.init(url, pool_size=ds.pool_size)
        created = sessionmanager.create_missing_tables(Base)
        if created:
            logger.info("Created missing tables: %s", created)
        logger.info("Database connected at %s:%d/%s", ds.host, ds.port, ds.database)
    except Exception as e:
        logger.warning(
            "Could not connect to database (%s:%d/%s): %s. Ensure PostgreSQL container is running.",
            ds.host,
            ds.port,
            ds.database,
            e,
        )
    yield
    sessionmanager.close()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Deep Learning Framework API",
        version="1.0.0",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router)
    return app


app = create_app()