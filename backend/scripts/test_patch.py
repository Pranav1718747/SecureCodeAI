import subprocess
import os

os.makedirs('test_ws', exist_ok=True)
with open('test_ws/app.py', 'w') as f:
    f.write("def foo():\n    print('vuln')\n")

diff = """--- a/file
+++ b/file
@@ -1,2 +1,2 @@
 def foo():
-    print('vuln')
+    print('fixed')
"""

with open('test_ws/fix.patch', 'w') as f:
    f.write(diff)

with open('test_ws/fix.patch', 'r') as f:
    res = subprocess.run(['patch', '--force', 'app.py'], cwd='test_ws', stdin=f, check=False, capture_output=True)

print("Exit:", res.returncode)
print("Stdout:", res.stdout.decode())
print("Stderr:", res.stderr.decode())

with open('test_ws/app.py', 'r') as f:
    print("Result:", f.read())
