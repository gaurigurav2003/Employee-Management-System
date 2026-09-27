$out = Join-Path (Get-Location) "SwaggerFiles"
New-Item -ItemType Directory -Force -Path $out | Out-Null

$services = @(
    @{ Name="AuthService";       Url="http://localhost:5088/swagger/v1/swagger.json" },
    @{ Name="EmployeeService";   Url="http://localhost:5163/swagger/v1/swagger.json" },
    @{ Name="DepartmentService";Url="http://localhost:5104/swagger/v1/swagger.json" },
    @{ Name="SalaryService";     Url="http://localhost:5118/swagger/v1/swagger.json" },
    @{ Name="LeaveService";      Url="http://localhost:62417/swagger/v1/swagger.json" },
    @{ Name="AttendanceService"; Url="http://localhost:64365/swagger/v1/swagger.json" },
    @{ Name="SupportService";    Url="http://localhost:5133/swagger/v1/swagger.json" }
)

foreach ($s in $services) {
    $file = Join-Path $out "$($s.Name)-swagger.json"
    try {
        Invoke-WebRequest -Uri $s.Url -OutFile $file -ErrorAction Stop
        Write-Host "OK  $($s.Name) -> $file" -ForegroundColor Green
    }
    catch {
        Write-Host "FAIL $($s.Name) -> $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Swagger files are in: $out" -ForegroundColor Cyan
Get-ChildItem $out -Filter "*.json" | Select-Object Name, Length
