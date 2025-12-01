# Скрипт для запуска приложения Events Management в Kubernetes

Write-Host "🚀 Запуск приложения Events Management..." -ForegroundColor Cyan

# 1. Проверка Docker
Write-Host "`n📦 Проверка Docker..." -ForegroundColor Yellow
$dockerStatus = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker не запущен. Запускаем Docker Desktop..." -ForegroundColor Red
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "⏳ Ожидание запуска Docker (30 сек)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}
Write-Host "✅ Docker запущен" -ForegroundColor Green

# 2. Проверка Minikube
Write-Host "`n🎯 Проверка Minikube..." -ForegroundColor Yellow
$minikubeStatus = minikube status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Minikube не запущен. Запускаем кластер..." -ForegroundColor Red
    minikube start --cpus=4 --memory=7168 --driver=docker
} else {
    Write-Host "✅ Minikube уже запущен" -ForegroundColor Green
}

# 3. Проверка pods
Write-Host "`n🔍 Проверка статуса приложения..." -ForegroundColor Yellow
kubectl get pods -n events-app

$podsReady = kubectl get pods -n events-app --field-selector=status.phase=Running --no-headers 2>&1 | Measure-Object -Line | Select-Object -ExpandProperty Lines
Write-Host "✅ Запущено pods: $podsReady" -ForegroundColor Green

# 4. Остановка старых port-forward
Write-Host "`n🛑 Остановка старых подключений..." -ForegroundColor Yellow
Get-Job | Stop-Job -ErrorAction SilentlyContinue
Get-Job | Remove-Job -ErrorAction SilentlyContinue

# 5. Запуск port-forward
Write-Host "`n🌐 Настройка доступа к приложению..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock { kubectl port-forward --address 0.0.0.0 svc/frontend 8080:80 -n events-app }
$backendJob = Start-Job -ScriptBlock { kubectl port-forward --address 0.0.0.0 svc/backend 5000:5000 -n events-app }

Start-Sleep -Seconds 3

# 6. Проверка портов
$frontendPort = Test-NetConnection -ComputerName localhost -Port 8080 -WarningAction SilentlyContinue
$backendPort = Test-NetConnection -ComputerName localhost -Port 5000 -WarningAction SilentlyContinue

if ($frontendPort.TcpTestSucceeded -and $backendPort.TcpTestSucceeded) {
    Write-Host "✅ Порты успешно открыты" -ForegroundColor Green
} else {
    Write-Host "⚠️  Проблемы с открытием портов" -ForegroundColor Yellow
}

# 7. Получение IP адреса
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like '192.168.*' }).IPAddress | Select-Object -First 1

# 8. Информация для доступа
Write-Host "`n╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           ПРИЛОЖЕНИЕ УСПЕШНО ЗАПУЩЕНО!                 ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n📍 Доступ к приложению:" -ForegroundColor Yellow
Write-Host "   С этого компьютера:  http://localhost:8080" -ForegroundColor White
Write-Host "   Из локальной сети:   http://$localIP:8080" -ForegroundColor White

Write-Host "`n🔐 Учетные данные администратора:" -ForegroundColor Yellow
Write-Host "   Email:    artem2006pax@mail.ru" -ForegroundColor White
Write-Host "   Пароль:   Art100306Mar!" -ForegroundColor White

Write-Host "`n📊 Статус jobs:" -ForegroundColor Yellow
Get-Job | Format-Table Id, Name, State

Write-Host "`n⚠️  ВАЖНО:" -ForegroundColor Red
Write-Host "   - Не закрывайте это окно PowerShell" -ForegroundColor White
Write-Host "   - Для остановки нажмите Ctrl+C" -ForegroundColor White
Write-Host "   - Для доступа из локальной сети настройте брандмауэр" -ForegroundColor White

Write-Host "`n🔥 Настройка брандмауэра (от имени администратора):" -ForegroundColor Yellow
Write-Host "   New-NetFirewallRule -DisplayName 'K8s Frontend' -LocalPort 8080 -Protocol TCP -Action Allow" -ForegroundColor Gray
Write-Host "   New-NetFirewallRule -DisplayName 'K8s Backend' -LocalPort 5000 -Protocol TCP -Action Allow" -ForegroundColor Gray

Write-Host "`n🌐 Открываем браузер..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
Start-Process "http://localhost:8080"

Write-Host "`n✅ Готово! Приложение работает..." -ForegroundColor Green
Write-Host "Нажмите Ctrl+C для остановки`n" -ForegroundColor Yellow

# Ожидание
try {
    while ($true) {
        Start-Sleep -Seconds 5
        $jobStates = Get-Job | Select-Object -ExpandProperty State
        if ($jobStates -contains "Failed" -or $jobStates -contains "Stopped") {
            Write-Host "⚠️  Port-forward остановлен, перезапускаем..." -ForegroundColor Yellow
            Get-Job | Stop-Job -ErrorAction SilentlyContinue
            Get-Job | Remove-Job -ErrorAction SilentlyContinue
            Start-Job -ScriptBlock { kubectl port-forward --address 0.0.0.0 svc/frontend 8080:80 -n events-app } | Out-Null
            Start-Job -ScriptBlock { kubectl port-forward --address 0.0.0.0 svc/backend 5000:5000 -n events-app } | Out-Null
        }
    }
} finally {
    Write-Host "`n🛑 Остановка приложения..." -ForegroundColor Red
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    Write-Host "✅ Приложение остановлено" -ForegroundColor Green
}
