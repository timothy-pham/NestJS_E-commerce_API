#!/bin/bash

# Start MongoDB if not running
if ! pgrep -x "mongod" > /dev/null; then
    echo "Starting MongoDB..."
    # Try to start MongoDB (adjust command based on your system)
    # On Ubuntu/Debian: sudo systemctl start mongod
    # On macOS with Homebrew: brew services start mongodb-community
    echo "Please ensure MongoDB is running on mongodb://localhost:27017"
fi

echo "Starting NestJS application..."
npm run start:dev
