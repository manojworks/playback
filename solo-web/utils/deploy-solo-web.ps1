# PowerShell script to deploy solo-web Angular app on Windows using Docker

# Step 1: Clone the repository
Write-Host "Cloning the repository..."
git clone https://github.com/manojworks/playback.git
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to clone repository"
    exit 1
}

# Navigate to solo-web folder
Set-Location -Path "playback/solo-web"

# Step 2: Stop and remove existing container and image
Write-Host "Cleaning up existing container and image..."
docker stop solo-web-container -ErrorAction SilentlyContinue
docker rm solo-web-container -ErrorAction SilentlyContinue
docker rmi solo-web -ErrorAction SilentlyContinue

# Step 3: Build the Docker container
Write-Host "Building Docker container..."
docker build -t solo-web .
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to build Docker container"
    exit 1
}

Write-Host "Docker image built successfully"

# Step 4: Deploy the service
Write-Host "Deploying the solo-web service..."
docker run -d -p 8080:80 --name solo-web-container solo-web
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to deploy the service"
    exit 1
}

Write-Host "Container deployed successfully"

# Step 5: Verify the service is running and accessible
Write-Host "Verifying the service..."
Start-Sleep -Seconds 5  # Wait a bit for the container to start

# Check if container is running
$containerStatus = docker ps --filter "name=solo-web-container" --format "{{.Status}}"
if ($containerStatus -notlike "*Up*") {
    Write-Error "Container is not running. Status: $containerStatus"
    docker logs solo-web-container
    exit 1
}

Write-Host "Container is running: $containerStatus"

# Check if accessible externally
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Service is running and accessible at http://localhost:8080"
        Write-Host "✓ Angular app deployed successfully!"
    } else {
        Write-Error "Service returned status code: $($response.StatusCode)"
        exit 1
    }
} catch {
    Write-Error "Failed to access the service: $($_.Exception.Message)"
    Write-Host "Checking container logs for debugging..."
    docker logs solo-web-container
    exit 1
}

Write-Host "`nDeployment successful! The solo-web app is running at http://localhost:8080"
Write-Host "`nUseful commands:"
Write-Host "  View logs: docker logs solo-web-container"
Write-Host "  Stop container: docker stop solo-web-container"
Write-Host "  Start container: docker start solo-web-container"
Write-Host "  Remove container: docker rm solo-web-container"