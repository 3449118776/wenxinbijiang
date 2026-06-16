#!/usr/bin/env python3
import sys, json
try:
    with open(sys.argv[1]) as f:
        data = json.load(f)
    rows = data.get('rows', [])
    if not rows:
        print('')
        sys.exit(0)
    out = []
    for row in rows:
        row_str = json.dumps(row, ensure_ascii=False)
        if 'REDACTED' in row_str:
            continue
        cols = list(row.keys())
        vals = []
        for c in cols:
            v = row[c]
            if isinstance(v, str):
                v2 = v.replace("'", "''")
                vals.append("'" + v2 + "'")
            elif isinstance(v, (int, float)):
                vals.append(str(v))
            elif v is None:
                vals.append('NULL')
            else:
                s = json.dumps(v, ensure_ascii=False).replace("'", "''")
                vals.append("'" + s + "'")
        out.append('REPLACE INTO ' + sys.argv[2] + ' (' + ','.join(cols) + ') VALUES (' + ','.join(vals) + ');')
    print('\n'.join(out))
except Exception as e:
    print('')
