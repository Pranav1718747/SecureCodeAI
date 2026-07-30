import yaml
import json
import sys

def run():
    try:
        with open("../SecureCode_AI_Bruno_Collection.json", "r") as f:
            content = f.read()
    except:
        with open("SecureCode_AI_Bruno_Collection.json", "r") as f:
            content = f.read()
        
    try:
        data = json.loads(content)
    except Exception:
        data = yaml.safe_load(content)

    def get_dummy_value(prop_name, prop_schema):
        if 'example' in prop_schema:
            return prop_schema['example']
        
        p_type = prop_schema.get('type')
        if p_type in ['integer', 'number']:
            if prop_name in ['id', 'user_id', 'organization_id', 'repository', 'scan_id']: return 1
            return 42
        elif p_type == 'boolean':
            return True
        elif p_type == 'array':
            return ["example_item"]
            
        name_lower = prop_name.lower()
        if 'email' in name_lower: return "user@example.com"
        if 'password' in name_lower: return "secure_password_123"
        if 'username' in name_lower: return "admin_user"
        if 'url' in name_lower: return "https://example.com"
        if any(x in name_lower for x in ['date', 'time', 'created_at', 'expires_at', 'updated_at']):
            return "2023-10-01T12:00:00Z"
        if 'name' in name_lower: return "Example Name"
        if 'status' in name_lower: return "ACTIVE"
        if any(x in name_lower for x in ['token', 'access', 'refresh']):
            return "eyJhbGciOiJIUzI1NiIsInR5c..."
        return f"example_{prop_name}"

    def resolve_schema(schema_obj, depth=0):
        if not schema_obj or depth > 3: return {}
        if '$ref' in schema_obj:
            ref_path = schema_obj['$ref'].split('/')
            curr = data
            for p in ref_path:
                if p == '#': continue
                curr = curr.get(p, {})
            return resolve_schema(curr, depth + 1)
        
        result = {}
        if 'properties' in schema_obj:
            for k, v in schema_obj['properties'].items():
                if '$ref' in v:
                    result[k] = resolve_schema(v, depth + 1)
                elif v.get('type') == 'array':
                    items = v.get('items', {})
                    if '$ref' in items:
                        result[k] = [resolve_schema(items, depth + 1)]
                    else:
                        result[k] = [get_dummy_value(k, items)]
                else:
                    result[k] = get_dummy_value(k, v)
        return result

    with open("/Users/pranav1718/.gemini/antigravity-ide/brain/aaa3a36f-5de0-4d85-8ca9-f1819966133a/full_api_list.md", "w") as out:
        out.write("# SecureCode-AI Complete API Documentation\n\n")
        out.write("This document contains all APIs automatically extracted from the OpenAPI specification.\n\n")
        
        paths = data.get("paths", {})
        for path, methods in paths.items():
            for method, details in methods.items():
                out.write(f"Endpoint: {method.upper()} {path}\n")
                
                req_body = details.get("requestBody", {})
                content_type_str = ""
                body_json = {}
                if req_body:
                    content_dict = req_body.get("content", {})
                    for content_type, c_details in content_dict.items():
                        content_type_str = content_type
                        schema = c_details.get("schema", {})
                        body_json = resolve_schema(schema)
                        break
                
                headers = []
                if "accounts/token" not in path:
                    headers.append("Authorization: Bearer <token>")
                if content_type_str:
                    headers.append(f"Content-Type: {content_type_str}")
                    
                if headers:
                    out.write(f"Headers: {', '.join(headers)}\n")
                else:
                    out.write("Headers: None\n")
                    
                if body_json or content_type_str == 'application/json':
                    out.write("Body (JSON):\n```json\n")
                    out.write(json.dumps(body_json, indent=2) + "\n```\n")
                elif req_body:
                    out.write(f"Body: <requires {content_type_str}>\n")
                
                responses = details.get("responses", {})
                if responses:
                    for code, resp_details in responses.items():
                        desc = resp_details.get('description', '')
                        out.write(f"Expected Response ({code} {desc}):\n")
                        
                        resp_content = resp_details.get("content", {})
                        resp_json = {}
                        if "application/json" in resp_content:
                            schema = resp_content["application/json"].get("schema", {})
                            resp_json = resolve_schema(schema)
                            out.write("```json\n" + json.dumps(resp_json, indent=2) + "\n```\n")
                        else:
                            out.write("```json\n{}\n```\n")
                        break
                else:
                    out.write("Expected Response (200 OK):\n```json\n{}\n```\n")
                
                out.write("\n---\n\n")
    print("Done")

if __name__ == "__main__":
    run()
