import json
import re


def extract_json_block(text: str):
    """
    Safely extract first JSON object from an LLM response.
    """
    if not text:
        raise ValueError("Empty LLM response")

    text = text.strip()

    # direct parse
    try:
        return json.loads(text)
    except Exception:
        pass

    # fenced code block
    fenced = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
    if fenced:
        return json.loads(fenced.group(1))

    # fallback: first {...}
    brace_match = re.search(r"(\{.*\})", text, re.DOTALL)
    if brace_match:
        return json.loads(brace_match.group(1))

    raise ValueError("Could not extract valid JSON from model output")