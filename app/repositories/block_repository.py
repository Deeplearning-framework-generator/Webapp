from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.block import Block, BlockVersion
from app.repositories.base import BaseRepository
from app.schemas.block import BlockCreate


class BlockRepository(BaseRepository[Block]):
    def __init__(self, db: Annotated[Session, Depends(get_db)]):
        super().__init__(db, Block)
    def get_latest_version(self, block_id: int) -> BlockVersion | None:
        return self.db.query(BlockVersion).filter_by(block_id=block_id).order_by(BlockVersion.version.desc()).first()
    def save(self, block_create: BlockCreate):
        block = Block(
            name= block_create.name,
            registry_name= block_create.registry_name,
            type= block_create.base,   
        )
        
        block.versions.append(
            BlockVersion(
                version= 1,
                code = block_create.code,
                params = [p.model_dump() for p in block_create.params],
                
            )
        )
        self.db.add(block)
        self.db.commit()
        self.db.refresh(block)
        return block
    
    def get(self, id: int) -> Block | None:
        block = super().get(id)
        return block if (block and block.delete_date is None) else None
    