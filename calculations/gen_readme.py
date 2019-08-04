import sys, os

with open('README.md','w') as fh:
    fh.write('Generate this readme with `python gen_readme.py` (run in `/calculations` directory).\n')
    for f in os.listdir():
        if not sys.argv[0].endswith(f):
            fh.write(f'[{f}](https://joeiddon.github.io/webgl/calculations/{f})\n')
