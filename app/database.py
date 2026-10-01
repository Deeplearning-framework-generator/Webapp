from contextlib import contextmanager
from typing import Generator, Iterator

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.utils import log_and_raise


class DatabaseSessionManager:
    def __init__(self) -> None:
        self._engine = None
        self._sessionmaker = None
    def __init__(self, db_url: str, **engine_kwargs) -> None:
        self._engine = create_engine(db_url, pool_pre_ping=True, **engine_kwargs)
        self._sessionmaker = sessionmaker(bind=self._engine, expire_on_commit=False)

    def close(self) -> None:
        if self._engine is not None:
            self._engine.dispose()
            self._engine = None
            self._sessionmaker = None

    @contextmanager
    def session(self) -> Generator[Session]:
        if self._sessionmaker is None:
            log_and_raise(RuntimeError(f"{__class__.__name__()} is not initialized"))
        db = self._sessionmaker()
        try:
            yield db
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

sessionmanager = DatabaseSessionManager()