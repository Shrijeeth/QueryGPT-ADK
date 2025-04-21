import json
import re


def parse_json(json_str: str) -> dict | None:
    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        return None


def parse_json_markdown(json_str: str) -> dict | None:
    try:
        cleaned = re.sub(r"```json|^```|```$", "", json_str.strip(), flags=re.MULTILINE)
        return parse_json(cleaned.strip())
    except json.JSONDecodeError:
        return None
