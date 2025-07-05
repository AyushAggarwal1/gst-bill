#!/bin/bash

# Exit on error
set -e
# Verify token is present
if [[ -z "$GIT_TOKEN" ]]; then
  echo "Error: GIT_TOKEN is not set"
  exit 1
fi

# Database Backup Repo URL
REPO_URL="https://x-access-token:${GIT_TOKEN}@github.com/AyushAggarwal1/gst-bill-db-backup"
BRANCH="main"  # Branch to push the backup files to

# Clone the database backup repo (shallow clone to save time)
git clone --depth=1 --branch=$BRANCH $REPO_URL db-repo

# Install dependencies for data exporter script
pip install -r ./usefulScripts/exportSupabaseDbPy/requirements.txt

# Run data exporter script 
python3 ./usefulScripts/exportSupabaseDbPy/egressSupdabaseDb.py  # *_export.json is generated

# Copy db backup file to database backup repo
cp *_export.json ./db-repo/

cd db-repo
# Commit and push db backup file to database backup repo
git config user.email "action@github.com"
git config user.name "DB Backup Github Bot"

git add *_export.json
git commit -m "Update generated file"
git push origin main

# Cleanup
cd ..
rm -rf db-repo
cd ..
rm -rf gst-bill