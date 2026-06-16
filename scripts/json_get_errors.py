#!/usr/bin/env python3
import sys, json
d = json.load(sys.stdin)
print(str(d.get("errors", [])))
