docker exec -it $(docker ps -f "name=db" --format '{{.ID}}') psql -U postgres -W postgres
