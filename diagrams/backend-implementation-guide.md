# Backend Implementation Guide

## Технологический стек

### Core
- **FastAPI** - современный Python веб-фреймворк
- **PostgreSQL** - реляционная база данных
- **SQLAlchemy** - ORM для работы с БД
- **Alembic** - миграции базы данных

### Authentication & Security
- **JWT** (python-jose) - токены аутентификации
- **bcrypt** - хеширование паролей
- **Pydantic** - валидация данных

### Blockchain Integration
- **Web3.py** - взаимодействие с блокчейном
- **eth-account** - управление аккаунтами
- **Smart Contracts** (Solidity) - смарт-контракты

### File Processing
- **pandas** - парсинг Excel/CSV
- **openpyxl** - работа с Excel файлами
- **Pillow** - обработка изображений

### Storage
- **boto3** (для S3) или **Local Storage** - хранение файлов

### Background Tasks
- **Celery** (опционально) - фоновые задачи
- **APScheduler** - планировщик задач

## Структура проекта (рекомендуемая)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI приложение
│   ├── config.py               # Конфигурация
│   ├── database.py             # Подключение к БД
│   │
│   ├── models/                 # SQLAlchemy модели
│   │   ├── user.py
│   │   ├── grant.py
│   │   ├── spending_item.py
│   │   ├── spending_request.py
│   │   └── ...
│   │
│   ├── schemas/                # Pydantic схемы
│   │   ├── user.py
│   │   ├── grant.py
│   │   └── ...
│   │
│   ├── services/               # Бизнес-логика
│   │   ├── auth_service.py
│   │   ├── government_service.py
│   │   ├── university_service.py
│   │   ├── grantee_service.py
│   │   ├── spending_service.py
│   │   ├── receipt_service.py
│   │   ├── aml_service.py
│   │   └── contract_service.py
│   │
│   ├── routers/                # API роуты
│   │   ├── auth.py
│   │   ├── government.py
│   │   ├── university.py
│   │   ├── grantee.py
│   │   ├── contract.py
│   │   └── aml.py
│   │
│   ├── middleware/             # Middleware
│   │   ├── auth.py
│   │   └── cors.py
│   │
│   ├── blockchain/             # Blockchain интеграция
│   │   ├── web3_client.py
│   │   ├── contract_interface.py
│   │   ├── transaction_manager.py
│   │   └── event_listener.py
│   │
│   ├── storage/                # File storage
│   │   └── file_service.py
│   │
│   └── utils/                  # Утилиты
│       ├── excel_parser.py
│       └── validators.py
│
├── contracts/                  # Solidity контракты
│   └── GrantContract.sol
│
├── migrations/                  # Alembic миграции
│   └── versions/
│
├── tests/                       # Тесты
│
├── requirements.txt
├── .env
└── README.md
```

## Основные компоненты для реализации

### 1. FastAPI Application (main.py)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, government, university, grantee, contract, aml

app = FastAPI(title="SmartGrant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(government.router, prefix="/api/government", tags=["government"])
app.include_router(university.router, prefix="/api/university", tags=["university"])
app.include_router(grantee.router, prefix="/api/grantee", tags=["grantee"])
app.include_router(contract.router, prefix="/api/contract", tags=["contract"])
app.include_router(aml.router, prefix="/api/aml", tags=["aml"])
```

### 2. Database Models (SQLAlchemy)

```python
# models/grant.py
from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Grant(Base):
    __tablename__ = "grants"
    
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    total_amount = Column(Numeric(18, 2), nullable=False)
    currency = Column(String(3), default="RUB")
    government_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    university_id = Column(Integer, ForeignKey("users.id"))
    grantee_id = Column(Integer, ForeignKey("users.id"))
    contract_address = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    spending_items = relationship("SpendingItem", back_populates="grant")
    spending_requests = relationship("SpendingRequest", back_populates="grant")
```

### 3. Smart Contract Service

```python
# services/contract_service.py
from web3 import Web3
from eth_account import Account

class ContractService:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(os.getenv("BLOCKCHAIN_RPC_URL")))
        self.contract_address = os.getenv("CONTRACT_ADDRESS")
        self.private_key = os.getenv("PRIVATE_KEY")
        
    def deploy_contract(self, grant_id: int) -> str:
        # Deploy contract logic
        # Return contract address
        pass
    
    def approve_and_transfer(self, request_ids: List[int]) -> str:
        # Prepare batch transaction
        # Execute on blockchain
        # Return transaction hash
        pass
    
    def get_transaction_status(self, tx_hash: str) -> dict:
        # Check transaction status
        # Return status data
        pass
```

### 4. Excel Parser

```python
# utils/excel_parser.py
import pandas as pd
from openpyxl import load_workbook

def parse_spending_items_file(file: UploadFile) -> List[dict]:
    # Read Excel or CSV
    # Validate columns (Title, Description, Amount)
    # Return list of items
    pass
```

### 5. AML Service

```python
# services/aml_service.py
class AmlService:
    def check_request(self, request_id: int) -> List[AmlFlag]:
        # Get request data
        # Check patterns:
        #   - Unusual amounts
        #   - Frequency patterns
        #   - Geographic patterns
        #   - Time patterns
        # Return flags
        pass
```

### 6. Event Listener (Background Worker)

```python
# blockchain/event_listener.py
import asyncio
from web3 import Web3

class EventListener:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(os.getenv("BLOCKCHAIN_RPC_URL")))
        
    async def listen_for_events(self):
        # Continuously listen for contract events
        # Store events in database
        # Update request statuses
        pass
```

## Что нужно реализовать на бэке

### Обязательно:
1. ✅ FastAPI приложение с роутингом
2. ✅ PostgreSQL база данных с миграциями
3. ✅ JWT аутентификация
4. ✅ Role-based access control (RBAC)
5. ✅ Все эндпоинты из документации
6. ✅ Парсинг Excel/CSV файлов
7. ✅ Загрузка и хранение файлов (чеки, Excel)
8. ✅ Интеграция с Web3 для смарт-контрактов
9. ✅ Event listener для блокчейна
10. ✅ AML проверки

### Рекомендуется:
- Логирование (structlog)
- Мониторинг (Prometheus)
- Кэширование (Redis)
- Очереди задач (Celery)
- Тестирование (pytest)

