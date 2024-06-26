#!/bin/bash
set -e

# Check if PGPASSWORD is set
if [[ -z "${PGPASSWORD}" ]]; then
  echo "Error: PGPASSWORD is not set." >&2
  exit 1
fi

container="ticket-db"

# Start Postgres in a local Docker container
docker run --rm --name=$container --env=POSTGRES_PASSWORD=${PGPASSWORD} --env=PGDATA=/var/lib/postgresql/data --volume=/var/lib/postgresql/data -p 5432:5432 -d postgres:16.1

# Wait for PostgreSQL to start
echo "Waiting for PostgreSQL to start..."
for i in {1..30}; do
  if docker exec $container psql -U postgres -c "SELECT 1;" > /dev/null 2>&1; then
    echo "PostgreSQL started!"
    break
  fi
  sleep 1
done

npx dbos migrate
npm run db:seed
echo "Database started successfully!"
