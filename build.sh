#!/bin/sh

echo "Building..." 
npm run build;

echo "Coping popup.js to extension folder..."
cp dist/popup.js extension/popup.js

echo "Done!" 

