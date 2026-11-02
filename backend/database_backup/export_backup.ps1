$connStr = "Server=localhost;Database=HETHONGQUANLYBENHANCANHAN;User Id=sa;Password=20062006Tri;TrustServerCertificate=True;"
$outDir = Join-Path $PSScriptRoot "json_data"
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir | Out-Null }

$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
$conn.Open()

$tablesCmd = $conn.CreateCommand()
$tablesCmd.CommandText = "SELECT name FROM sys.tables WHERE is_ms_shipped = 0 ORDER BY name"
$reader = $tablesCmd.ExecuteReader()
$tables = New-Object System.Collections.Generic.List[string]
while ($reader.Read()) {
    $tables.Add($reader.GetString(0))
}
$reader.Close()

foreach ($tbl in $tables) {
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "SELECT * FROM [$tbl] FOR JSON AUTO"
    $jsonReader = $cmd.ExecuteReader()
    $sb = New-Object System.Text.StringBuilder
    while ($jsonReader.Read()) {
        if (!$jsonReader.IsDBNull(0)) {
            $sb.Append($jsonReader.GetString(0)) | Out-Null
        }
    }
    $jsonReader.Close()
    
    $content = $sb.ToString().Trim()
    $filePath = Join-Path $outDir "$tbl.json"
    if ([string]::IsNullOrWhiteSpace($content)) {
        [System.IO.File]::WriteAllText($filePath, "[]", [System.Text.Encoding]::UTF8)
        Write-Host "Exported [$tbl] (0 rows) -> $filePath"
    } else {
        [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Exported [$tbl] (SUCCESS) -> $filePath"
    }
}

$conn.Close()
Write-Host "ALL TABLES EXPORTED SUCCESSFULLY TO JSON!"
