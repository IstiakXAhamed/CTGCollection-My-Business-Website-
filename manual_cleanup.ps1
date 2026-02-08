Write-Host "🧹 Starting Safe Cleanup..." -ForegroundColor Cyan

# 1. Clean 'scripts' folder (keeping seeds and important utils)
$keep = @("create-superadmin.ts", "seed-demo-data.js", "seed-orders.js", "fix-images.js")
$scripts = Get-ChildItem -Path "scripts" -File

foreach ($file in $scripts) {
    if ($keep -notcontains $file.Name) {
        Remove-Item $file.FullName -Force -ErrorAction SilentlyContinue
        Write-Host "Deleted: $($file.Name)" -ForegroundColor Gray
    } else {
        Write-Host "Kept: $($file.Name)" -ForegroundColor Green
    }
}

# 2. Remove temporary API route
if (Test-Path "app/api/test-ai") {
    Remove-Item -Path "app/api/test-ai" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Deleted: app/api/test-ai" -ForegroundColor Gray
}

# 3. Remove root temp files
$rootFiles = @("test-db-connection.ts", "cleanup.bat", "cleanup.log")
foreach ($f in $rootFiles) {
    if (Test-Path $f) {
        Remove-Item $f -Force -ErrorAction SilentlyContinue
        Write-Host "Deleted: $f" -ForegroundColor Gray
    }
}

# 4. Self-destruct (optional, commenting out to let user verify first)
# Remove-Item $MyInvocation.MyCommand.Path -Force

Write-Host "`n✨ Cleanup Complete! Your project is now optimized." -ForegroundColor Cyan
