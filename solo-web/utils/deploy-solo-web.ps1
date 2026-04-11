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

# Step 2: Build the Docker container
Write-Host "Building Docker container..."
docker build -t solo-web .
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to build Docker container"
    exit 1
}

# Step 3: Deploy the service
Write-Host "Deploying the solo-web service..."
docker run -d -p 8080:80 --name solo-web-container solo-web
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to deploy the service"
    exit 1
}

# Step 4: Verify the service is running and accessible
Write-Host "Verifying the service..."
Start-Sleep -Seconds 5  # Wait a bit for the container to start

# Check if container is running
$containerStatus = docker ps --filter "name=solo-web-container" --format "{{.Status}}"
if ($containerStatus -notlike "*Up*") {
    Write-Error "Container is not running. Status: $containerStatus"
    exit 1
}

# Check if accessible externally
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "Service is running and accessible at http://localhost:8080"
    } else {
        Write-Error "Service returned status code: $($response.StatusCode)"
        exit 1
    }
} catch {
    Write-Error "Failed to access the service: $($_.Exception.Message)"
    exit 1
}

Write-Host "Deployment successful!"