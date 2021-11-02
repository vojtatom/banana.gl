#!/bin/bash

rm -rf dist;
rm -rf metawokspace.egg*;
python setup.py sdist; 
python -m twine upload dist/*;
