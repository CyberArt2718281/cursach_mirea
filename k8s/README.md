# Kubernetes Deployment - Events Management System

## 📋 Структура проекта

```
k8s/
├── namespace.yaml              # Namespace для изоляции
├── secrets.yaml                # Секреты (JWT, Email)
├── mongodb/
│   ├── mongodb-pv.yaml        # PersistentVolumes для данных
│   ├── mongodb-statefulset.yaml # StatefulSet (3 реплики)
│   └── mongodb-service.yaml    # Headless + Client Services
├── backend/
│   ├── backend-configmap.yaml  # Конфигурация приложения
│   ├── backend-deployment.yaml # Deployment (3 реплики)
│   └── backend-service.yaml    # ClusterIP Service
├── frontend/
│   ├── frontend-configmap.yaml # Nginx конфигурация
│   ├── frontend-deployment.yaml # Deployment (3 реплики)
│   └── frontend-service.yaml   # ClusterIP Service
├── ingress/
│   └── ingress.yaml           # Ingress для маршрутизации
├── autoscaling/
│   ├── backend-hpa.yaml       # HPA для backend (3-10 реплик)
│   └── frontend-hpa.yaml      # HPA для frontend (3-10 реплик)
└── monitoring/
    └── servicemonitor.yaml    # Prometheus мониторинг
```

## 🚀 Быстрый старт

### 1. Предварительные требования

```powershell
# Установка инструментов (если не установлены)
choco install kubernetes-cli
choco install minikube
choco install kubernetes-helm

# Запуск Minikube
minikube start --cpus=4 --memory=8192 --driver=docker

# Проверка
kubectl cluster-info
kubectl get nodes
```

### 2. Сборка образов

```powershell
cd C:\Users\User\Desktop\курсовая_работа

# Сборка Backend
docker build -t events-backend:1.0.0 ./backend
docker tag events-backend:1.0.0 events-backend:latest

# Сборка Frontend
docker build -t events-frontend:1.0.0 ./frontend
docker tag events-frontend:1.0.0 events-frontend:latest

# Загрузка в Minikube
minikube image load events-backend:1.0.0
minikube image load events-frontend:1.0.0

# Проверка
minikube image ls | Select-String "events"
```

### 3. Настройка Secrets

**ВАЖНО!** Отредактируйте `secrets.yaml` перед развертыванием:

```yaml
stringData:
  JWT_SECRET: 'your-super-secret-jwt-key' # Смените!
  EMAIL_USER: 'your-email@mail.ru' # Ваш email
  EMAIL_PASS: 'your-app-password' # Пароль приложения
```

### 4. Развертывание (автоматически)

```powershell
cd k8s
.\deploy.ps1
```

### 5. Развертывание (вручную)

```powershell
cd k8s

# 1. Namespace и Secrets
kubectl apply -f namespace.yaml
kubectl apply -f secrets.yaml

# 2. MongoDB
kubectl apply -f mongodb/
kubectl wait --for=condition=ready pod -l app=mongodb -n events-app --timeout=300s

# 3. Backend
kubectl apply -f backend/
kubectl wait --for=condition=ready pod -l app=backend -n events-app --timeout=180s

# 4. Frontend
kubectl apply -f frontend/
kubectl wait --for=condition=ready pod -l app=frontend -n events-app --timeout=180s

# 5. Ingress
kubectl apply -f ingress/

# 6. Autoscaling
kubectl apply -f autoscaling/

# 7. Monitoring
kubectl apply -f monitoring/
```

## 🌐 Доступ к приложению

### 1. Включить Ingress (для Minikube)

```powershell
minikube addons enable ingress
```

### 2. Настроить hosts

Отредактируйте `C:\Windows\System32\drivers\etc\hosts` (от имени администратора):

```
127.0.0.1 events.local
127.0.0.1 api.events.local
```

### 3. Запустить туннель (для Minikube)

```powershell
minikube tunnel
```

### 4. Открыть в браузере

- **Frontend**: http://events.local
- **Backend API**: http://api.events.local/api/events
- **Health Check**: http://api.events.local/api/events

## 📊 Мониторинг и управление

### Просмотр статуса

```powershell
# Все ресурсы
kubectl get all -n events-app

# Pods с подробностями
kubectl get pods -n events-app -o wide

# Services
kubectl get svc -n events-app

# Ingress
kubectl get ingress -n events-app

# HPA (автомасштабирование)
kubectl get hpa -n events-app

# PV и PVC
kubectl get pv,pvc -n events-app
```

### Логи

```powershell
# Backend логи
kubectl logs -f deployment/backend -n events-app

# Frontend логи
kubectl logs -f deployment/frontend -n events-app

# MongoDB логи
kubectl logs -f mongodb-0 -n events-app

# Все логи конкретного pod
kubectl logs -f <pod-name> -n events-app

# Предыдущие логи (если pod перезапустился)
kubectl logs <pod-name> -n events-app --previous
```

### Debugging

```powershell
# Описание pod (проблемы с запуском)
kubectl describe pod <pod-name> -n events-app

# События в namespace
kubectl get events -n events-app --sort-by='.lastTimestamp'

# Войти в контейнер
kubectl exec -it <pod-name> -n events-app -- /bin/sh

# Тест подключения к MongoDB
kubectl exec -it mongodb-0 -n events-app -- mongosh events_management

# Тест Backend API изнутри кластера
kubectl run test --image=curlimages/curl -it --rm -n events-app -- curl http://backend:5000/api/events
```

### Масштабирование

```powershell
# Ручное масштабирование
kubectl scale deployment backend --replicas=5 -n events-app
kubectl scale deployment frontend --replicas=5 -n events-app

# Проверка HPA
kubectl get hpa -n events-app -w

# Детали HPA
kubectl describe hpa backend-hpa -n events-app
```

## 🔄 Обновление приложения

### Rolling Update

```powershell
# Пересборка образов
docker build -t events-backend:1.0.1 ./backend
docker build -t events-frontend:1.0.1 ./frontend

# Загрузка в Minikube
minikube image load events-backend:1.0.1
minikube image load events-frontend:1.0.1

# Обновление deployment
kubectl set image deployment/backend backend=events-backend:1.0.1 -n events-app
kubectl set image deployment/frontend frontend=events-frontend:1.0.1 -n events-app

# Проверка статуса обновления
kubectl rollout status deployment/backend -n events-app
kubectl rollout status deployment/frontend -n events-app

# История обновлений
kubectl rollout history deployment/backend -n events-app
```

### Откат обновления

```powershell
# Откат к предыдущей версии
kubectl rollout undo deployment/backend -n events-app

# Откат к конкретной версии
kubectl rollout undo deployment/backend --to-revision=2 -n events-app
```

## 💾 Бэкапы MongoDB

### Создание бэкапа

```powershell
# Создать бэкап
kubectl exec mongodb-0 -n events-app -- mongodump --out=/tmp/backup --db=events_management

# Скопировать локально
kubectl cp events-app/mongodb-0:/tmp/backup ./mongodb-backup-$(Get-Date -Format "yyyy-MM-dd")

# Или с архивацией
kubectl exec mongodb-0 -n events-app -- mongodump --archive=/tmp/backup.archive --db=events_management
kubectl cp events-app/mongodb-0:/tmp/backup.archive ./backup-$(Get-Date -Format "yyyy-MM-dd").archive
```

### Восстановление из бэкапа

```powershell
# Скопировать бэкап в pod
kubectl cp ./backup.archive events-app/mongodb-0:/tmp/restore.archive

# Восстановить
kubectl exec mongodb-0 -n events-app -- mongorestore --archive=/tmp/restore.archive --db=events_management
```

## 🧹 Удаление

### Автоматическое удаление

```powershell
cd k8s
.\undeploy.ps1
```

### Ручное удаление

```powershell
# Удалить все ресурсы
kubectl delete namespace events-app

# Или по файлам
kubectl delete -f autoscaling/
kubectl delete -f ingress/
kubectl delete -f frontend/
kubectl delete -f backend/
kubectl delete -f mongodb/
kubectl delete -f secrets.yaml
kubectl delete -f namespace.yaml

# Удалить PV (если нужно)
kubectl delete pv mongodb-pv-0 mongodb-pv-1 mongodb-pv-2
```

## 🔧 Troubleshooting

### ImagePullBackOff

```powershell
kubectl describe pod <pod-name> -n events-app
# Причины: образ не найден, нет доступа к registry
# Решение: minikube image load <image-name>
```

### CrashLoopBackOff

```powershell
kubectl logs <pod-name> -n events-app --previous
# Причины: ошибка в приложении, неверная конфигурация
# Решение: проверьте логи и переменные окружения
```

### Pending Pods

```powershell
kubectl describe pod <pod-name> -n events-app
# Причины: недостаточно ресурсов, PVC не может быть создан
# Решение: увеличьте ресурсы кластера или проверьте PV
```

### MongoDB не запускается

```powershell
# Проверка PV
kubectl get pv

# Проверка PVC
kubectl get pvc -n events-app

# Логи MongoDB
kubectl logs mongodb-0 -n events-app

# Проверка прав доступа (на хосте)
ls -la /mnt/data/
```

### Backend не подключается к MongoDB

```powershell
# Проверка MongoDB Service
kubectl get svc mongodb-client -n events-app

# Тест подключения из Backend pod
kubectl exec -it <backend-pod> -n events-app -- sh
# ping mongodb-client
# wget -O- http://mongodb-client:27017
```

### HPA не работает

```powershell
# Проверка Metrics Server
kubectl get deployment metrics-server -n kube-system

# Если нет, установить
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Для Minikube
minikube addons enable metrics-server

# Проверка метрик
kubectl top nodes
kubectl top pods -n events-app
```

## 📈 Production Ready

Для продакшн-окружения:

1. **SSL/TLS**

   ```powershell
   helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace
   ```

2. **Мониторинг**

   ```powershell
   helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
   ```

3. **Логирование**

   ```powershell
   helm install loki grafana/loki-stack -n logging --create-namespace
   ```

4. **Безопасность**

   - Network Policies
   - Pod Security Policies
   - RBAC
   - Secrets управление (Sealed Secrets, External Secrets)

5. **Backup**
   - Velero для бэкапа кластера
   - Регулярные бэкапы MongoDB

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи: `kubectl logs -f <pod-name> -n events-app`
2. Проверьте события: `kubectl get events -n events-app --sort-by='.lastTimestamp'`
3. Проверьте ресурсы: `kubectl top pods -n events-app`
4. Проверьте сеть: `kubectl exec -it <pod> -n events-app -- ping <service>`
