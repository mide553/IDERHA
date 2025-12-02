# Start the application in detached mode
docker-compose up -d

# Wait for the setup container to finish its job
Write-Host "Waiting for database setup to complete..." -ForegroundColor Cyan
docker wait eHealth_Insights_setup

# Remove the setup container
Write-Host "Removing setup container..." -ForegroundColor Cyan
docker rm eHealth_Insights_setup

Write-Host "Startup complete! The setup container has been cleaned up." -ForegroundColor Green
