# Hướng Dẫn Vận Hành Dự Án Web App & Backend

Tài liệu này hướng dẫn chi tiết các lệnh để chạy Frontend (Web App), Khởi tạo & Chạy Database (PostgreSQL), và Chạy Backend (FastAPI).

---

## 1. Lệnh Chạy Database (PostgreSQL) & Khởi Tạo

### A. Chạy Container PostgreSQL (bằng Docker)
Nếu bạn chưa có sẵn PostgreSQL trên máy, cách nhanh nhất là khởi chạy bằng Docker:

```bash
docker run --name webapp-postgres \
  -e POSTGRES_USER=username \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=database_name \
  -p 5432:5432 \
  -d postgres:alpine
```

*Nếu đã có Docker Compose, bạn có thể chạy:*
```bash
docker-compose up -d
```

### B. Cấu Hình Kết Nối Database
Tạo hoặc kiểm tra file cấu hình tại `app/resources/application.yaml` (hoặc `app/resources/application-dev.yaml`):

```yaml
data_source:
  drivername: "postgresql+psycopg2"
  host: "localhost"
  port: 5432
  username: "username"
  password: "password"
  database: "database_name"
  pool_size: 5
```

Hoặc thiết lập thông qua biến môi trường (Environment Variables):
- **Windows (PowerShell):**
  ```powershell
  $env:APP_DATA_SOURCE__HOST="localhost"
  $env:APP_DATA_SOURCE__PORT="5432"
  $env:APP_DATA_SOURCE__USERNAME="username"
  $env:APP_DATA_SOURCE__PASSWORD="password"
  $env:APP_DATA_SOURCE__DATABASE="database_name"
  $env:APP_DATA_SOURCE__DRIVERNAME="postgresql+psycopg2"
  ```
- **Linux / macOS:**
  ```bash
  export APP_DATA_SOURCE__HOST=localhost
  export APP_DATA_SOURCE__PORT=5432
  export APP_DATA_SOURCE__USERNAME=username
  export APP_DATA_SOURCE__PASSWORD=password
  export APP_DATA_SOURCE__DATABASE=database_name
  export APP_DATA_SOURCE__DRIVERNAME=postgresql+psycopg2
  ```

---

## 2. Lệnh Chạy Backend (FastAPI)

### Step 1: Cài đặt Dependencies
Tại thư mục gốc của dự án (`Webapp/`):

```bash
pip install -r requirements.txt
```

### Step 2: Chạy Uvicorn Server
Chạy Backend ở chế độ development (tự động reload khi sửa code):

```bash
uvicorn app.main:app --reload
```

Hoặc chỉ định cụ thể `host` và `port`:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- **API Documentation (Swagger UI):** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## 3. Lệnh Chạy Web App (Frontend - React + Vite)

### Step 1: Di chuyển vào thư mục Frontend
```bash
cd fe
```

### Step 2: Cài đặt Dependencies (chỉ làm lần đầu)
```bash
npm install
```

### Step 3: Chạy Development Server
```bash
npm run dev
```
Trình duyệt sẽ mở Web App tại địa chỉ mặc định: `http://localhost:5173`

### Step 4: Lệnh Build & Preview (Dành cho Production)
- **Build ứng dụng:**
  ```bash
  npm run build
  ```
- **Preview bản build:**
  ```bash
  npm run preview
  ```
