from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.schemas.block import BlockCreate, BlockDto, BlockFilter
from app.schemas.common.page import PageParams, PageWrapper
from app.schemas.type import TypeDto
from app.services.block_service import BlockService

router = APIRouter(prefix="/blocks", tags=["blocks"])

@router.get("/ping")
def ping():
    return {
        "ok" : True
    }

@router.get("", response_model=PageWrapper[BlockDto])
def get_block_list(
    filters: Annotated[BlockFilter, Query()],
    page_params: Annotated[PageParams, Query()],
    service: Annotated[BlockService, Depends()]
):
    pageWrapper = service.getBlockList(filters, page_params)
    return pageWrapper

@router.get("/types", response_model=list[TypeDto])
def get_block_types(
    service: Annotated[BlockService, Depends()]
) -> list[TypeDto]:
    return service.get_type_dtos()
@router.post("/create")
def save_created_block(
    block_create: BlockCreate,
    service: Annotated[BlockService, Depends()]
):
    service.save_block(block_create)
    return ping()