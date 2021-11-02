#!/bin/bash

cd react-metaworkspace
npm run build
cd ..
rm -r metaworkspace/client/
mkdir metaworkspace/client/
cp -a react-metaworkspace/build/. metaworkspace/client/
