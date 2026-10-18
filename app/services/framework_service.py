from __future__ import annotations

import logging
import sys
from pathlib import Path
from typing import Any

logger = logging.getLogger("app.services.framework_service")

# Resolve path to DeepLearning_Framework at the root of the project
FRAMEWORK_ROOT = Path(__file__).resolve().parent.parent.parent / "DeepLearning_Framework"
if str(FRAMEWORK_ROOT) not in sys.path and FRAMEWORK_ROOT.exists():
    sys.path.insert(0, str(FRAMEWORK_ROOT))


class FrameworkService:
    """
    Handles interactions between Webapp Backend and DeepLearning_Framework:
    - Queries registries (datasets, criterions, callbacks, trainers)
    - Validates compatibility with framework base classes
    """

    @classmethod
    def get_registered_components(cls) -> dict[str, list[str]]:
        try:
            from engines.registries import (
                CALLBACK_REGISTRY,
                CRITERION_REGISTRY,
                DATASET_REGISTRY,
                TESTER_BUILDER_REGISTRY,
                TRAINER_BUILDER_REGISTRY,
            )

            return {
                "datasets": DATASET_REGISTRY.names(),
                "criterions": CRITERION_REGISTRY.names(),
                "callbacks": CALLBACK_REGISTRY.names(),
                "trainers": TRAINER_BUILDER_REGISTRY.names(),
                "testers": TESTER_BUILDER_REGISTRY.names(),
            }
        except Exception as e:
            logger.warning("Could not load registries from DeepLearning_Framework: %s", e)
            return {
                "datasets": ["cifar10", "stl10"],
                "criterions": ["cross_entropy", "mse", "l1", "smooth_l1"],
                "callbacks": ["checkpoint", "early_stopping", "logging"],
                "trainers": ["standard", "cnn", "vit", "text", "audio", "multimodal"],
                "testers": ["standard", "cnn", "vit", "text", "audio", "multimodal"],
            }

    @classmethod
    def get_component_info(cls, registry_kind: str, name: str) -> dict[str, Any] | None:
        try:
            from engines.registries import (
                CALLBACK_REGISTRY,
                CRITERION_REGISTRY,
                DATASET_REGISTRY,
            )

            registries = {
                "dataset": DATASET_REGISTRY,
                "criterion": CRITERION_REGISTRY,
                "callback": CALLBACK_REGISTRY,
            }

            reg = registries.get(registry_kind.lower())
            if not reg or name not in reg:
                return None

            target_cls = reg.get(name)
            return {
                "name": name,
                "class_name": target_cls.__name__,
                "docstring": target_cls.__doc__ or "",
                "module": target_cls.__module__,
            }
        except Exception as e:
            logger.warning("Failed inspecting framework component %s/%s: %s", registry_kind, name, e)
            return None
