from contextlib import contextmanager
from typing import Generator, Iterator

from fastapi.logger import logger
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.utils import log_and_raise


class DatabaseSessionManager:
    def __init__(self) -> None:
        self._engine = None
        self._sessionmaker = None
    def init(self, db_url: str, **engine_kwargs) -> None:
        self._engine = create_engine(db_url, pool_pre_ping=True, **engine_kwargs)
        self._sessionmaker = sessionmaker(bind=self._engine, expire_on_commit=False)

    def close(self) -> None:
        if self._engine is not None:
            self._engine.dispose()
            self._engine = None
            self._sessionmaker = None
    
    def create_missing_tables(self, base: type[DeclarativeBase]) -> list[str]:
        """Create any tables defined on `base` that don't exist yet.
        Returns the names of the tables it had to create."""
        if self._engine is None:
            log_and_raise(RuntimeError(f"{self.__class__.__name__} is not initialized"))
        logger.debug(sorted(base.metadata.tables))
        existing = set(inspect(self._engine).get_table_names())
        missing = [name for name in base.metadata.tables if name not in existing]

        if missing:
            # checkfirst=True is the default, so this still skips anything that exists
            base.metadata.create_all(bind=self._engine, checkfirst=True)
        return missing

    @contextmanager
    def session(self) -> Generator[Session]:
        if self._sessionmaker is None:
            log_and_raise(RuntimeError(f"{__class__.__name__} is not initialized"))
        db = self._sessionmaker()
        try:
            yield db
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

sessionmanager = DatabaseSessionManager()

def get_db() -> Iterator[Session]:
    with sessionmanager.session() as db:
        yield db
