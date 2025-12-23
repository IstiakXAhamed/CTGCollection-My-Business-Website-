# PowerShell script to add 'export const dynamic = force-dynamic' to all route.ts files

$apiDir = "app/api"
$routeFiles = Get-ChildItem -Path $apiDir -Recurse -Filter "route.ts"

foreach ($file in $routeFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Skip if already has dynamic export
    if ($content -match "export const dynamic") {
        Write-Host "Skipped (already has): $($file.FullName)"
        continue
    }
    
    # Find the first import statement and add dynamic export after all imports
    # Look for the line after the last import
    $lines = Get-Content $file.FullName
    $lastImportIndex = -1
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match "^import ") {
            $lastImportIndex = $i
        }
    }
    
    if ($lastImportIndex -ge 0) {
        # Insert dynamic export after last import
        $newLines = @()
        for ($i = 0; $i -lt $lines.Count; $i++) {
            $newLines += $lines[$i]
            if ($i -eq $lastImportIndex) {
                $newLines += ""
                $newLines += "export const dynamic = 'force-dynamic'"
            }
        }
        
        $newLines | Set-Content $file.FullName
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "`nDone! All route files have been updated."
