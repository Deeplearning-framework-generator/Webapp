

from fastapi import APIRouter
from ... import utils

api_router = APIRouter(prefix="/v1")

utils.include_routers(api_router,__package__)
