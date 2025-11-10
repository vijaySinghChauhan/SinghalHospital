#Requires -RunAsAdministrator

Write-Host "Installing React Native Windows dependencies..."

# Navigate to node_modules directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptPath "..\node_modules\react-native-windows")

# Execute the rnw-dependencies script
if (Test-Path ".\scripts\rnw-dependencies.ps1") {
    Write-Host "Running rnw-dependencies.ps1..."
    .\scripts\rnw-dependencies.ps1
} else {
    Write-Error "Could not find rnw-dependencies.ps1. Make sure react-native-windows is installed."
    exit 1
}

Write-Host "`nDependencies installation complete. Press any key to exit."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
