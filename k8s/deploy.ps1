# Kubernetes Deployment Script для Events Management System
# PowerShell скрипт для автоматического развертывания

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Events Management System - K8s Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Проверка kubectl
Write-Host "Проверка kubectl..." -ForegroundColor Yellow
if (!(Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Host "❌ kubectl не найден! Установите: choco install kubernetes-cli" -ForegroundColor Red
    exit 1
}
Write-Host "✅ kubectl найден" -ForegroundColor Green

# Проверка кластера
Write-Host "`nПроверка Kubernetes кластера..." -ForegroundColor Yellow
try {
    kubectl cluster-info | Out-Null
    Write-Host "✅ Кластер доступен" -ForegroundColor Green
} catch {
    Write-Host "❌ Кластер недоступен! Запустите: minikube start" -ForegroundColor Red
    exit 1
}

# Создание namespace
Write-Host "`n[1/8] Создание namespace..." -ForegroundColor Yellow
kubectl apply -f namespace.yaml
Start-Sleep -Seconds 2

# Создание secrets
Write-Host "`n[2/8] Создание secrets..." -ForegroundColor Yellow
Write-Host "⚠️  ВНИМАНИЕ: Отредактируйте secrets.yaml перед продакшн!" -ForegroundColor Magenta
kubectl apply -f secrets.yaml
Start-Sleep -Seconds 2

# Развертывание MongoDB
Write-Host "`n[3/8] Развертывание MongoDB StatefulSet..." -ForegroundColor Yellow
kubectl apply -f mongodb/mongodb-pv.yaml
Start-Sleep -Seconds 2
kubectl apply -f mongodb/mongodb-statefulset.yaml
kubectl apply -f mongodb/mongodb-service.yaml

Write-Host "Ожидание запуска MongoDB pods..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=mongodb -n events-app --timeout=300s

# Развертывание Backend
Write-Host "`n[4/8] Развертывание Backend..." -ForegroundColor Yellow
kubectl apply -f backend/backend-configmap.yaml
kubectl apply -f backend/backend-deployment.yaml
kubectl apply -f backend/backend-service.yaml

Write-Host "Ожидание запуска Backend pods..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=backend -n events-app --timeout=180s

# Развертывание Frontend
Write-Host "`n[5/8] Развертывание Frontend..." -ForegroundColor Yellow
kubectl apply -f frontend/frontend-configmap.yaml
kubectl apply -f frontend/frontend-deployment.yaml
kubectl apply -f frontend/frontend-service.yaml

Write-Host "Ожидание запуска Frontend pods..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=frontend -n events-app --timeout=180s

# Настройка Ingress
Write-Host "`n[6/8] Настройка Ingress..." -ForegroundColor Yellow
kubectl apply -f ingress/ingress.yaml
Start-Sleep -Seconds 3

# Автомасштабирование
Write-Host "`n[7/8] Настройка автомасштабирования (HPA)..." -ForegroundColor Yellow
kubectl apply -f autoscaling/backend-hpa.yaml
kubectl apply -f autoscaling/frontend-hpa.yaml

# Мониторинг
Write-Host "`n[8/8] Настройка мониторинга..." -ForegroundColor Yellow
kubectl apply -f monitoring/servicemonitor.yaml

# Итоговая информация
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ Развертывание завершено!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nСтатус ресурсов:" -ForegroundColor Yellow
kubectl get all -n events-app

Write-Host "`nСтатус PV и PVC:" -ForegroundColor Yellow
kubectl get pv,pvc -n events-app

Write-Host "`nIngress:" -ForegroundColor Yellow
kubectl get ingress -n events-app

Write-Host "`nHPA:" -ForegroundColor Yellow
kubectl get hpa -n events-app

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Доступ к приложению:" -ForegroundColor Yellow
Write-Host "1. Добавьте в hosts файл:" -ForegroundColor White
Write-Host "   C:\Windows\System32\drivers\etc\hosts" -ForegroundColor Gray
Write-Host "   127.0.0.1 events.local" -ForegroundColor Gray
Write-Host "   127.0.0.1 api.events.local" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Если используете minikube, запустите:" -ForegroundColor White
Write-Host "   minikube tunnel" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Откройте браузер:" -ForegroundColor White
Write-Host "   http://events.local" -ForegroundColor Cyan
Write-Host "   http://api.events.local/api/events" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nПолезные команды:" -ForegroundColor Yellow
Write-Host "  kubectl logs -f deployment/backend -n events-app" -ForegroundColor Gray
Write-Host "  kubectl logs -f deployment/frontend -n events-app" -ForegroundColor Gray
Write-Host "  kubectl get pods -n events-app -w" -ForegroundColor Gray
Write-Host "  kubectl describe pod <pod-name> -n events-app" -ForegroundColor Gray
Write-Host ""
