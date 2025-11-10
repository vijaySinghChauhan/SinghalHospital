```powershell
param(
  [string]$RemoteUrl = "https://github.com/vijaySinghChauhan/SinghalHospital.git",
  [string]$Branch = "main",
  [string]$Message = "Initial commit"
)

# Resolve repo root (script placed in scripts/ under repo root)
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoRoot

# Ensure git is available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "Git is not installed or not in PATH. Install Git (https://git-scm.com/) and retry."
  exit 1
}

Write-Host "Repository root: $repoRoot"

# Initialize git if needed (try to set initial branch)
if (-not (Test-Path ".git")) {
  Write-Host "Initializing new git repository..."
  try {
    git init -b $Branch
  } catch {
    # Fallback for older git versions
    git init
    git checkout -b $Branch
  }
} else {
  Write-Host ".git already exists"
}

# Configure remote
$existing = $null
try { $existing = git remote get-url origin 2>$null } catch {}
if ($existing) {
  if ($existing -ne $RemoteUrl) {
    Write-Host "Updating existing 'origin' remote URL to $RemoteUrl"
    git remote set-url origin $RemoteUrl
  } else {
    Write-Host "Remote 'origin' already configured"
  }
} else {
  Write-Host "Adding remote origin -> $RemoteUrl"
  git remote add origin $RemoteUrl
}

# Stage all files
Write-Host "Staging all files..."
git add -A

# Decide whether to commit
$hasCommits = $true
try {
  git rev-parse --verify HEAD > $null 2>&1
} catch {
  $hasCommits = $false
}

# If there are staged changes, create commit (or initial commit when no commits)
$status = git status --porcelain
if ($status) {
  if (-not $hasCommits) {
    Write-Host "Creating initial commit..."
    git commit -m $Message
  } else {
    Write-Host "Creating commit with staged changes..."
    git commit -m $Message
  }
} else {
  Write-Host "No changes to commit."
}

# Push to remote
Write-Host "Pushing branch '$Branch' to origin..."
try {
  git push -u origin $Branch
  Write-Host "Push succeeded."
} catch {
  Write-Error "Push failed. If authentication failed, create a GitHub Personal Access Token (classic or fine-grained) and use it when prompted. Alternatively configure Git Credential Manager."
  Write-Host "Manual commands you can run:"
  Write-Host "  git status"
  Write-Host "  git remote -v"
  Write-Host "  git push -u origin $Branch"
  exit 1
}

Write-Host "Done."
```