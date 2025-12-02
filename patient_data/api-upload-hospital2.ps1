# API Test

$apiKey = "ehealth_H2__cA92iH-PgNdU5WvQZwe4XpN8ifbfXP-Vl-rKQo5"
$apiUrl = "http://localhost:8080/api/data/sql" 

Write-Host "Testing API - Database Auto-Selected!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

$baseDir = "C:/Users/Mide/Desktop/IDERHA/patient_data/hospital2"
$sqlFiles = @(
    "$baseDir/1_persons.sql",
    "$baseDir/2_conditions.sql", 
    "$baseDir/3_drugs.sql"
)

Write-Host "Files to upload:"
$totalSize = 0
foreach ($file in $sqlFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        $totalSize += $size
        Write-Host "- $(Split-Path $file -Leaf): $size bytes"
    } else {
        Write-Host "- $(Split-Path $file -Leaf): NOT FOUND" -ForegroundColor Red
    }
}
Write-Host "Total Size: $totalSize bytes"
Write-Host "API automatically determines database from API key!" -ForegroundColor Yellow
Write-Host ""

$headers = @{
    "X-API-Key" = $apiKey
    "Content-Type" = "text/plain"
}

try {
    $successCount = 0
    $errorCount = 0
    $totalStatements = 0
    
    Write-Host "Uploading patient data files..." -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($sqlFile in $sqlFiles) {
        if (-not (Test-Path $sqlFile)) {
            Write-Host "Skipping missing file: $(Split-Path $sqlFile -Leaf)" -ForegroundColor Yellow
            continue
        }
        
        $fileName = Split-Path $sqlFile -Leaf
        Write-Host "Processing: $fileName" -ForegroundColor Cyan
        
        $sqlContent = Get-Content $sqlFile -Raw
        $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $sqlContent -Headers $headers -ErrorAction Stop
        
        Write-Host "- Database: $($response.database) (auto-selected by API key)"
        Write-Host "- Status: $($response.status)"
        Write-Host "- Statements executed: $($response.statementsExecuted)"
        
        $fileSuccessCount = 0
        $fileErrorCount = 0
        
        foreach ($detail in $response.details) {
            $totalStatements++
            if ($detail.success) {
                $fileSuccessCount++
                $successCount++
            } else {
                $fileErrorCount++
                $errorCount++
                $preview = $detail.statement.Substring(0, [Math]::Min(50, $detail.statement.Length))
                Write-Host "   ERROR: $preview..." -ForegroundColor Red
                Write-Host "   $($detail.result)" -ForegroundColor Red
            }
        }
        
        Write-Host "- File Results: $fileSuccessCount success, $fileErrorCount errors"
        Write-Host ""
    }
    Write-Host ""
    Write-Host "Overall Summary:" -ForegroundColor Magenta
    Write-Host "- Total Statements: $totalStatements"
    Write-Host "- Successful: $successCount" -ForegroundColor Green
    Write-Host "- Failed: $errorCount" -ForegroundColor $(if($errorCount -gt 0) { "Red" } else { "Green" })
    
    if ($totalStatements -gt 0) {
        $successRate = [math]::Round(($successCount / $totalStatements) * 100, 1)
        Write-Host "- Success Rate: $successRate%"
    }
    
    if ($successCount -gt 10) {
        Write-Host ""
        Write-Host "SUCCESS! Patient data uploaded successfully!" -ForegroundColor Green
        Write-Host "Hospital2 database now contains realistic patient data" -ForegroundColor Green
    } elseif ($errorCount -eq 0 -and $successCount -gt 0) {
        Write-Host ""
        Write-Host "Partial Success - Some data uploaded" -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "Upload failed or minimal data processed" -ForegroundColor Red
        Write-Host "Check backend logs and database connection" -ForegroundColor Yellow
    }

} catch {
    Write-Host "Error testing API:" -ForegroundColor Red
    Write-Host "Exception: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    }
    
    # Additional debugging
    Write-Host ""
    Write-Host "Debugging Info:" -ForegroundColor Yellow
    Write-Host "- API URL: $apiUrl"
    Write-Host "- API Key: $($apiKey.Substring(0,20))..."
    Write-Host "- Backend Status: Testing..."
    
    try {
        $healthCheck = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -TimeoutSec 3
        Write-Host "- Backend Health: OK" -ForegroundColor Green
    } catch {
        Write-Host "- Backend Health: $($_.Exception.Message)" -ForegroundColor Red
    }
}