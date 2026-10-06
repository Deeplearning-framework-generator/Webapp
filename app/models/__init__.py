import importlib
import pkgutil

from fastapi.logger import logger
from .base import Base

for _, module_name, _ in pkgutil.iter_modules(__path__):
    logger.debug(f"Importing module: {module_name}")
    importlib.import_module(f"{__name__}.{module_name}")
    
__all__ = ["Base"]
