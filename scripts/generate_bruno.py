import os

endpoints = [
    ("8_Upload_Zip", "post", "http://127.0.0.1:8000/api/v1/repositories/upload-zip/", "multipartForm"),
    ("9_Get_Organizations", "get", "http://127.0.0.1:8000/api/v1/accounts/organizations/", "none"),
    ("10_Get_Users", "get", "http://127.0.0.1:8000/api/v1/accounts/users/", "none"),
    ("11_Create_Enterprise_User", "post", "http://127.0.0.1:8000/api/v1/accounts/users/create_enterprise_user/", "json"),
    ("12_Get_Api_Keys", "get", "http://127.0.0.1:8000/api/v1/accounts/api-keys/", "none"),
    ("13_Toggle_False_Positive", "post", "http://127.0.0.1:8000/api/v1/reviews/vulnerabilities/1/toggle_false_positive/", "none"),
    ("14_Apply_PR", "post", "http://127.0.0.1:8000/api/v1/patches/1/apply_pr/", "none"),
    ("15_Get_Verification_Runs", "get", "http://127.0.0.1:8000/api/v1/verification/runs/", "none"),
    ("16_Get_Feedback_Events", "get", "http://127.0.0.1:8000/api/v1/training/feedback/", "none"),
    ("17_Trigger_Training_Job", "post", "http://127.0.0.1:8000/api/v1/training/jobs/trigger/", "none"),
    ("18_Get_Training_Jobs", "get", "http://127.0.0.1:8000/api/v1/training/jobs/", "none"),
    ("19_Run_Evaluation", "post", "http://127.0.0.1:8000/api/v1/evaluation/run/", "json"),
    ("20_Get_Evaluations", "get", "http://127.0.0.1:8000/api/v1/evaluation/", "none"),
    ("21_Get_Audit_Logs", "get", "http://127.0.0.1:8000/api/v1/monitoring/audit-logs/", "none")
]

for idx, (name, method, url, body_type) in enumerate(endpoints, 8):
    content = f"""meta {{
  name: {name.replace('_', ' ')}
  type: http
  seq: {idx}
}}

{method} {{
  url: {url}
  body: {body_type}
  auth: bearer
}}

auth:bearer {{
  token: {{{{access_token}}}}
}}
"""
    if body_type == "json":
        content += "\nbody:json {\n  {}\n}\n"
    
    with open(f"Bruno_Collection/{name}.bru", "w") as f:
        f.write(content)
