# Kubernetes Deployment Guide

## Описание

Полное руководство по развертыванию приложения Events Management в Kubernetes кластере с использованием Minikube.

## Архитектура

- **Frontend**: Angular 14 + Nginx (3 реплики)
- **Backend**: Node.js + Express (3 реплики)
- **Database**: MongoDB 7 (1 реплика, StatefulSet)
- **Ingress**: Nginx Ingress Controller
- **Auto-scaling**: HPA на основе CPU/RAM

## Предварительные требования

1. **Docker Desktop** - для работы с контейнерами
2. **Minikube** - локальный Kubernetes кластер
3. **kubectl** - CLI для управления Kubernetes

### Установка инструментов

```powershell
# Установка через Chocolatey (если не установлен)
choco install minikube kubectl docker-desktop
```

## Быстрый старт

### 1. Запуск Minikube

```powershell
# Запуск кластера с достаточными ресурсами
minikube start --cpus=4 --memory=7168 --driver=docker
```

### 2. Сборка Docker образов

```powershell
# Backend
docker build -t events-backend:1.0.0 ./backend

# Frontend
docker build -t events-frontend:1.0.0 ./frontend
```

### 3. Загрузка образов в Minikube

```powershell
# Сохранение образов
docker save events-backend:1.0.0 -o backend.tar
docker save events-frontend:1.0.0 -o frontend.tar

# Загрузка в Minikube
minikube image load backend.tar
minikube image load frontend.tar
```

### 4. Настройка секретов

Отредактируйте `k8s/secrets.yaml` и укажите свои значения:

```yaml
stringData:
  JWT_SECRET: "your-secret-key-here"
  EMAIL_USER: "your-email@gmail.com"
  EMAIL_PASS: "your-app-password"
```

### 5. Развертывание приложения

```powershell
# Создание namespace
kubectl apply -f k8s/namespace.yaml

# Секреты
kubectl apply -f k8s/secrets.yaml

# MongoDB
kubectl apply -f k8s/mongodb/

# Backend
kubectl apply -f k8s/backend/

# Frontend
kubectl apply -f k8s/frontend/

# Ingress
kubectl apply -f k8s/ingress/
```

### 6. Инициализация данных

```powershell
# Получить имя backend pod
kubectl get pods -n events-app -l app=backend

# Запустить seed скрипт (замените POD_NAME)
kubectl exec POD_NAME -n events-app -- node seed.js
```

### 7. Включение Ingress

```powershell
minikube addons enable ingress
```

### 8. Доступ к приложению

#### Вариант A: Через NodePort (рекомендуется для Windows)

```powershell
# Запустить service tunnel
minikube service frontend -n events-app
```

Откроется браузер с URL вида `http://127.0.0.1:XXXXX`

#### Вариант B: Через прямой доступ

```powershell
# Получить IP Minikube
minikube ip
# Например: 192.168.49.2

# Получить порты
kubectl get services -n events-app
# frontend: 30980
# backend: 31412
```

Откройте в браузере: `http://192.168.49.2:30980`

## Учетные данные

После выполнения seed скрипта доступны следующие пользователи:

### Администратор
- **Email**: artem2006pax@mail.ru
- **Пароль**: Art100306Mar!

### Организатор
- **Email**: organizer1@example.com
- **Пароль**: Org123456!

### Пользователь
- **Email**: user1@example.com
- **Пароль**: User123456!

## Управление кластером

### Проверка статуса

```powershell
# Все ресурсы
kubectl get all -n events-app

# Pods
kubectl get pods -n events-app

# Services
kubectl get services -n events-app

# Ingress
kubectl get ingress -n events-app
```

### Просмотр логов

```powershell
# Backend
kubectl logs -n events-app -l app=backend --tail=50

# Frontend
kubectl logs -n events-app -l app=frontend --tail=50

# MongoDB
kubectl logs mongodb-0 -n events-app --tail=50
```

### Масштабирование

```powershell
# Увеличить количество реплик backend
kubectl scale deployment backend -n events-app --replicas=5

# Уменьшить frontend
kubectl scale deployment frontend -n events-app --replicas=2
```

### Обновление приложения

```powershell
# После изменений в коде пересоберите образ
docker build -t events-backend:1.0.0 ./backend

# Загрузите в Minikube
docker save events-backend:1.0.0 -o backend.tar
minikube image load backend.tar

# Перезапустите deployment
kubectl rollout restart deployment backend -n events-app

# Проверьте статус обновления
kubectl rollout status deployment backend -n events-app
```

## Устранение неполадок

### Pods не запускаются

```powershell
# Проверить описание pod
kubectl describe pod POD_NAME -n events-app

# Проверить события
kubectl get events -n events-app --sort-by='.lastTimestamp'
```

### Ошибки образов

```powershell
# Проверить образы в Minikube
minikube image ls | Select-String "events-"

# Если образов нет, загрузите заново
```

### CORS ошибки

Backend настроен на разрешение запросов от:
- `http://localhost:*`
- `http://127.0.0.1:*`
- `http://192.168.49.2:*`

Если используете другой IP, обновите `backend/server.js`.

### База данных пустая

```powershell
# Подключиться к MongoDB
kubectl exec -it mongodb-0 -n events-app -- mongosh events_management

# Проверить пользователей
db.users.find()

# Если пусто, запустите seed
kubectl exec BACKEND_POD_NAME -n events-app -- node seed.js
```

### Приложение недоступно

```powershell
# Проверить, запущен ли Minikube
minikube status

# Проверить services
kubectl get services -n events-app

# Для Windows используйте minikube service
minikube service frontend -n events-app
```

## Остановка и удаление

### Остановка приложения

```powershell
# Удалить все ресурсы в namespace
kubectl delete namespace events-app
```

### Остановка Minikube

```powershell
# Остановить кластер
minikube stop

# Удалить кластер полностью
minikube delete
```

## Мониторинг

### Включить метрики

```powershell
minikube addons enable metrics-server
```

### Просмотр использования ресурсов

```powershell
# По подам
kubectl top pods -n events-app

# По нодам
kubectl top nodes
```

### Dashboard

```powershell
# Запустить Kubernetes Dashboard
minikube dashboard
```

## Auto-scaling

HPA (Horizontal Pod Autoscaler) настроен для автоматического масштабирования:

- **Backend**: 3-10 реплик (CPU 70%, RAM 80%)
- **Frontend**: 3-10 реплик (CPU 70%, RAM 80%)

```powershell
# Проверить статус HPA
kubectl get hpa -n events-app

# Детальная информация
kubectl describe hpa backend-hpa -n events-app
```

## Производительность

### Рекомендуемые ресурсы Minikube

- **CPU**: 4 ядра
- **RAM**: 7-8 GB
- **Disk**: 20 GB

### Лимиты контейнеров

#### MongoDB
- Requests: 250m CPU, 512Mi RAM
- Limits: 500m CPU, 1Gi RAM

#### Backend
- Requests: 250m CPU, 256Mi RAM
- Limits: 500m CPU, 512Mi RAM

#### Frontend
- Requests: 100m CPU, 128Mi RAM
- Limits: 200m CPU, 256Mi RAM

## Дополнительные команды

```powershell
# Перенаправление портов локально
kubectl port-forward svc/backend 5000:5000 -n events-app
kubectl port-forward svc/frontend 8080:80 -n events-app

# Выполнение команд в pod
kubectl exec -it POD_NAME -n events-app -- /bin/sh

# Копирование файлов
kubectl cp local-file.txt events-app/POD_NAME:/path/in/pod

# Получить конфигурацию
kubectl get deployment backend -n events-app -o yaml

# Редактировать ресурс
kubectl edit deployment backend -n events-app
```

## Структура K8s манифестов

```
k8s/
├── namespace.yaml              # Namespace для приложения
├── secrets.yaml                # Секреты (JWT, email)
├── mongodb/
│   ├── mongodb-pv.yaml        # PersistentVolumes
│   ├── mongodb-statefulset.yaml # MongoDB StatefulSet
│   └── mongodb-service.yaml   # MongoDB Services
├── backend/
│   ├── backend-configmap.yaml # Конфигурация backend
│   ├── backend-deployment.yaml # Backend Deployment
│   └── backend-service.yaml   # Backend Service
├── frontend/
│   ├── frontend-configmap.yaml # Nginx конфигурация
│   ├── frontend-deployment.yaml # Frontend Deployment
│   └── frontend-service.yaml  # Frontend Service
├── ingress/
│   └── ingress.yaml           # Ingress маршрутизация
├── autoscaling/
│   ├── backend-hpa.yaml       # Backend HPA
│   └── frontend-hpa.yaml      # Frontend HPA
└── monitoring/
    └── servicemonitor.yaml    # Prometheus мониторинг
```

## Полезные ссылки

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

## Поддержка

При возникновении проблем:
1. Проверьте логи pods: `kubectl logs POD_NAME -n events-app`
2. Проверьте события: `kubectl get events -n events-app`
3. Проверьте описание ресурса: `kubectl describe RESOURCE NAME -n events-app`
