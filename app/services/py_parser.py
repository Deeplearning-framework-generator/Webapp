from __future__ import annotations

import ast
from typing import Any


class PythonBlockParser:
    """
    Parses Python source code (.py files) to extract Deep Learning Framework blocks:
    - Finds class definitions and determines base classes (nn.Module, Dataset, CallBack, Loss)
    - Automatically classifies category (DATA, LAYER, MERGE, LOSS, CALLBACK)
    - Infers modality (Image, Audio, Text, Classification, Multimodal, All)
    - Extracts __init__ parameters (names, defaults, type hints)
    - Extracts forward() inputs and outputs signatures
    """

    @classmethod
    def parse_code(cls, code: str, file_name: str = "custom_module.py") -> dict[str, Any]:
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            raise ValueError(f"Syntax error on line {e.lineno}: {e.msg}") from e

        classes = [node for node in tree.body if isinstance(node, ast.ClassDef)]
        if not classes:
            raise ValueError("No class definitions found in the provided Python code.")

        # Find the most prominent block class (prefer classes inheriting from known DL bases)
        target_class = classes[0]
        for c in classes:
            base_names = [cls._get_base_name(b) for b in c.bases]
            if any(b in {"Module", "nn.Module", "Dataset", "CallBack", "BaseCallBack", "Loss", "Criterion"} for b in base_names):
                target_class = c
                break

        class_name = target_class.name
        base_names = [cls._get_base_name(b) for b in target_class.bases]
        docstring = ast.get_docstring(target_class) or ""

        # Determine Category
        category = cls._infer_category(class_name, base_names, docstring)

        # Determine Modality
        modality = cls._infer_modality(target_class, docstring, file_name)

        # Extract __init__ params
        params = cls._extract_init_params(target_class)

        # Extract inputs & outputs
        inputs, outputs = cls._extract_io_signatures(target_class, category, docstring)

        registry_name = cls._to_snake_case(class_name)

        return {
            "name": class_name,
            "registry_name": registry_name,
            "category": category,
            "base_class": base_names[0] if base_names else "object",
            "modality": modality,
            "docstring": docstring,
            "params": params,
            "inputs": inputs,
            "outputs": outputs,
            "file_name": file_name,
            "version": "v1",
            "footer": f"{modality}, uploaded file" if modality != "All" else "Custom, uploaded file",
        }

    @staticmethod
    def _get_base_name(node: ast.expr) -> str:
        if isinstance(node, ast.Name):
            return node.id
        if isinstance(node, ast.Attribute):
            val = node.value
            prefix = val.id if isinstance(val, ast.Name) else ""
            return f"{prefix}.{node.attr}" if prefix else node.attr
        return ""

    @staticmethod
    def _to_snake_case(name: str) -> str:
        import re
        s1 = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", name)
        return re.sub("([a-z0-9])([A-Z])", r"\1_\2", s1).lower()

    @classmethod
    def _infer_category(cls, class_name: str, base_names: list[str], docstring: str) -> str:
        c_upper = class_name.upper()
        b_upper = " ".join(base_names).upper()
        d_upper = docstring.upper()

        if any("DATASET" in b or "DATA" in b for b in [b_upper, c_upper]):
            return "DATA"
        if any("CALLBACK" in b for b in [b_upper, c_upper]):
            return "CALLBACK"
        if any("LOSS" in b or "CRITERION" in b for b in [b_upper, c_upper]):
            return "LOSS"
        if any(m in c_upper for m in ["CONCAT", "MERGE", "ADD", "JOIN", "FUSION"]):
            return "MERGE"
        if any("MODULE" in b or "LAYER" in b or "BLOCK" in c_upper or "ENCODER" in c_upper for b in [b_upper, c_upper]):
            return "LAYER"
        if "LOSS" in d_upper:
            return "LOSS"
        if "CALLBACK" in d_upper:
            return "CALLBACK"
        return "LAYER"

    @classmethod
    def _infer_modality(cls, cls_node: ast.ClassDef, docstring: str, file_name: str) -> str:
        text_corpus = (cls_node.name + " " + docstring + " " + file_name).lower()
        for method in cls_node.body:
            if isinstance(method, ast.FunctionDef):
                text_corpus += " " + " ".join(arg.arg for arg in method.args.args)
                for stmt in ast.walk(method):
                    if isinstance(stmt, ast.Constant) and isinstance(stmt.value, str):
                        text_corpus += " " + stmt.value.lower()

        is_audio = any(w in text_corpus for w in ["audio", "waveform", "spectrogram", "hz", "sampling_rate", "sound"])
        is_image = any(w in text_corpus for w in ["image", "img", "pixel", "conv2d", "b,c,h,w", "b, 3, h, w", "patch"])
        is_text = any(w in text_corpus for w in ["text", "token", "vocab", "nlp", "sentence", "seq_len"])

        if sum([is_audio, is_image, is_text]) >= 2:
            return "Text and image" if (is_text and is_image) else "Multimodal"
        if is_image:
            return "Image"
        if is_audio:
            return "Audio"
        if is_text:
            return "Text"
        if "classif" in text_corpus:
            return "Classification"
        return "All"

    @classmethod
    def _extract_init_params(cls, cls_node: ast.ClassDef) -> list[dict[str, str]]:
        init_fn = next((n for n in cls_node.body if isinstance(n, ast.FunctionDef) and n.name == "__init__"), None)
        if not init_fn:
            return []

        params: list[dict[str, str]] = []
        args = init_fn.args.args
        defaults = init_fn.args.defaults
        offset = len(args) - len(defaults)

        for i, arg in enumerate(args):
            if arg.arg in {"self", "cls"}:
                continue
            default_val = ""
            default_idx = i - offset
            if default_idx >= 0 and default_idx < len(defaults):
                default_val = ast.unparse(defaults[default_idx])

            type_hint = ast.unparse(arg.annotation) if arg.annotation else ""
            params.append({
                "name": arg.arg,
                "type": type_hint,
                "default": default_val
            })
        return params

    @classmethod
    def _extract_io_signatures(cls, cls_node: ast.ClassDef, category: str, docstring: str) -> tuple[list[str], list[str]]:
        if category == "DATA":
            return [], ["out data", "out label"]

        if category == "CALLBACK":
            return ["runs on lifecycle hook"], ["no connections"]

        if category == "LOSS":
            return ["in pred, target"], ["ends the canvas"]

        # Check forward method for LAYER / MERGE
        forward_fn = next((n for n in cls_node.body if isinstance(n, ast.FunctionDef) and n.name == "forward"), None)
        if not forward_fn:
            return ["in [B, ...]"], ["out [B, ...]"]

        arg_names = [a.arg for a in forward_fn.args.args if a.arg not in {"self", "cls"}]

        # Try to infer shape from docstring or arg names
        inputs: list[str] = []
        if len(arg_names) == 1:
            inputs = [f"in {arg_names[0]}"]
        elif len(arg_names) > 1:
            inputs = [f"in {', '.join(arg_names)}"]
        else:
            inputs = ["in [B, ...]"]

        # Check for standard image convention
        if any(w in docstring.lower() for w in ["b,c,h,w", "b, c, h, w"]):
            inputs = ["in [B,C,H,W]"]
            outputs = ["out [B,C,H,W]"]
        elif any(w in docstring.lower() for w in ["b,n,d", "b, n, d"]):
            inputs = ["in [B,N,D]"]
            outputs = ["out [B,N,D]"]
        elif category == "MERGE":
            inputs = [f"in {', '.join(arg_names) if arg_names else '2 or more'}"]
            outputs = ["out joined"]
        else:
            outputs = ["out [B, ...]"]

        return inputs, outputs
