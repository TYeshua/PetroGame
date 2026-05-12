import re
import json
import os

with open('authkit.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Look for <script type="application/json">
scripts = re.findall(r'<script[^>]*type="application/json"[^>]*>(.*?)</script>', html, re.DOTALL)
for i, s in enumerate(scripts):
    try:
        data = json.loads(s)
        with open(f'authkit_script_{i}.json', 'w', encoding='utf-8') as out:
            json.dump(data, out, indent=2)
        print(f"Saved authkit_script_{i}.json, length: {len(s)}")
    except Exception as e:
        print(f"Error parsing script {i}: {e}")
