#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# If you want to force a particular JVM, change 'java' to full path
exec java -Djava.library.path="./natives" -jar ./app.jar "$@"