param (
    [switch]$DryRun = $true,
    [switch]$Execute = $false,
    [switch]$ProductionConfirm = $false
)

$server = "localhost"
$db = "HETHONGQUANLYBENHANCANHAN"
$user = "sa"
$pass = "20062006Tri"
$isProduction = ($env:SPRING_PROFILES_ACTIVE -eq "prod") -or ($server -ne "localhost" -and $server -ne "127.0.0.1")

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "    HE THONG DON DEP DU LIEU CSDL Y TE - PHR VIET NAM" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

if ($isProduction -and !$ProductionConfirm) {
    Write-Error "CANH BAO AN TOAN: Phat hien moi truong PRODUCTION! Script bi tu choi chay tru khi truyen co -ProductionConfirm."
    exit 1
}

if ($Execute) {
    $DryRun = $false
}

if ($DryRun) {
    Write-Host "[CHE DO DRY-RUN]: Chi kiem tra va thong ke du lieu se xoa. KHONG co ban ghi nao bi thay doi." -ForegroundColor Yellow
} else {
    Write-Host "[CHE DO XOA THAT]: Script se tien hanh xoa du lieu mau trong TRANSACTION." -ForegroundColor Red
}

$connStr = "Server=$server;Database=$db;User Id=$user;Password=$pass;TrustServerCertificate=True;"
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
$conn.Open()

# 1. THONG KE SO LUONG BAN GHI SE XU LY
$statsSql = @"
SELECT
    (SELECT COUNT(*) FROM prescription_items) AS count_prescription_items,
    (SELECT COUNT(*) FROM prescriptions) AS count_prescriptions,
    (SELECT COUNT(*) FROM lab_test_results) AS count_lab_tests,
    (SELECT COUNT(*) FROM imaging_results) AS count_imaging,
    (SELECT COUNT(*) FROM internal_record_details) AS count_internal_details,
    (SELECT COUNT(*) FROM surgical_record_details) AS count_surgical_details,
    (SELECT COUNT(*) FROM obstetric_record_details) AS count_obstetric_details,
    (SELECT COUNT(*) FROM pediatric_record_details) AS count_pediatric_details,
    (SELECT COUNT(*) FROM vital_signs) AS count_vital_signs,
    (SELECT COUNT(*) FROM doctor_notes) AS count_doctor_notes,
    (SELECT COUNT(*) FROM department_transfers) AS count_dept_transfers,
    (SELECT COUNT(*) FROM medical_attachments) AS count_attachments,
    (SELECT COUNT(*) FROM allergies) AS count_allergies,
    (SELECT COUNT(*) FROM chronic_diseases) AS count_chronic_diseases,
    (SELECT COUNT(*) FROM health_metrics) AS count_health_metrics,
    (SELECT COUNT(*) FROM medical_appointments) AS count_appointments,
    (SELECT COUNT(*) FROM medical_records) AS count_medical_records,
    (SELECT COUNT(*) FROM health_profiles) AS count_health_profiles,
    (SELECT COUNT(*) FROM token WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@phr.vn' AND email <> 'admin@phr.vn' OR email LIKE 'test_%')) AS count_tokens,
    (SELECT COUNT(*) FROM user_actions WHERE username IN (SELECT email FROM users WHERE email LIKE '%@phr.vn' AND email <> 'admin@phr.vn' OR email LIKE 'test_%')) AS count_user_actions,
    (SELECT COUNT(*) FROM users_roles WHERE users_id IN (SELECT id FROM users WHERE email LIKE '%@phr.vn' AND email <> 'admin@phr.vn' OR email LIKE 'test_%')) AS count_users_roles,
    (SELECT COUNT(*) FROM users WHERE email LIKE '%@phr.vn' AND email <> 'admin@phr.vn' OR email LIKE 'test_%') AS count_mock_users;
"@

$cmdStats = $conn.CreateCommand()
$cmdStats.CommandText = $statsSql
$reader = $cmdStats.ExecuteReader()
if ($reader.Read()) {
    Write-Host "`n--- DANH SACH BAN GHI DU KIEN XOA (THEO THU TU KHOA NGOAI) ---" -ForegroundColor Cyan
    Write-Host "1.  prescription_items      : " $reader["count_prescription_items"] " ban ghi"
    Write-Host "2.  prescriptions           : " $reader["count_prescriptions"] " ban ghi"
    Write-Host "3.  lab_test_results        : " $reader["count_lab_tests"] " ban ghi"
    Write-Host "4.  imaging_results         : " $reader["count_imaging"] " ban ghi"
    Write-Host "5.  internal_record_details : " $reader["count_internal_details"] " ban ghi"
    Write-Host "6.  surgical_record_details : " $reader["count_surgical_details"] " ban ghi"
    Write-Host "7.  obstetric_record_details: " $reader["count_obstetric_details"] " ban ghi"
    Write-Host "8.  pediatric_record_details: " $reader["count_pediatric_details"] " ban ghi"
    Write-Host "9.  vital_signs             : " $reader["count_vital_signs"] " ban ghi"
    Write-Host "10. doctor_notes            : " $reader["count_doctor_notes"] " ban ghi"
    Write-Host "11. department_transfers    : " $reader["count_dept_transfers"] " ban ghi"
    Write-Host "12. medical_attachments     : " $reader["count_attachments"] " ban ghi"
    Write-Host "13. allergies               : " $reader["count_allergies"] " ban ghi"
    Write-Host "14. chronic_diseases        : " $reader["count_chronic_diseases"] " ban ghi"
    Write-Host "15. health_metrics          : " $reader["count_health_metrics"] " ban ghi"
    Write-Host "16. medical_appointments    : " $reader["count_appointments"] " ban ghi"
    Write-Host "17. medical_records         : " $reader["count_medical_records"] " ban ghi"
    Write-Host "18. health_profiles         : " $reader["count_health_profiles"] " ban ghi"
    Write-Host "19. token (user test)       : " $reader["count_tokens"] " ban ghi"
    Write-Host "20. user_actions (user test): " $reader["count_user_actions"] " ban ghi"
    Write-Host "21. users_roles (user test) : " $reader["count_users_roles"] " ban ghi"
    Write-Host "22. users (bac si mau/test) : " $reader["count_mock_users"] " tai khoan"
    Write-Host "-----------------------------------------------------------------"
}
$reader.Close()

if ($DryRun) {
    Write-Host "`n=> KET THUC DRY-RUN THANH CONG: Du lieu chua bi thay doi." -ForegroundColor Green
    Write-Host "De thuc hien xoa that sau khi xac nhan, chay lai voi tham so: -Execute" -ForegroundColor Yellow
    $conn.Close()
    exit 0
}

# 2. CHE DO XOA THAT VOI TRANSACTION
Write-Host "`nDANG BAT DAU TRANSACTION DE DON DEP DU LIEU..." -ForegroundColor Yellow
$tran = $conn.BeginTransaction()

try {
    $cleanupSql = @"
    -- 1. Cac bang con cua medical_records
    DELETE FROM prescription_items;
    DELETE FROM prescriptions;
    DELETE FROM lab_test_results;
    DELETE FROM imaging_results;
    DELETE FROM internal_record_details;
    DELETE FROM surgical_procedures;
    DELETE FROM surgical_record_details;
    DELETE FROM prenatal_visits;
    DELETE FROM obstetric_record_details;
    DELETE FROM pediatric_growth_records;
    DELETE FROM pediatric_record_details;
    DELETE FROM vital_signs;
    DELETE FROM doctor_notes;
    DELETE FROM department_transfers;
    DELETE FROM medical_attachments;

    -- 2. Cac bang con cua health_profiles
    DELETE FROM allergies;
    DELETE FROM chronic_diseases;
    DELETE FROM health_metrics;
    DELETE FROM family_medical_histories;
    DELETE FROM vaccination_records;
    DELETE FROM profile_shares;

    -- 3. Lich hen va benh an cu
    DELETE FROM medical_appointments;
    DELETE FROM medical_records;
    DELETE FROM health_profiles;

    -- 4. Audit Log go lien ket voi cac user bi xoa (set user_id = NULL)
    UPDATE audit_logs SET user_id = NULL WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@phr.vn' AND email <> 'admin@phr.vn' OR email LIKE 'test_%');

    -- 5. Token, user_actions, users_roles cua user mau
    DELETE FROM token WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@phr.vn' AND email <> 'admin@phr.vn' OR email LIKE 'test_%');
    DELETE FROM user_actions WHERE username IN (SELECT email FROM users WHERE email LIKE '%@phr.vn' AND email <> 'admin@phr.vn' OR email LIKE 'test_%');
    DELETE FROM users_roles WHERE users_id IN (SELECT id FROM users WHERE email LIKE '%@phr.vn' AND email <> 'admin@phr.vn' OR email LIKE 'test_%');

    -- 6. Xoa cac tai khoan bac si mau va user test (GIU LAI: admin@phr.vn va minhtri210595@gmail.com)
    DELETE FROM users WHERE (email LIKE '%@phr.vn' AND email <> 'admin@phr.vn') OR email LIKE 'test_%';
"@

    $cmdCleanup = $conn.CreateCommand()
    $cmdCleanup.Transaction = $tran
    $cmdCleanup.CommandText = $cleanupSql
    $cmdCleanup.ExecuteNonQuery() | Out-Null

    $tran.Commit()
    Write-Host "`n=> GIAO DICH COMMIT THANH CONG! DA DON DEP DU LIEU HOAN TAT." -ForegroundColor Green
}
catch {
    $tran.Rollback()
    Write-Error "GAP LOI TRONG QUA TRINH XOA. DA ROLLBACK GIAO DICH AN TOAN! Chi tiet: $_"
    $conn.Close()
    exit 1
}

$afterSql = "SELECT t.name AS TableName, p.rows AS [RowCount] FROM sys.tables t INNER JOIN sys.partitions p ON t.object_id = p.object_id WHERE p.index_id IN (0, 1) ORDER BY TableName;"
$cmdAfter = $conn.CreateCommand()
$cmdAfter.CommandText = $afterSql
$readerAfter = $cmdAfter.ExecuteReader()

Write-Host "`n=================================================================" -ForegroundColor Cyan
Write-Host "    BAO CAO SO BAN GHI CON LAI TRONG CO SO DU LIEU" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
while ($readerAfter.Read()) {
    $tName = $readerAfter["TableName"]
    $rCount = $readerAfter["RowCount"]
    if ($rCount -gt 0) {
        Write-Host "  $tName : $rCount ban ghi" -ForegroundColor White
    }
}
$readerAfter.Close()
$conn.Close()
