# API Test

$apiKey = "ehealth_EZ__bB81hG-OgMdT4VuPZvd3WoM7heaeWO-Uk-qJPn4"
$apiUrl = "http://localhost:8080/api/data/sql" 

Write-Host "Testing API - Database Auto-Selected!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Test with the full sample data file
$sqlFile = "C:/Users/Mide/Desktop/IDERHA/db-upload-data/hospital1/basic_sample_data_for_testing.sql"
$sqlContent = Get-Content $sqlFile -Raw

Write-Host "File: $sqlFile"
Write-Host "Size: $($sqlContent.Length) bytes"
Write-Host "API automatically determines database from API key!" -ForegroundColor Yellow
Write-Host ""

$headers = @{
    "X-API-Key" = $apiKey
    "Content-Type" = "text/plain"
}

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $sqlContent -Headers $headers -ErrorAction Stop
    
    Write-Host "API Response:" -ForegroundColor Green
    Write-Host "- Database: $($response.database) (auto-selected by API key)"
    Write-Host "- Status: $($response.status)"
    Write-Host "- Statements executed: $($response.statementsExecuted)" -ForegroundColor $(if($response.statementsExecuted -gt 3) { "Green" } else { "Yellow" })
    Write-Host "- Total processed: $($response.details.Count)"
    Write-Host ""
    
    Write-Host "Statement Results:" -ForegroundColor Cyan
    $successCount = 0
    $errorCount = 0
    
    foreach ($detail in $response.details) {
        if ($detail.success) {
            $successCount++
            $color = "Green"
        } else {
            $errorCount++
            $color = "Red"
        }
        
        $preview = $detail.statement.Substring(0, [Math]::Min(70, $detail.statement.Length))
        Write-Host "[$($detail.success)] $preview..." -ForegroundColor $color
        
        if (-not $detail.success) {
            Write-Host "   Error: $($detail.result)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Magenta
    Write-Host "- Successful: $successCount"
    Write-Host "- Failed: $errorCount"
    
    if ($response.details.Count -gt 0) {
        $successRate = [math]::Round(($successCount / $response.details.Count) * 100, 1)
        Write-Host "- Success Rate: $successRate%"
    }
    
    if ($successCount -gt 3) {
        Write-Host ""
        Write-Host "SUCCESS! API working!" -ForegroundColor Green
        Write-Host "Database automatically selected: $($response.database)" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Only processing TRUNCATE statements" -ForegroundColor Yellow
        Write-Host "Backend may need restart to apply code changes" -ForegroundColor Yellow
    }

} catch {
    Write-Host "Error testing API:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}