#!/usr/bin/env python3
"""Convert YAML subagent spec to JSON for the data plane v2 API.

The API expects: { name, type, tags, owner, properties: { ... } }
YAML uses snake_case; the API uses camelCase.

Usage: python3 yaml-to-api-json.py <yaml_file> <output_file|-|> [github_repo]

Source: adapted from microsoft/sre-agent labs/starter-lab/scripts/yaml-to-api-json.py
"""
import yaml, json, sys, os

yaml_file = sys.argv[1]
output_file = sys.argv[2] if len(sys.argv) > 2 else "-"
github_repo = (
    sys.argv[3]
    if len(sys.argv) > 3
    else os.environ.get("GITHUB_REPO", "yortch/agentic-devops-demo")
)

with open(yaml_file) as f:
    data = yaml.safe_load(f)

spec = data["spec"]

# Substitute GITHUB_REPO_PLACEHOLDER with actual repo
instructions = spec.get("system_prompt", "").replace(
    "GITHUB_REPO_PLACEHOLDER", github_repo
)
handoff_desc = spec.get("handoff_description", "").replace(
    "GITHUB_REPO_PLACEHOLDER", github_repo
)

api_body = {
    "name": spec["name"],
    "type": "ExtendedAgent",
    "tags": [],
    "owner": "",
    "properties": {
        "instructions": instructions,
        "handoffDescription": handoff_desc,
        "handoffs": spec.get("handoffs", []),
        "tools": spec.get("tools", []),
        "mcpTools": spec.get("mcp_tools", []),
        "allowParallelToolCalls": True,
        "enableSkills": True,
    },
}

if output_file == "-":
    print(json.dumps(api_body))
else:
    with open(output_file, "w") as f:
        json.dump(api_body, f)
    print(f"Wrote {output_file} ({len(json.dumps(api_body))} bytes)")
