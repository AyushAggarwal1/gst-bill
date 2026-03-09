#!/bin/bash

# Exit on error
set -e
# Verify token is present
if [[ -z "$GIT_TOKEN" ]]; then
  echo "Error: GIT_TOKEN is not set"
  exit 1
fi

# Database Backup Repo URL
REPO_URL="https://x-access-token:${GIT_TOKEN}@github.com/AyushAggarwal1/gstly-db-backup"
BRANCH="main"  # Branch to push the backup files to

# Get current date for folder name
CURRENT_DATE=$(date +%Y-%m-%d)
BACKUP_FOLDER="db_backup_${CURRENT_DATE}"

# Clone the database backup repo (shallow clone to save time)
git clone --depth=1 --branch=$BRANCH $REPO_URL db-repo

# Install dependencies for data exporter script
pip install -r ./scripts/database_export/exportSupabaseDbPy/requirements.txt

# Run data exporter script 
python3 ./scripts/database_export/exportSupabaseDbPy/egressSupdabaseDb.py  # db_backup_YYYY-MM-DD folder is generated

# Create the date folder in the cloned repo
mkdir -p ./db-repo/${BACKUP_FOLDER}

# move exported current date db backup JSON files to the database backup repo
mv ./${BACKUP_FOLDER}/*.json ./db-repo/${BACKUP_FOLDER}/

cd db-repo
# Commit and push db backup files to database backup repo
git config user.email "action@github.com"
git config user.name "DB Backup Github Bot"

git add ${BACKUP_FOLDER}/*.json
git commit -m "Add database backup for ${CURRENT_DATE}"
git push origin main

# Cleanup
cd ..
rm -rf db-repo
rm -rf ${BACKUP_FOLDER}
