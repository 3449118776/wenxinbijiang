#!/usr/bin/env python3
import sys, json
sql = sys.stdin.read()
print(json.dumps({"sql": sql}))
