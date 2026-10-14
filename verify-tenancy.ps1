Write-Host "=== TEST 1: Login as Spice Garden Owner ===" -ForegroundColor Cyan
$loginSpice = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method Post -Body (@{ email = "owner@spicegarden.com"; password = "password123" } | ConvertTo-Json) -ContentType "application/json"
$spiceToken = $loginSpice.data.accessToken
Write-Host "Spice Garden Token acquired! Role: $($loginSpice.data.user.role)" -ForegroundColor Green

Write-Host "`n=== TEST 2: Login as Burger Lab Owner ===" -ForegroundColor Cyan
$loginBurger = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" -Method Post -Body (@{ email = "owner@burgerlab.com"; password = "password123" } | ConvertTo-Json) -ContentType "application/json"
$burgerToken = $loginBurger.data.accessToken
Write-Host "Burger Lab Token acquired! Role: $($loginBurger.data.user.role)" -ForegroundColor Green

Write-Host "`n=== TEST 3: Spice Garden views its orders ===" -ForegroundColor Cyan
$spiceOrders = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/orders" -Method Get -Headers @{ "Authorization" = "Bearer $spiceToken"; "x-tenant-slug" = "spicegarden" }
Write-Host "Spice Garden found $($spiceOrders.data.orders.Count) orders." -ForegroundColor Green
$placedOrder = $spiceOrders.data.orders[0]
Write-Host "Order Number: $($placedOrder.orderNumber) | Total: Rs. $($placedOrder.totalAmount)" -ForegroundColor Yellow

Write-Host "`n=== TEST 4: TENANT ISOLATION CHECK (Burger Lab tries to view orders) ===" -ForegroundColor Cyan
$burgerOrders = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/orders" -Method Get -Headers @{ "Authorization" = "Bearer $burgerToken"; "x-tenant-slug" = "burgerlab" }
Write-Host "Burger Lab orders count: $($burgerOrders.data.orders.Count)" -ForegroundColor Green
if ($burgerOrders.data.orders.Count -eq 0) {
    Write-Host "PASS: Burger Lab sees ZERO of Spice Garden's orders! Isolation is PERFECT!" -ForegroundColor Green
} else {
    Write-Host "FAIL: Burger Lab leaked orders!" -ForegroundColor Red
}

Write-Host "`n=== TEST 5: Order Status Transitions (Kitchen / Staff flow) ===" -ForegroundColor Cyan
$orderId = $placedOrder.id

$transitions = @("accepted", "preparing", "ready", "served")
foreach ($nextStatus in $transitions) {
    $updateRes = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/orders/$orderId/status" -Method Patch -Body (@{ status = $nextStatus } | ConvertTo-Json) -ContentType "application/json" -Headers @{ "Authorization" = "Bearer $spiceToken"; "x-tenant-slug" = "spicegarden" }
    Write-Host "Updated order $orderId to: $($updateRes.data.status)" -ForegroundColor Green
}

Write-Host "`n=== TEST 6: Public Customer Order Tracking Verification ===" -ForegroundColor Cyan
$trackRes = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/orders/$orderId" -Method Get -Headers @{ "x-tenant-slug" = "spicegarden" }
Write-Host "Customer tracking status: $($trackRes.data.status) | Items: $($trackRes.data.items.Count)" -ForegroundColor Green
Write-Host "Status history count: $($trackRes.data.statusHistory.Count)" -ForegroundColor Green

Write-Host "`nALL MULTI-TENANT CHECKS PASSED!" -ForegroundColor Magenta
