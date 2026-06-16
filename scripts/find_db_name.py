#!/usr/bin/env python3
import sys, json
d = json.load(sys.stdin)
for n in d.get('result', []):
    if n['uuid'].startswith(sys.argv[1][:16]):
        print(n['name'])
        sys.exit(0)
