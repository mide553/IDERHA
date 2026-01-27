#!/bin/bash

# Start the application in detached mode (and rebuild if code changed)
echo "Starting application..."
docker-compose up -d --build

# Wait for the setup container to finish its job
echo "Waiting for database setup to complete..."
docker wait eHealth_Insights_setup

# Remove the setup container
echo "Removing setup container..."
docker rm eHealth_Insights_setup

echo "Startup complete! The setup container has been cleaned up."
