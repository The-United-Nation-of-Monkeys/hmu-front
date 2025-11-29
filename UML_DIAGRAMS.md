# UML Диаграммы для SmartGrant (Frontend + Backend)

## Содержание

### Frontend диаграммы (1-11)
1. Архитектура приложения
2. Структура данных
3. Zustand Stores
4. API Client Structure
5. User Flow
6. Grant Creation Flow
7. Spending Request Flow
8. File Upload Flow
9. Component Hierarchy
10. State Management Flow
11. Mermaid версии

### Backend диаграммы (12-21)
12. Архитектура бэкенда (FastAPI + PostgreSQL + Smart Contracts)
13. Схема базы данных (PostgreSQL)
14. Поток работы со смарт-контрактами
15. Полный стек (Frontend → Backend → Blockchain)
16. AML Check Flow
17. Backend API Structure
18. Transaction Lifecycle
19. Детальная архитектура бэкенда
20. Интеграция со смарт-контрактами
21. Mermaid - Full Stack Architecture

## 1. Архитектура приложения (Component Diagram)

```plantuml
@startuml Architecture
!define RECTANGLE class

package "Frontend Application" {
  [React App] as App
  [React Router] as Router
  [React Query] as Query
  [Zustand Stores] as Stores
  [API Client] as API
}

package "UI Components" {
  [shadcn/ui] as UI
  [Custom Components] as Custom
  [Layouts] as Layouts
}

package "Pages" {
  [Public Pages] as Public
  [Government Pages] as Gov
  [University Pages] as Uni
  [Grantee Pages] as Grantee
}

package "Backend API" {
  [FastAPI Server] as Backend
}

App --> Router
App --> Query
App --> Stores
App --> API

Router --> Public
Router --> Gov
Router --> Uni
Router --> Grantee

Gov --> Custom
Uni --> Custom
Grantee --> Custom

Custom --> UI
Layouts --> UI

API --> Backend
Query --> API

@enduml
```

## 2. Структура данных (Class Diagram)

```plantuml
@startuml DataModel
class Grant {
  +id: number
  +title: string
  +description: string
  +total_amount: number
  +currency: string
  +government_id: number
  +university_id?: number
  +grantee_id?: number
  +created_at: string
  +updated_at: string
}

class SpendingItem {
  +id: number
  +grant_id: number
  +title: string
  +description: string
  +amount: number
  +receipt_url?: string
  +created_at: string
}

class SpendingRequest {
  +id: number
  +grant_id: number
  +spending_item_id: number
  +amount: number
  +status: string
  +created_at: string
  +updated_at: string
  +receipt_url?: string
}

class User {
  +id: number
  +email: string
  +name: string
  +role: UserRole
}

enum UserRole {
  government
  university
  grantee
}

class AmlFlag {
  +id: number
  +spending_request_id: number
  +flag_type: string
  +severity: string
  +description: string
  +created_at: string
}

class ContractLog {
  +id: number
  +transaction_hash: string
  +event_type: string
  +block_number: number
  +timestamp: string
  +data: object
}

Grant "1" *-- "many" SpendingItem
Grant "1" *-- "many" SpendingRequest
SpendingRequest "1" *-- "many" AmlFlag
User --> UserRole

@enduml
```

## 3. Структура Zustand Stores (Class Diagram)

```plantuml
@startuml Stores
class AuthStore {
  -token: string | null
  -user: User | null
  -isAuthenticated: boolean
  +login(token: string, user: User): void
  +logout(): void
  +setUser(user: User): void
}

class UIStore {
  -sidebarOpen: boolean
  +setSidebarOpen(open: boolean): void
  +toggleSidebar(): void
}

class GrantStore {
  -currentGrant: Grant | null
  -grants: Grant[]
  +setCurrentGrant(grant: Grant | null): void
  +setGrants(grants: Grant[]): void
  +fetchGrants(): Promise<void>
}

AuthStore --> User
GrantStore --> Grant

@enduml
```

## 4. API Client Structure (Class Diagram)

```plantuml
@startuml APIClient
class ApiClient {
  -baseURL: string
  -headers: object
  +get<T>(url: string): Promise<T>
  +post<T>(url: string, data: any): Promise<T>
  +put<T>(url: string, data: any): Promise<T>
  +delete<T>(url: string): Promise<T>
}

class GrantsAPI {
  +getGrants(): Promise<Grant[]>
  +getGrant(id: number): Promise<Grant>
  +createGrant(data: CreateGrantRequest): Promise<Grant>
  +uploadSpendingItemsFile(grantId: number, file: File): Promise<BulkSpendingItemsResponse>
  +getUniversities(): Promise<University[]>
  +getGrantees(): Promise<Grantee[]>
  +assignGrantee(grantId: number, granteeId: number): Promise<Grant>
}

class SpendingAPI {
  +createSpendingItem(data: CreateSpendingItemRequest): Promise<SpendingItem>
  +createSpendingItems(data: CreateSpendingItemsRequest): Promise<SpendingItem[]>
  +getSpendingItems(grantId: number): Promise<SpendingItem[]>
  +createSpendingRequest(data: CreateSpendingRequestRequest): Promise<SpendingRequest>
  +getSpendingRequest(id: number): Promise<SpendingRequest>
  +getSpendingRequests(): Promise<SpendingRequest[]>
  +approveTop3(requestIds: number[]): Promise<void>
}

class ReceiptsAPI {
  +uploadReceipt(data: UploadReceiptRequest): Promise<ReceiptResponse>
  +uploadSpendingItemReceipt(data: UploadSpendingItemReceiptRequest): Promise<ReceiptResponse>
}

class ContractAPI {
  +getLogs(): Promise<ContractLog[]>
  +getLogsByGrant(grantId: number): Promise<ContractLog[]>
}

class AmlAPI {
  +getFlags(spendingRequestId: number): Promise<AmlFlag[]>
  +getFlagsByGrant(grantId: number): Promise<AmlFlag[]>
}

ApiClient <|-- GrantsAPI
ApiClient <|-- SpendingAPI
ApiClient <|-- ReceiptsAPI
ApiClient <|-- ContractAPI
ApiClient <|-- AmlAPI

@enduml
```

## 5. User Flow (Activity Diagram)

```plantuml
@startuml UserFlow
start
:User visits application;
if (Authenticated?) then (no)
  :Show Login/Signup page;
  :User logs in;
  :Store token and user;
else (yes)
endif

:Determine user role;

if (Role?) then (Government)
  :Show Government Dashboard;
  :Can create grants;
  :Can upload spending items (Excel/CSV);
  :Can view all grants and transactions;
elseif (University) then
  :Show University Dashboard;
  :Can view grants;
  :Can assign grantees;
  :Can approve top-3 requests;
  :Can view AML flags;
else (Grantee)
  :Show Grantee Dashboard;
  :Can view assigned grants;
  :Can view spending items;
  :Can create spending requests;
  :Can upload receipts;
endif

stop

@enduml
```

## 6. Grant Creation Flow (Sequence Diagram)

```plantuml
@startuml GrantCreation
actor Government
participant "CreateGrantDialog" as Dialog
participant "grantsApi" as API
participant "Backend" as BE
participant "authStore" as Store

Government -> Dialog: Open dialog
Dialog -> API: getUniversities()
API -> BE: GET /government/universities
BE --> API: List of universities
API --> Dialog: Universities list

Government -> Dialog: Fill form (title, amount, university)
Government -> Dialog: Submit form
Dialog -> API: createGrant(data)
API -> BE: POST /government/grants
BE --> API: Created Grant
API --> Dialog: Grant object
Dialog -> Store: Invalidate queries
Dialog --> Government: Show success toast

@enduml
```

## 7. Spending Request Flow (Sequence Diagram)

```plantuml
@startuml SpendingRequestFlow
actor Grantee
participant "GrantDetail" as Page
participant "CreateSpendingRequestDialog" as Dialog
participant "spendingApi" as API
participant "Backend" as BE
participant "React Query" as Query

Grantee -> Page: View grant details
Page -> Query: Fetch grant with spending items
Query -> API: getGranteeGrant(id)
API -> BE: GET /grantee/grants/{id}
BE --> API: Grant with spending items
API --> Query: Grant data
Query --> Page: Display grant and items

Grantee -> Dialog: Click "Create Request"
Dialog -> Dialog: Show spending items list
Grantee -> Dialog: Select item and amount
Grantee -> Dialog: Submit
Dialog -> API: createSpendingRequest(data)
API -> BE: POST /grantee/spending_requests
BE --> API: Created request
API --> Dialog: Request object
Dialog -> Query: Invalidate queries
Dialog --> Grantee: Show success toast

@enduml
```

## 8. File Upload Flow (Sequence Diagram)

```plantuml
@startuml FileUpload
actor Government
participant "UploadDialog" as Dialog
participant "grantsApi" as API
participant "Backend" as BE
participant "React Query" as Query

Government -> Dialog: Select Excel/CSV file
Dialog -> Dialog: Validate file format
Government -> Dialog: Click Upload
Dialog -> API: uploadSpendingItemsFile(grantId, file)
API -> BE: POST /government/grants/{id}/spending-items/upload
note right: multipart/form-data

BE -> BE: Parse Excel/CSV
BE -> BE: Validate data
BE -> BE: Create SpendingItems
BE --> API: BulkSpendingItemsResponse
API --> Dialog: Response with created items
Dialog -> Query: Invalidate grant queries
Dialog --> Government: Show success (X items created)

@enduml
```

## 9. Component Hierarchy (Component Diagram)

```plantuml
@startuml Components
package "Pages" {
  [Login] as LoginPage
  [Signup] as SignupPage
  [GovDashboard] as GovDash
  [UniDashboard] as UniDash
  [GranteeDashboard] as GranteeDash
  [GrantDetail] as GrantDetail
}

package "Components" {
  [NavBar] as Nav
  [Sidebar] as Sidebar
  [DataTable] as Table
  [FileUpload] as FileUp
  [StatusBadge] as Badge
  [AmountBadge] as Amount
  [CreateGrantDialog] as CreateGrant
  [UploadSpendingItemsDialog] as UploadItems
  [AssignGranteeDialog] as Assign
  [CreateSpendingRequestDialog] as CreateReq
  [UploadReceiptDialog] as UploadReceipt
}

package "Layouts" {
  [DashboardLayout] as Layout
}

package "UI Components" {
  [Button] as Btn
  [Card] as Card
  [Dialog] as Dialog
  [Input] as Input
  [Select] as Select
  [Table] as UITable
}

Layout --> Nav
Layout --> Sidebar
Layout --> GovDash
Layout --> UniDash
Layout --> GranteeDash

GovDash --> GrantDetail
UniDash --> GrantDetail
GranteeDash --> GrantDetail

GrantDetail --> Table
GrantDetail --> CreateGrant
GrantDetail --> UploadItems
GrantDetail --> Assign
GrantDetail --> CreateReq
GrantDetail --> UploadReceipt

Table --> UITable
CreateGrant --> Dialog
CreateGrant --> Input
CreateGrant --> Select
UploadItems --> FileUp
UploadReceipt --> FileUp

Dialog --> Btn
FileUp --> Card
Badge --> Card
Amount --> Card

@enduml
```

## 10. State Management Flow (State Diagram)

```plantuml
@startuml StateManagement
[*] --> Unauthenticated

state Unauthenticated {
  :Show Login/Signup
}

Unauthenticated --> Authenticated : Login Success

state Authenticated {
  state Government {
    :Can create grants
    :Can upload files
    :Can view all data
  }
  
  state University {
    :Can assign grantees
    :Can approve requests
    :Can view grants
  }
  
  state Grantee {
    :Can view grants
    :Can create requests
    :Can upload receipts
  }
}

Authenticated --> Unauthenticated : Logout

@enduml
```

## 11. Mermaid версия (для GitHub/документации)

### Архитектура приложения

```mermaid
graph TB
    A[React App] --> B[React Router]
    A --> C[React Query]
    A --> D[Zustand Stores]
    A --> E[API Client]
    
    B --> F[Public Pages]
    B --> G[Government Pages]
    B --> H[University Pages]
    B --> I[Grantee Pages]
    
    G --> J[Custom Components]
    H --> J
    I --> J
    
    J --> K[shadcn/ui]
    E --> L[FastAPI Backend]
```

### Структура данных

```mermaid
erDiagram
    GRANT ||--o{ SPENDING_ITEM : has
    GRANT ||--o{ SPENDING_REQUEST : has
    SPENDING_REQUEST ||--o{ AML_FLAG : has
    GRANT }o--|| USER : "created by (government)"
    GRANT }o--|| USER : "assigned to (university)"
    GRANT }o--|| USER : "assigned to (grantee)"
    
    GRANT {
        int id
        string title
        string description
        decimal total_amount
        string currency
        int government_id
        int university_id
        int grantee_id
    }
    
    SPENDING_ITEM {
        int id
        int grant_id
        string title
        string description
        decimal amount
        string receipt_url
    }
    
    SPENDING_REQUEST {
        int id
        int grant_id
        int spending_item_id
        decimal amount
        string status
        string receipt_url
    }
    
    USER {
        int id
        string email
        string name
        string role
    }
```

### User Flow

```mermaid
flowchart TD
    Start([User visits app]) --> Auth{Authenticated?}
    Auth -->|No| Login[Login/Signup]
    Login --> Auth
    Auth -->|Yes| Role{User Role?}
    
    Role -->|Government| Gov[Government Dashboard]
    Role -->|University| Uni[University Dashboard]
    Role -->|Grantee| Grantee[Grantee Dashboard]
    
    Gov --> GovActions[Create Grants<br/>Upload Files<br/>View All Data]
    Uni --> UniActions[Assign Grantees<br/>Approve Requests<br/>View Grants]
    Grantee --> GranteeActions[View Grants<br/>Create Requests<br/>Upload Receipts]
```

---

# BACKEND ДИАГРАММЫ

## 12. Архитектура бэкенда (Backend Architecture)

```plantuml
@startuml Backend Architecture
!theme plain

package "Frontend" {
  component [React App] as Frontend
}

package "API Layer" {
  component [FastAPI Application] as FastAPI
  component [Authentication Middleware] as Auth
  component [Role-based Access Control] as RBAC
}

package "Business Logic" {
  component [Government Service] as GovService
  component [University Service] as UniService
  component [Grantee Service] as GranteeService
  component [Spending Service] as SpendingService
  component [Contract Service] as ContractService
  component [AML Service] as AmlService
}

package "Smart Contract Integration" {
  component [Web3 Client] as Web3
  component [Mir Pay API Client] as MirPay
  component [Contract Interface] as Contract
  component [Transaction Manager] as TxManager
  component [Event Listener] as EventListener
}

package "Data Layer" {
  database "PostgreSQL" as PG
}

package "Storage" {
  component [File Storage] as Storage
}

Frontend --> FastAPI
FastAPI --> Auth
Auth --> RBAC
RBAC --> GovService
RBAC --> UniService
RBAC --> GranteeService

SpendingService --> Web3
SpendingService --> MirPay
Web3 --> Contract
Web3 --> MirPay
MirPay --> Contract
Contract --> PG
EventListener --> PG
EventListener --> MirPay

Storage --> PG
PG --> FastAPI
FastAPI --> Frontend

@enduml
```

## 13. Схема базы данных PostgreSQL (Database Schema)

```plantuml
@startuml Database Schema
!theme plain

entity "users" {
  * id : INTEGER <<PK>>
  --
  * email : VARCHAR(255) <<UNIQUE>>
  * password_hash : VARCHAR(255)
  * name : VARCHAR(255)
  * role : ENUM(government, university, grantee)
  * created_at : TIMESTAMP
  * updated_at : TIMESTAMP
}

entity "grants" {
  * id : INTEGER <<PK>>
  --
  * title : VARCHAR(255)
  * description : TEXT
  * total_amount : DECIMAL(18,2)
  * currency : VARCHAR(3)
  * government_id : INTEGER <<FK>>
  * university_id : INTEGER <<FK>>
  * grantee_id : INTEGER <<FK>> <<NULLABLE>>
  * contract_address : VARCHAR(255) <<NULLABLE>>
  * created_at : TIMESTAMP
  * updated_at : TIMESTAMP
}

entity "spending_items" {
  * id : INTEGER <<PK>>
  --
  * grant_id : INTEGER <<FK>>
  * title : VARCHAR(255)
  * description : TEXT
  * amount : DECIMAL(18,2)
  * receipt_url : VARCHAR(500) <<NULLABLE>>
  * created_at : TIMESTAMP
}

entity "spending_requests" {
  * id : INTEGER <<PK>>
  --
  * grant_id : INTEGER <<FK>>
  * spending_item_id : INTEGER <<FK>>
  * amount : DECIMAL(18,2)
  * status : ENUM(pending_university_approval, pending_receipt, paid, rejected, blocked)
  * receipt_url : VARCHAR(500) <<NULLABLE>>
  * transaction_hash : VARCHAR(255) <<NULLABLE>>
  * created_at : TIMESTAMP
  * updated_at : TIMESTAMP
}

entity "receipts" {
  * id : INTEGER <<PK>>
  --
  * spending_item_id : INTEGER <<FK>> <<NULLABLE>>
  * spending_request_id : INTEGER <<FK>> <<NULLABLE>>
  * file_url : VARCHAR(500)
  * uploaded_by : INTEGER <<FK>>
  * uploaded_at : TIMESTAMP
}

entity "aml_flags" {
  * id : INTEGER <<PK>>
  --
  * spending_request_id : INTEGER <<FK>>
  * flag_type : VARCHAR(100)
  * severity : ENUM(low, medium, high)
  * description : TEXT
  * created_at : TIMESTAMP
}

entity "contract_logs" {
  * id : INTEGER <<PK>>
  --
  * grant_id : INTEGER <<FK>>
  * transaction_hash : VARCHAR(255)
  * event_type : VARCHAR(100)
  * block_number : INTEGER
  * timestamp : TIMESTAMP
  * data : JSONB
}

entity "transactions" {
  * id : INTEGER <<PK>>
  --
  * grant_id : INTEGER <<FK>>
  * spending_request_id : INTEGER <<FK>>
  * transaction_hash : VARCHAR(255) <<UNIQUE>>
  * amount : DECIMAL(18,2)
  * status : VARCHAR(50)
  * block_number : INTEGER
  * created_at : TIMESTAMP
}

users ||--o{ grants : "creates (government)"
users ||--o{ grants : "assigned (university)"
users ||--o{ grants : "assigned (grantee)"
grants ||--o{ spending_items : "has"
grants ||--o{ spending_requests : "has"
grants ||--o{ contract_logs : "generates"
spending_items ||--o{ spending_requests : "references"
spending_requests ||--o{ aml_flags : "has"
spending_items ||--o{ receipts : "has"
spending_requests ||--o{ receipts : "has"
spending_requests ||--o{ transactions : "creates"
users ||--o{ receipts : "uploads"

note right of grants
  contract_address хранит адрес
  смарт-контракта на блокчейне
end note

note right of spending_requests
  transaction_hash связывает
  запрос с транзакцией в блокчейне
end note

@enduml
```

## 14. Поток работы со смарт-контрактами (Smart Contract Flow)

**Описание:** Показывает полный цикл взаимодействия с блокчейном - от создания гранта до выполнения транзакций.

```plantuml
@startuml Smart Contract Flow
!theme plain

participant "Frontend" as FE
participant "FastAPI" as API
participant "Spending Service" as Service
participant "Web3 Client" as Web3
participant "Mir Pay API" as MirPay
participant "Smart Contract" as Contract
participant "Blockchain" as Chain
participant "PostgreSQL" as DB

== Grant Creation ==
FE -> API: POST /government/grants
API -> Service: Create grant
Service -> DB: Insert grant
Service -> Web3: Deploy contract
Web3 -> Contract: Deploy
Contract -> Chain: Transaction
Chain --> Web3: Contract address
Web3 -> MirPay: Register contract
MirPay --> Web3: Confirmation
Web3 -> DB: Store address
Service --> FE: Grant created

== Request Approval ==
FE -> API: POST /university/approve-top3
API -> Service: Approve requests
Service -> Web3: Prepare transaction
Service -> MirPay: Check transaction status
MirPay --> Service: Status OK
Web3 -> Contract: approveAndTransfer(requests[])
Contract -> Chain: Execute transfers
Chain --> Web3: Transaction hash
Web3 -> MirPay: Register transaction
MirPay --> Web3: Transaction receipt
Contract --> Web3: Receipt
Web3 -> DB: Store tx_hash
Service --> FE: Approval complete

== Event Listening ==
Listener -> Chain: Listen for events
Chain --> Listener: Event emitted
Listener -> MirPay: Sync event
MirPay --> Listener: Event data
Listener -> DB: Store event log

@enduml
```

## 15. Полный стек (Full Stack Flow)

```plantuml
@startuml Full Stack Flow
!theme plain

actor User
participant "React Frontend" as Frontend
participant "FastAPI Backend" as Backend
participant "PostgreSQL" as DB
participant "Mir Pay API" as MirPay
participant "Smart Contract" as Contract
participant "Blockchain" as Chain
participant "File Storage" as Storage

User -> Frontend: Create Grant
Frontend -> Backend: POST /government/grants
Backend -> DB: Create grant
Backend -> Contract: Deploy contract
Contract -> Chain: Deploy
Chain --> Contract: Address
Contract --> Backend: Address
Backend -> MirPay: Register contract
MirPay --> Backend: Confirmation
Backend -> DB: Update grant
Backend --> Frontend: Grant created

User -> Frontend: Upload Excel
Frontend -> Backend: POST /grants/{id}/spending-items/upload
Backend -> Backend: Parse Excel
Backend -> DB: Create items
Backend --> Frontend: Items created

User -> Frontend: Approve Requests
Frontend -> Backend: POST /university/approve-top3
Backend -> MirPay: Check transaction status
MirPay --> Backend: Status OK
Backend -> Contract: Execute transfer
Contract -> Chain: Transfer funds
Chain --> Contract: Tx hash
Contract --> Backend: Hash
Backend -> MirPay: Register transaction
MirPay --> Backend: Transaction receipt
Backend -> DB: Update requests
Backend --> Frontend: Approved

@enduml
```

## 16. AML Check Flow (AML проверка)

```plantuml
@startuml AML Check Flow
!theme plain

participant "Grantee" as User
participant "FastAPI" as API
participant "AML Service" as AML
participant "PostgreSQL" as DB
participant "Smart Contract" as Contract

User -> API: Create spending request
API -> DB: Create request
API -> AML: check_request()
AML -> DB: Get request history
AML -> AML: Check patterns
alt Flags found
  AML -> DB: Create flags
  AML -> DB: Update status = blocked
else No flags
  AML --> API: OK
end
API --> User: Request with flags

User -> API: Approve request
API -> AML: Final check
alt High severity
  API --> User: Cannot approve
else OK
  API -> Contract: Execute transfer
  Contract --> API: Success
  API -> DB: Update status = paid
end

@enduml
```

## 17. Backend API Structure (Структура API бэкенда)

```plantuml
@startuml Backend API Structure
!theme plain

package "FastAPI Routes" {
  package "/auth" {
    [POST /login]
    [POST /signup]
    [GET /me]
  }
  
  package "/government" {
    [GET /grants]
    [POST /grants]
    [POST /grants/{id}/spending-items/upload]
  }
  
  package "/university" {
    [GET /grants]
    [PUT /grants/{id}/assign]
    [POST /approve-top3]
  }
  
  package "/grantee" {
    [GET /grants]
    [GET /grants/{id}]
    [POST /spending_requests]
    [POST /spending-items/{id}/receipt]
  }
  
  package "/contract" {
    [GET /logs]
  }
  
  package "/aml" {
    [GET /flags/{id}]
  }
}

package "Services" {
  [GovernmentService]
  [UniversityService]
  [GranteeService]
  [SpendingService]
  [ContractService]
  [AmlService]
}

package "Data" {
  [PostgreSQL]
  [File Storage]
}

package "External" {
  [Smart Contract]
  [Blockchain]
}

@enduml
```

## 18. Transaction Lifecycle (Жизненный цикл транзакции)

```plantuml
@startuml Transaction Lifecycle
!theme plain

state "Request States" {
  [pending_university_approval]
  [pending_receipt]
  [paid]
  [rejected]
  [blocked]
}

[*] --> pending_university_approval

pending_university_approval --> pending_receipt : University approves
pending_university_approval --> rejected : University rejects
pending_university_approval --> blocked : AML high severity

pending_receipt --> paid : Receipt uploaded\n+ Contract executes
pending_receipt --> blocked : AML check fails

paid --> [*]
rejected --> [*]
blocked --> [*]

@enduml
```

## 19. Детальная архитектура бэкенда (Detailed Backend Architecture)

```plantuml
@startuml Backend Detailed Architecture
!theme plain

package "FastAPI Application" {
  [FastAPI App] as FastAPI {
    [CORS Middleware]
    [JWT Middleware]
    [Error Handler]
    [Rate Limiter]
  }
}

package "Services" {
  [Government Service]
  [University Service]
  [Grantee Service]
  [Spending Service]
  [Contract Service]
  [AML Service]
  [Receipt Service]
}

package "Data Access" {
  [SQLAlchemy ORM]
  [Repository Pattern]
}

package "Database" {
  database "PostgreSQL" {
    [Users]
    [Grants]
    [Spending Items]
    [Spending Requests]
    [Receipts]
    [AML Flags]
    [Contract Logs]
  }
}

package "Blockchain" {
  [Web3 Client]
  [Mir Pay API Client]
  [Contract Manager]
  [Transaction Builder]
  [Event Monitor]
  [Smart Contract]
}

package "Storage" {
  [File Storage\nS3/MinIO/Local]
}

FastAPI --> Services
Services --> ORM
ORM --> PostgreSQL
Spending Service --> Web3 Client
Spending Service --> Mir Pay API Client
Web3 Client --> Smart Contract
Mir Pay API Client --> Smart Contract
Receipt Service --> File Storage

@enduml
```

## 20. Интеграция со смарт-контрактами (Smart Contract Integration)

```plantuml
@startuml Smart Contract Integration
!theme plain

package "FastAPI Backend" {
  [Contract Service]
  [Web3 Client]
  [Transaction Queue]
  [Mir Pay API Client]
}

interface "IGrantContract" {
  +approveAndTransfer(requests: Request[]): TransactionHash
  +getBalance(grantId: uint): uint256
  +getRequestStatus(requestId: uint): Status
}

class "GrantContract.sol" {
  -grants: mapping(uint => Grant)
  -requests: mapping(uint => Request)
  -balances: mapping(uint => uint256)
  +approveAndTransfer()
  +getBalance()
  +onTransfer()
  +onApproval()
}

package "Blockchain" {
  [Ethereum/Polygon Network]
  [Transaction Pool]
  [Blockchain State]
}

package "Mir Pay API" {
  [Transaction Status API]
  [Block Explorer API]
  [Account Balance API]
  [Event History API]
  [Gas Price API]
  [Payment Processing API]
}

package "Event System" {
  [Event Listener]
  [Event Parser]
  [Event Storage]
}

Contract Service --> Web3 Client
Contract Service --> Mir Pay API Client
Web3 Client --> Network
Mir Pay API Client --> Transaction Status API
Mir Pay API Client --> Block Explorer API
Mir Pay API Client --> Account Balance API
Mir Pay API Client --> Event History API
Mir Pay API Client --> Gas Price API
Mir Pay API Client --> Payment Processing API

Network --> Event Listener
Event Listener --> Event Storage

note right of GrantContract.sol
  Solidity Smart Contract
  Manages grant funds
  Executes transfers
  Tracks request status
end note

note right of Mir Pay API Client
  Mir Pay API используется для:
  - Проверки статуса транзакций
  - Получения истории событий
  - Мониторинга балансов
  - Получения данных о блоках
  - Оптимизации gas price
  - Обработки платежей
end note

@enduml
```

## 21. Mermaid - Full Stack Architecture

```mermaid
graph TB
    subgraph Frontend
        A[React App] --> B[React Router]
        A --> C[React Query]
        A --> D[Zustand]
        A --> E[Axios Client]
    end
    
    subgraph Backend
        F[FastAPI] --> G[JWT Auth]
        F --> H[RBAC]
        F --> I[Services]
        I --> J[SQLAlchemy]
        J --> K[PostgreSQL]
        I --> L[Web3 Client]
        L --> M[Smart Contract]
        I --> N[File Storage]
    end
    
    subgraph Blockchain
        M --> O[Ethereum/Polygon]
        O --> P[Event Logs]
        P --> Q[Event Listener]
        Q --> K
    end
    
    E --> F
    M --> O
```

## Использование

### PlantUML
1. Установите PlantUML расширение в VS Code
2. Откройте файл с расширением `.puml` или `.plantuml`
3. Диаграммы будут автоматически рендериться

### Mermaid
1. Используйте в Markdown файлах (GitHub поддерживает)
2. Или используйте онлайн редактор: https://mermaid.live/
3. Или установите расширение Mermaid для VS Code

### Онлайн инструменты
- PlantUML: http://www.plantuml.com/plantuml/uml/
- Mermaid: https://mermaid.live/

