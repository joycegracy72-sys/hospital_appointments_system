# ===================================================================
# MediCare HMS - Start Backend Server
# ===================================================================

$jdkPath = "C:\Users\JOYCE GRACY\.vscode\extensions\redhat.java-1.58.0-win32-x64\jre\25.0.4.1-win32-x86_64"
if (Test-Path $jdkPath) {
    $env:JAVA_HOME = $jdkPath
    $env:Path = "$jdkPath\bin;" + $env:Path
}

Write-Host "Starting Spring Boot Backend on port 8080..." -ForegroundColor Cyan

# Check if DB_PASSWORD is set; if not, ask securely with masked input
if ([string]::IsNullOrEmpty($env:DB_PASSWORD)) {
    $securePass = Read-Host "Enter MySQL root password (input is masked, press Enter if no password)" -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
    $plain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    if (-not [string]::IsNullOrEmpty($plain)) {
        $env:DB_PASSWORD = $plain
    }
}

Set-Location "$PSScriptRoot\backend"
.\mvnw.cmd spring-boot:run
