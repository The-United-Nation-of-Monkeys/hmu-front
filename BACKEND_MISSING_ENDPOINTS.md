# Отсутствующие эндпоинты на бэке

## Для Grantee

### 1. GET `/api/grantee/grants/{grant_id}` - Get Grant Detail
**Статус:** ❌ Отсутствует

**Описание:** Получение детальной информации о гранте, включая список статей расходов и запросов на транши.

**Требования:**
- Пользователь должен быть аутентифицирован как `grantee`
- Грант должен быть назначен на текущего грантополучателя (`grantee_id` должен совпадать с ID текущего пользователя)

**Request:**
- Method: `GET`
- Headers: `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "title": "Грант на исследования",
  "description": "Описание гранта",
  "total_amount": 1000000,
  "currency": "RUB",
  "government_id": 1,
  "university_id": 1,
  "grantee_id": 1,
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00",
  "spending_items": [
    {
      "id": 1,
      "grant_id": 1,
      "title": "Оборудование",
      "description": "Закупка компьютеров",
      "amount": 500000,
      "receipt_url": "https://storage.example.com/receipts/receipt_123.pdf",
      "created_at": "2024-01-01T00:00:00"
    }
  ],
  "spending_requests": [
    {
      "id": 1,
      "grant_id": 1,
      "spending_item_id": 1,
      "amount": 200000,
      "status": "pending_university_approval",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00",
      "receipt_url": null,
      "aml_flags": []
    }
  ]
}
```

**Ошибки:**
- `401 Unauthorized` - не аутентифицирован
- `403 Forbidden` - не является грантополучателем или грант не назначен на него
- `404 Not Found` - грант не найден

**Что нужно сделать на бэке:**
1. Проверить аутентификацию и роль пользователя
2. Проверить существование гранта
3. Проверить, что `grantee_id` гранта соответствует ID текущего пользователя
4. Получить все `SpendingItem` для данного гранта
5. Получить все `SpendingRequest` для данного гранта
6. Вернуть объект гранта с вложенными списками статей расходов и запросов

---

## Уточнения по существующим эндпоинтам

### 2. POST `/api/grantee/spending_requests/{request_id}/upload_receipt` - Upload Receipt
**Статус:** ✅ Существует (но есть дубликат)

**Примечание:** На бэке есть два эндпоинта для загрузки чека:
- `/api/grantee/spending-requests/{request_id}/receipt` (с дефисом)
- `/api/grantee/spending_requests/{request_id}/upload_receipt` (с подчеркиванием)

**Рекомендация:** Оставить один стандартный эндпоинт. Рекомендуется использовать `/api/grantee/spending_requests/{request_id}/upload_receipt` для единообразия с другими эндпоинтами (где используется подчеркивание).

---

## Резюме

### Что нужно добавить:
1. **GET `/api/grantee/grants/{grant_id}`** - получение детальной информации о гранте с вложенными данными

### Что нужно уточнить/исправить:
1. **Унифицировать формат путей** - решить, использовать дефисы (`spending-requests`) или подчеркивания (`spending_requests`) во всех эндпоинтах
2. **Убрать дубликат** - оставить один эндпоинт для загрузки чека к spending request

### Текущее состояние эндпоинтов:

| Эндпоинт | Метод | Статус | Примечание |
|----------|-------|--------|------------|
| `/api/grantee/grants` | GET | ✅ | Работает |
| `/api/grantee/grants/{grant_id}` | GET | ❌ | **Нужно добавить** |
| `/api/grantee/grants/{grant_id}/spending_items` | POST | ✅ | Работает |
| `/api/grantee/spending-items` | POST | ✅ | Работает |
| `/api/grantee/grants/{grant_id}/spending-items` | GET | ✅ | Работает |
| `/api/grantee/spending-items/{spending_item_id}/receipt` | POST | ✅ | Работает |
| `/api/grantee/spending_requests` | POST | ✅ | Работает (используется подчеркивание) |
| `/api/grantee/spending_requests/{request_id}` | GET | ✅ | Работает (используется подчеркивание) |
| `/api/grantee/spending_requests` | GET | ✅ | Работает (используется подчеркивание) |
| `/api/grantee/spending_requests/{request_id}/upload_receipt` | POST | ✅ | Работает (используется подчеркивание) |

