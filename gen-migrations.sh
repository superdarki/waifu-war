#!/bin/bash
set -e

PREFIX="waifu-war-"
DB_NAME="$1"

if [ -z "$DB_NAME" ]; then
  echo "❌ Usage: $0 <db_name>"
  exit 1
fi

SCHEMA="schema/$DB_NAME/schema.prisma"
MIGRATIONS_DIR="schema/$DB_NAME/migrations"
SHADOW_DB="schema/$DB_NAME/shadow.db"

# 1. Apply existing migrations to shadow DB
rm -f "$SHADOW_DB"
touch "$SHADOW_DB"
for file in "$MIGRATIONS_DIR"/*.sql; do
  sqlite3 "$SHADOW_DB" < "$file"
done

# 2. Generate a migration name
MIGRATION_NAME=$(date +"%Y%m%d_%H%M%S")

# 3. Create a new D1 migration file
wrangler d1 migrations create "$PREFIX$DB_NAME" "$MIGRATION_NAME" >> /dev/null

# 4. Find the generated file
SQL_FILE=$(find $MIGRATIONS_DIR -type f -name "*_${MIGRATION_NAME}.sql" | sort | tail -n 1)

# 5. Generate the Prisma diff into a variable
DIFF_SQL=$(npx prisma migrate diff \
  --from-url="file:$SHADOW_DB" \
  --to-schema-datamodel="$SCHEMA" \
  --script)

# 6. Check if there's real content
if [[ "$DIFF_SQL" =~ "-- This is an empty migration." ]]; then
  echo "⚠️  No schema changes detected. Removing empty migration."
  rm "$SQL_FILE"
else
  echo "$DIFF_SQL" > "$SQL_FILE"
  echo "✅  New migration saved to: $SQL_FILE"
fi