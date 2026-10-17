from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.schemas.block import (
    BlockCreate,
    BlockDto,
    BlockFilter,
    BlockParsedResponse,
    CodeUploadRequest,
)
from app.schemas.common.page import PageParams, PageWrapper
from app.schemas.type import TypeDto
from app.services.block_service import BlockService

router = APIRouter(prefix="/blocks", tags=["blocks"])


@router.get("/ping")
def ping():
    return {"ok": True}


@router.get("", response_model=PageWrapper[BlockDto])
def get_block_list(
    service: Annotated[BlockService, Depends()],
    filters: Annotated[BlockFilter, Depends()],
    page_params: Annotated[PageParams, Depends()],
) -> PageWrapper[BlockDto]:
    """Retrieve paginated and filtered list of blocks."""
    return service.getBlockList(filters, page_params)


@router.get("/counts")
def get_category_counts(
    service: Annotated[BlockService, Depends()],
) -> dict[str, int]:
    """Retrieve block counts broken down by category (DATA, LAYER, MERGE, LOSS, CALLBACK, All)."""
    return service.get_category_counts()


@router.get("/framework-components")
def get_framework_components() -> dict[str, list[str]]:
    """Retrieve registries and available components from DeepLearning_Framework."""
    from app.services.framework_service import FrameworkService
    return FrameworkService.get_registered_components()


@router.post("/upload-py", response_model=BlockDto)
async def upload_python_file(
    service: Annotated[BlockService, Depends()],
    file: UploadFile = File(...),
) -> BlockDto:
    """
    Upload a Python (.py) file, inspect its PyTorch / Dataset / Callback class via AST,
    and automatically create a new block library entry in DB.
    """
    if not file.filename or not file.filename.endswith(".py"):
        raise HTTPException(status_code=400, detail="Only .py files are supported.")

    content = await file.read()
    code_text = content.decode("utf-8", errors="replace")

    return service.upload_and_create_from_py(
        code=code_text, file_name=file.filename
    )


@router.post("/parse-code", response_model=BlockParsedResponse)
def parse_code_snippet(
    req: CodeUploadRequest,
    service: Annotated[BlockService, Depends()],
) -> BlockParsedResponse:
    """
    Parse Python code string without saving to DB.
    Useful for live preview and validation in upload modal.
    """
    return service.parse_python_code(req.code, req.file_name)


@router.post("/create", response_model=BlockDto)
def save_created_block(
    block_create: BlockCreate,
    service: Annotated[BlockService, Depends()],
) -> BlockDto:
    """Create and persist a new block with code and metadata."""
    return service.save_block(block_create)


@router.post("/validate")
def validate_block(
    block_create: BlockCreate,
    service: Annotated[BlockService, Depends()],
):
    """Validate structure of python block code."""
    service.validate_block(block_create)
    return {"ok": True}


@router.get("/types", response_model=list[TypeDto])
def get_block_types(
    service: Annotated[BlockService, Depends()],
) -> list[TypeDto]:
    return service.get_type_dtos()