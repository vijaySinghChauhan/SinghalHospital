$ErrorActionPreference = "Stop"

# Initialize git repository if not already initialized
if (-not (Test-Path .git)) {
    git init
    Write-Host "Git repository initialized"
}

# Add remote origin if not exists
$remoteExists = git remote -v | Select-String -Pattern "origin"
if (-not $remoteExists) {
    git remote add origin https://github.com/vijaySinghChauhan/SinghalHospital.git
    Write-Host "Added remote origin"
}

# Stage all files
git add .
Write-Host "Staged all files"

# Commit changes
git commit -m "Initial commit"
Write-Host "Changes committed"

# Push to remote
git push -u origin main
Write-Host "Pushed to remote repository"
