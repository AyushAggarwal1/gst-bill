#!/bin/bash

# Exit on error
set -e

# Config variables
REPO_URL="https://${GITHUB_TOKEN}@github.com/AyushAggarwal1/gst-bill-db-backup"
BRANCH="main"  # or a separate branch for generated files

# Clone the repo (shallow clone to save time)
git clone --depth=1 --branch=$BRANCH $REPO_URL db-repo

# Run your file generation script
pip install -r ../usefulScripts/exportSupabaseDbPy/requirements.txt
python3 ../usefulScripts/exportSupabaseDbPy/egressSupdabaseDb.py  # Generates output.json for example

# Copy generated file
cd usefulScripts/exportSupabaseDbPy
ls -la
cp *.json ../db-repo
cd ../db-repo
ls -la

cd db-repo
# Commit and push
git config user.email "action@github.com"
git config user.name "DB Backup Github Bot"

git add output.json
git commit -m "Update generated file [skip ci]"
git push origin $BRANCH

# Cleanup
cd ..
rm -rf db-repo