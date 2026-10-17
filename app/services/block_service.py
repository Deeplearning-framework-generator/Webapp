from __future__ import annotations

import ast
from typing import Annotated
from fastapi import Depends, HTTPException

from app.models.block import Block
from app.repositories.block_repository import BlockRepository
from app.repositories.type_repository import TypeRepository
from app.schemas.block import (
    BlockCreate,
    BlockDto,
    BlockFilter,
    BlockParsedResponse,
    Param,
)
from app.schemas.common.page import PAGE_SIZE, PageParams, PageWrapper
from app.schemas.type import TypeDto
from app.services.py_parser import PythonBlockParser


def resolve_category(b_type: str | None) -> str:
    if not b_type:
        return "LAYER"
    t = b_type.upper()
    for cat in ["DATA", "LAYER", "MERGE", "LOSS", "CALLBACK"]:
        if cat in t:
            return cat
    if "MODULE" in t or "NN.MODULE" in t:
        return "LAYER"
    return "LAYER"


BLOCK_METADATA: dict[str, dict[str, str]] = {
    "cifar10": {"version": "Built-in", "footer": "Image, used in 1 project"},
    "speech_commands": {"version": "Hugging Face", "footer": "Audio, used in 1 project"},
    "conv_block": {"version": "v3", "footer": "Image, used in 2 projects"},
    "residual_block": {"version": "v1", "footer": "Image, 2 parallel outputs"},
    "patch_embedding": {"version": "v2", "footer": "Image, used in 1 project"},
    "transformer_encoder": {"version": "Built-in", "footer": "Text and image"},
    "spectrogram": {"version": "v1", "footer": "Audio, used in 1 project"},
    "add_op": {"version": "Built-in", "footer": "Any modality"},
    "concat_op": {"version": "Built-in", "footer": "Any modality"},
    "cross_entropy": {"version": "Built-in", "footer": "Classification"},
    "focal_loss": {"version": "v2", "footer": "Custom, uploaded file"},
    "early_stopping": {"version": "v1", "footer": "Any project"},
    "mnist_digits": {"version": "Built-in", "footer": "Image, benchmark dataset"},
    "linear_layer": {"version": "v1", "footer": "Used in 4 projects"},
    "batch_norm2d": {"version": "v2", "footer": "Normalization layer"},
    "max_pooling": {"version": "v1", "footer": "Downsampling layer"},
    "mse_loss": {"version": "Built-in", "footer": "Regression tasks"},
    "model_checkpoint": {"version": "Built-in", "footer": "Model persistence callback"},
}


class BlockService:
    def __init__(
        self,
        block_repo: Annotated[BlockRepository, Depends(BlockRepository)],
        type_repo: Annotated[TypeRepository, Depends(TypeRepository)],
    ):
        self.block_repo = block_repo
        self.type_repo = type_repo

    def _to_dto(self, b: Block) -> BlockDto:
        latest_v = b.versions[0] if b.versions else None
        category = resolve_category(b.type)
        modality = b.modality or "All"

        # Check metadata for standard catalog blocks
        meta = BLOCK_METADATA.get((b.registry_name or "").lower(), {})
        if not meta:
            # Fallback check by lower snake case of name
            clean_name = (b.name or "").lower().replace(" ", "_").replace("-", "")
            for k, v in BLOCK_METADATA.items():
                if k.replace("_", "") == clean_name:
                    meta = v
                    break

        version_label = meta.get("version") or (f"v{latest_v.version}" if latest_v else "v1")
        footer_label = meta.get("footer") or f"{modality}, uploaded file"

        return BlockDto(
            id=b.id,
            name=b.name,
            category=category,
            modality=modality,
            registry_name=b.registry_name,
            description=None,
            footer=footer_label,
            is_builtin=meta.get("version") == "Built-in",
            stars_count=0,
            usage_count=0,
            version=version_label,
            inputs=latest_v.inputs or [] if latest_v else [],
            outputs=latest_v.outputs or [] if latest_v else [],
            latest_code=latest_v.code if latest_v else None,
            create_date=b.create_date,
            create_by=b.create_by,
            update_date=b.update_date,
            update_by=b.update_by,
            delete_date=b.delete_date,
            delete_by=b.delete_by,
        )

    def getBlockList(
        self, block_filters: BlockFilter, page_params: PageParams
    ) -> PageWrapper[BlockDto]:
        count = self.block_repo.count_block_list(block_filters)
        dtos: list[BlockDto] = []

        if count > 0:
            limit = count if (block_filters and block_filters.all) else PAGE_SIZE
            blocks = self.block_repo.search_block_list(
                block_filters, page_params.offset, limit
            )
            for b in blocks:
                dtos.append(self._to_dto(b))

        return PageWrapper.create(params=page_params, data=dtos, total=count)

    def parse_python_code(self, code: str, file_name: str = "module.py") -> BlockParsedResponse:
        try:
            parsed = PythonBlockParser.parse_code(code, file_name)
            return BlockParsedResponse(**parsed)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Failed to parse .py file: {str(e)}")

    def upload_and_create_from_py(
        self, code: str, file_name: str = "custom_module.py"
    ) -> BlockDto:
        parsed = self.parse_python_code(code, file_name)

        params_objs = [
            Param(name=p["name"], type=p.get("type", ""), default=p.get("default", ""))
            for p in parsed.params
        ]

        block_create = BlockCreate(
            name=parsed.name,
            registry_name=parsed.registry_name,
            category=parsed.category,
            base_class=parsed.base_class,
            modality=parsed.modality,
            description=parsed.docstring,
            footer=parsed.footer,
            code=code,
            file_name=file_name,
            version="v1",
            inputs=parsed.inputs,
            outputs=parsed.outputs,
            params=params_objs,
        )

        saved = self.block_repo.save(block_create)
        return self._to_dto(saved)

    def save_block(self, block_create: BlockCreate) -> BlockDto:
        saved = self.block_repo.save(block_create)
        return self._to_dto(saved)

    def validate_block(self, block_create: BlockCreate):
        self._check_structure(block_create)

    def _check_structure(self, block_create: BlockCreate):
        try:
            tree = ast.parse(block_create.code)
        except SyntaxError as e:
            raise HTTPException(422, f"Syntax error on line {e.lineno}: {e.msg}")

        cls = next(
            (n for n in tree.body if isinstance(n, ast.ClassDef) and n.name == block_create.name),
            None,
        )
        if cls is None:
            raise HTTPException(422, f"No class named {block_create.name} in the code")

        methods = {n.name for n in cls.body if isinstance(n, ast.FunctionDef)}
        missing = {"__init__", "forward"} - methods
        if missing:
            raise HTTPException(422, f"Missing method(s): {','.join(sorted(missing))}")

    def get_category_counts(self) -> dict[str, int]:
        return self.block_repo.get_category_counts()

    def get_type_dtos(self) -> list[TypeDto]:
        return self.type_repo.get_all_dto()
