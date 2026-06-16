#!/usr/bin/env python3
import sys, json
d = json.load(sys.stdin)
for n in d.get('result', []):
    name = n.get('title', '')
    if 'WXBJ' in name.upper() or 'worker' in name.lower():
        print(n['id'])
        break
