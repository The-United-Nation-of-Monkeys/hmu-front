# UML Диаграммы для SmartGrant Frontend

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

