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
        category = cls._infer_category(class_name, base_names, docstring, target_class)

        # Determine Modality
        modality = cls._infer_modality(target_class, docstring, file_name)

        # Extract __init__ params
        params = cls._extract_init_params(target_class)

        # Extract inputs & outputs
        inputs, outputs = cls._extract_io_signatures(target_class, category, docstring, modality)

        display_name = cls._to_display_name(class_name)
        registry_name = cls._to_snake_case(class_name)

        return {
            "name": display_name,
            "raw_class_name": class_name,
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

    @staticmethod
    def _to_display_name(raw_name: str) -> str:
        import re
        if not raw_name:
            return "Custom Block"
        clean = re.sub(r'\.py$', '', raw_name, flags=re.IGNORECASE)
        # If snake_case or kebab-case (e.g. residual_attention_block -> Residual Attention Block)
        if '_' in clean or '-' in clean:
            parts = [p.capitalize() for p in re.split(r'[-_]+', clean) if p]
            return ' '.join(parts)
        # If PascalCase or CamelCase (e.g. ResidualAttentionBlock -> Residual Attention Block)
        s1 = re.sub(r'([A-Z]+)([A-Z][a-z])', r'\1 \2', clean)
        s2 = re.sub(r'([a-z\d])([A-Z])', r'\1 \2', s1)
        return s2.strip()

    @classmethod
    def _infer_category(cls, class_name: str, base_names: list[str], docstring: str, cls_node: ast.ClassDef | None = None) -> str:
        c_upper = class_name.upper()
        b_upper = " ".join(base_names).upper()
        d_upper = docstring.upper()

        # Check methods in class
        method_names = set()
        if cls_node:
            method_names = {n.name for n in cls_node.body if isinstance(n, ast.FunctionDef)}

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
        # Default modality to 'All' as requested by user
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
    def _extract_io_signatures(cls, cls_node: ast.ClassDef, category: str, docstring: str, modality: str = "All") -> tuple[list[str], list[str]]:
        if category == "DATA":
            mod_lower = (modality or "").lower()
            if "image" in mod_lower:
                return [], ["out image [3,32,32]", "out label"]
            if "audio" in mod_lower:
                return [], ["out waveform [16000]", "out label"]
            if "text" in mod_lower:
                return [], ["out token ids", "out label"]
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
