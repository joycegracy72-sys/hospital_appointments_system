# ===================================================================
# MediCare HMS - Start Backend Server
# ===================================================================

$jdkPath = "C:\Users\JOYCE GRACY\.vscode\extensions\redhat.java-1.58.0-win32-x64\jre\25.0.4.1-win32-x86_64"
$env:JAVA_HOME = $jdkPath
$env:Path = "$jdkPath\bin;" + $env:Path

Write-Host "Starting Spring Boot Backend on port 8080..." -ForegroundColor Cyan

if ([string]::IsNullOrEmpty($env:DB_PASSWORD)) {
    Write-Host "DB_PASSWORD environment variable is not currently set." -ForegroundColor Yellow
    $plainPass = Read-Host "Enter MySQL root password (leave blank if no password)"
    if (-not [string]::IsNullOrEmpty($plainPass)) {
        $env:DB_PASSWORD = $plainPass
    }
}

Set-Location "$PSScriptRoot\backend"
.\mvnw.cmd spring-boot:run
