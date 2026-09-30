import importlib
import logging
import pkgutil
from types import ModuleType

from fastapi import APIRouter

log = logging.getLogger(__name__)


def include_routers(
    target: APIRouter,
    package: str | ModuleType,
    *,
    attr: str = "router",
    skip: frozenset[str] = frozenset({"router"}),
) -> list[str]:
    pkg = importlib.import_module(package) if isinstance(package, str) else package

    included: list[str] = []
    for info in sorted(pkgutil.iter_modules(pkg.__path__), key=lambda m: m.name):
        if info.name in skip or info.name.startswith("_"):
            continue
        module = importlib.import_module(f"{pkg.__name__}.{info.name}")
        sub = getattr(module, attr, None)
        if not isinstance(sub, APIRouter):
            log.warning("%s.%s has no APIRouter named %r, skipped", pkg.__name__, info.name, attr)
            continue
        target.include_router(sub)
        included.append(info.name)

    log.info("Loaded routers from %s: %s", pkg.__name__, ", ".join(included) or "none")
    return included