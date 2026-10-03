from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.schemas.block import BlockDto, BlockFilter
from app.schemas.common.page import PageParams, PageWrapper
from app.services.block_service import BlockService
from app.services.base import provide_service

router = APIRouter(prefix="/blocks", tags=["blocks"])

@router.get("/ping")
def ping():
    return {
        "ok" : True
    }

@router.get("", response_model=PageWrapper[BlockDto])
def get_block_list(
    filters: Annotated[BlockFilter, Query()],
    page_params: Annotated[int, Query()],
    service: Annotated[BlockService, Depends()]
):
    pageWrapper = service.getBlockList(filters, page_params)
    return pageWrapper
    