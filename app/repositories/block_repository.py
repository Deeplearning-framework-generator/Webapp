from sqlalchemy.orm import Session

from app.models.block import Block
from app.repositories.base import BaseRepository


class BlockRepository(BaseRepository[Block]):
    def __init__(self, db: Session):
        super().__init__(db, Block)

    def get(self, id: int) -> Block:
        block = super().get(id)
        return block if (block and block.delete_date is None) else None
    