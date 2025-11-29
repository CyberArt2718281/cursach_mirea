# Kubernetes Undeployment Script
# Удаление всех ресурсов Events Management System

Write-Host "========================================" -ForegroundColor Red
Write-Host "Events Management System - K8s Undeploy" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

$confirmation = Read-Host "Вы уверены, что хотите удалить все ресурсы? (yes/no)"
if ($confirmation -ne 'yes') {
    Write-Host "Отменено" -ForegroundColor Yellow
    exit 0
}

Write-Host "`nУдаление ресурсов..." -ForegroundColor Yellow

# Удаление в обратном порядке
Write-Host "Удаление HPA..." -ForegroundColor Yellow
kubectl delete -f autoscaling/ --ignore-not-found=true

Write-Host "Удаление Ingress..." -ForegroundColor Yellow
kubectl delete -f ingress/ --ignore-not-found=true

Write-Host "Удаление Frontend..." -ForegroundColor Yellow
kubectl delete -f frontend/ --ignore-not-found=true

Write-Host "Удаление Backend..." -ForegroundColor Yellow
kubectl delete -f backend/ --ignore-not-found=true

Write-Host "Удаление MongoDB..." -ForegroundColor Yellow
kubectl delete -f mongodb/ --ignore-not-found=true

Write-Host "Удаление Secrets..." -ForegroundColor Yellow
kubectl delete -f secrets.yaml --ignore-not-found=true

Write-Host "Удаление Namespace..." -ForegroundColor Yellow
kubectl delete -f namespace.yaml --ignore-not-found=true

Write-Host "`n✅ Все ресурсы удалены!" -ForegroundColor Green

Write-Host "`nПроверка:" -ForegroundColor Yellow
kubectl get all -n events-app 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Namespace удален" -ForegroundColor Green
}
