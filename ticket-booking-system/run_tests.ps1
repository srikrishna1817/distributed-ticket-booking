$output = @()
$output += "--- VERIFY INDIVIDUAL INSTANCES ---"
$r1 = Invoke-RestMethod -Uri "http://localhost:5001/health"; $output += "5001: $($r1.instance) (Port $($r1.port))"
$r2 = Invoke-RestMethod -Uri "http://localhost:5002/health"; $output += "5002: $($r2.instance) (Port $($r2.port))"
$r3 = Invoke-RestMethod -Uri "http://localhost:5003/health"; $output += "5003: $($r3.instance) (Port $($r3.port))"

$output += "--- TEST LOAD BALANCING (/health) ---"
$r4 = Invoke-RestMethod -Uri "http://localhost/health"; $output += "Req 1 handled by: $($r4.instance)"
$r5 = Invoke-RestMethod -Uri "http://localhost/health"; $output += "Req 2 handled by: $($r5.instance)"
$r6 = Invoke-RestMethod -Uri "http://localhost/health"; $output += "Req 3 handled by: $($r6.instance)"
$r7 = Invoke-RestMethod -Uri "http://localhost/health"; $output += "Req 4 handled by: $($r7.instance)"

$output += "--- TEST API VIA NGINX (/api/matches) ---"
$r8 = Invoke-RestMethod -Uri "http://localhost/api/matches"
$output += "API Success: $($r8.success) - Result Count: $($r8.matches.Count) matches loaded"

$output += "--- TEST LOAD BALANCING (/instance) ---"
$r9 = Invoke-RestMethod -Uri "http://localhost/instance"; $output += "Req 1 handled by instance on port: $($r9.port)"
$r10 = Invoke-RestMethod -Uri "http://localhost/instance"; $output += "Req 2 handled by instance on port: $($r10.port)"
$r11 = Invoke-RestMethod -Uri "http://localhost/instance"; $output += "Req 3 handled by instance on port: $($r11.port)"
$r12 = Invoke-RestMethod -Uri "http://localhost/instance"; $output += "Req 4 handled by instance on port: $($r12.port)"

$output | Out-File "test_results.txt" -Encoding utf8
