#!/usr/bin/env python3
import sys, json
with open(sys.argv[1]) as f:
    data = json.load(f)
keys = data.get('keys', [])
for k in keys:
    if isinstance(k, dict):
        print(k.get('name', ''))
    else:
        print(k)
