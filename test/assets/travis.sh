#!/bin/bash
set -ev

SCRIPT_PATH="`dirname \"$0\"`"
TIMEOUT=60
COUNT=0

while [[ $(curl -s -o /dev/null -w "%{http_code}" http://localhost:7474) -ne 200 && $COUNT -lt $TIMEOUT ]]; do
   echo -n "."
   sleep 1
   COUNT=$((COUNT+1))
done

docker exec -i neo4j cypher-shell -u neo4j -p admin --format plain < $SCRIPT_PATH/movie.cql
