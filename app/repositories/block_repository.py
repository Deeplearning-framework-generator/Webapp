from __future__ import annotations

from typing import Annotated
from fastapi import Depends
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.block import Block, BlockVersion
from app.repositories.base import BaseRepository
from app.schemas.block import BlockCreate, BlockFilter


class BlockRepository(BaseRepository[Block]):
    def __init__(self, db: Annotated[Session, Depends(get_db)]):
        super().__init__(db, Block)

    def get_latest_version(self, block_id: int) -> BlockVersion | None:
        return (
            self.db.query(BlockVersion)
            .filter_by(block_id=block_id)
            .order_by(BlockVersion.version.desc())
            .first()
        )

    def count_block_list(self, filters: BlockFilter | None = None) -> int:
        stmt = select(func.count(Block.id)).where(Block.delete_date.is_(None))
        stmt = self._apply_filters(stmt, filters)
        return self.db.scalar(stmt) or 0

    def search_block_list(
        self, filters: BlockFilter | None, offset: int = 0, limit: int = 12
    ) -> list[Block]:
        stmt = (
            select(Block)
            .options(joinedload(Block.versions))
            .where(Block.delete_date.is_(None))
        )
        stmt = self._apply_filters(stmt, filters)

        # Apply sorting: Default to newest first (id DESC)
        if filters and filters.sort == "name":
            stmt = stmt.order_by(Block.name.asc())
        elif filters and filters.sort == "oldest":
            stmt = stmt.order_by(Block.id.asc())
        else:
            stmt = stmt.order_by(Block.id.desc())

        stmt = stmt.offset(offset).limit(limit)
        return list(self.db.scalars(stmt).unique())

    def _apply_filters(self, stmt, filters: BlockFilter | None):
        if not filters:
            return stmt

        # Category filter (mapped to Block.type)
        cat = filters.category or filters.kind
        if cat and cat.upper() != "ALL":
            cat_upper = cat.upper()
            stmt = stmt.where(
                or_(
                    func.upper(Block.type) == cat_upper,
                    func.upper(Block.type).like(f"%{cat_upper}%")
                )
            )

        # Modality filter
        if filters.modality and filters.modality.upper() != "ALL":
            mod_val = filters.modality.lower()
            stmt = stmt.where(
                or_(
                    func.lower(Block.modality) == mod_val,
                    func.lower(Block.modality).like(f"%{mod_val}%")
                )
            )

        # Search query
        if filters.q and filters.q.strip():
            query_str = f"%{filters.q.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(Block.name).ilike(query_str),
                    func.lower(Block.type).ilike(query_str),
                    func.lower(Block.registry_name).ilike(query_str),
                    func.lower(Block.modality).ilike(query_str),
                )
            )

        return stmt

    def save(self, block_create: BlockCreate) -> Block:
        # Determine stored type
        b_type = (block_create.category or "LAYER").upper()
        if block_create.base_class and block_create.base_class not in {"object", "nn.Module"}:
            b_type = block_create.category.upper()

        existing_block: Block | None = None
        if block_create.replace_existing:
            if block_create.existing_block_id:
                existing_block = self.db.query(Block).filter(Block.id == block_create.existing_block_id, Block.delete_date.is_(None)).first()
            if not existing_block and block_create.name:
                clean_name = block_create.name.strip().lower()
                existing_block = (
                    self.db.query(Block)
                    .filter(func.lower(Block.name) == clean_name, Block.delete_date.is_(None))
                    .order_by(Block.id.desc())
                    .first()
                )

        if existing_block:
            # Update existing block metadata
            existing_block.update_date = func.now()
            if block_create.modality and block_create.modality != "All":
                existing_block.modality = block_create.modality
            if b_type:
                existing_block.type = b_type

            # Calculate next integer version number
            max_v = max([v.version for v in existing_block.versions], default=0)
            next_version_num = max(1, max_v + 1)

            new_version = BlockVersion(
                block_id=existing_block.id,
                version=next_version_num,
                code=block_create.code,
                params=[p.model_dump() for p in block_create.params] if block_create.params else [],
                inputs=block_create.inputs or [],
                outputs=block_create.outputs or [],
                create_date=func.now(),
            )
            existing_block.versions.insert(0, new_version)
            self.db.add(new_version)
            self.db.commit()
            self.db.refresh(existing_block)
            return existing_block

        # Otherwise, create new Block
        block = Block(
            name=block_create.name,
            registry_name=block_create.registry_name or block_create.name.lower().replace(" ", "_"),
            type=b_type,
            modality=block_create.modality or "All",
            create_date=func.now(),
        )

        version = BlockVersion(
            version=1,
            code=block_create.code,
            params=[p.model_dump() for p in block_create.params] if block_create.params else [],
            inputs=block_create.inputs or [],
            outputs=block_create.outputs or [],
            create_date=func.now(),
        )
        block.versions.append(version)

        self.db.add(block)
        self.db.commit()
        self.db.refresh(block)
        return block

    def get_category_counts(self) -> dict[str, int]:
        categories = ["DATA", "LAYER", "MERGE", "LOSS", "CALLBACK"]
        counts: dict[str, int] = {"All": 0}
        for cat in categories:
            counts[cat] = 0

        rows = (
            self.db.query(Block.type, func.count(Block.id))
            .filter(Block.delete_date.is_(None))
            .group_by(Block.type)
            .all()
        )
        total = 0
        for t, cnt in rows:
            if t:
                t_upper = t.upper()
                matched = False
                for cat in categories:
                    if cat in t_upper:
                        counts[cat] += cnt
                        matched = True
                        break
                if not matched:
                    counts["LAYER"] += cnt
                total += cnt
        counts["All"] = total
        return counts