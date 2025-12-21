.PHONY: start stop install clean build

# Установка зависимостей
install:
	@echo "📦 Installing backend dependencies..."
	cd backend && npm install
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ Dependencies installed"

# Запуск проекта
start:
	@echo "🚀 Starting Fuddly..."
	@if [ ! -f backend/.env ]; then \
		echo "⚠️  .env file not found! Copying from .env.example..."; \
		cp backend/.env.example backend/.env; \
		echo "⚠️  Please update backend/.env with your Supabase credentials"; \
	fi
	@echo "Starting backend..."
	cd backend && npm run dev & \
	echo "Starting frontend..." && \
	cd frontend && npm run dev

# Остановка проекта
stop:
	@echo "🛑 Stopping Fuddly..."
	-pkill -f "tsx watch" || true
	-pkill -f "vite" || true
	@echo "✅ Fuddly stopped"

# Очистка
clean:
	@echo "🧹 Cleaning..."
	rm -rf backend/node_modules backend/dist
	rm -rf frontend/node_modules frontend/dist
	@echo "✅ Cleaned"

# Билд production
build:
	@echo "🏗️  Building for production..."
	cd backend && npm run build
	cd frontend && npm run build
	@echo "✅ Build completed"
