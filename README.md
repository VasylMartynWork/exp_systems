# Decision Support System (СППР)

Базова версія системи підтримки прийняття рішень на Express JS та SQLite.

## Структура проекту

```
src/
├── index.js                 # Вхідна точка додатку
├── db/
│   └── database.js         # Ініціалізація та налагодження БД
├── models/
│   ├── Alternative.js      # Модель альтернатив
│   ├── Criterion.js        # Модель критеріїв
│   └── Evaluation.js       # Модель оцінок
├── services/
│   ├── AlternativeService.js    # Бізнес-логіка альтернатив
│   ├── CriterionService.js      # Бізнес-логіка критеріїв
│   └── EvaluationService.js     # Бізнес-логіка оцінок
├── routes/
│   ├── alternatives.js     # API для альтернатив
│   ├── criteria.js         # API для критеріїв
│   └── evaluations.js      # API для оцінок
└── analytics/
    └── AnalyticsEngine.js  # Заглушка для майбутнього аналітичного компонента
data/
└── dss.db               # SQLite БД (створюється автоматично)
```

## Встановлення та запуск

### 1. Встановлення залежностей
```bash
pnpm install
```

### 2. Конфігурація
Перевірте файл `.env`:
```
PORT=3000
DATABASE_PATH=./data/dss.db
NODE_ENV=development
```

### 3. Запуск сервера
```bash
pnpm start
```

Для розробки з автоперезавантаженням:
```bash
pnpm dev
```

## API Endpoints

### Альтернативи

- **POST** `/api/alternatives` - Створити нову альтернативу
  ```json
  { "name": "Option A", "description": "Description" }
  ```

- **GET** `/api/alternatives` - Отримати всі альтернативи

- **GET** `/api/alternatives/:id` - Отримати альтернативу за ID

- **PUT** `/api/alternatives/:id` - Оновити альтернативу
  ```json
  { "name": "Updated Option A", "description": "Updated description" }
  ```

- **DELETE** `/api/alternatives/:id` - Видалити альтернативу

### Критерії

- **POST** `/api/criteria` - Створити новий критерій
  ```json
  { "name": "Price", "type": "minimize", "description": "Cost" }
  ```
  * `type` може бути: `maximize` або `minimize`

- **GET** `/api/criteria` - Отримати всі критерії

- **GET** `/api/criteria/:id` - Отримати критерій за ID

- **PUT** `/api/criteria/:id` - Оновити критерій
  ```json
  { "name": "Price", "type": "minimize", "description": "Cost" }
  ```

- **DELETE** `/api/criteria/:id` - Видалити критерій

### Оцінки

- **POST** `/api/evaluations` - Створити нову оцінку
  ```json
  { "alternative_id": 1, "criterion_id": 1, "value": 8.5 }
  ```

- **GET** `/api/evaluations` - Отримати всі оцінки

- **GET** `/api/evaluations/matrix/all` - Отримати матрицю оцінок
  ```json
  {
    "alternatives": [...],
    "criteria": [...],
    "evaluations": {...},
    "rawData": [...]
  }
  ```

- **GET** `/api/evaluations/alternative/:alternativeId` - Оцінки для альтернативи

- **GET** `/api/evaluations/criterion/:criterionId` - Оцінки для критерію

- **GET** `/api/evaluations/:id` - Отримати оцінку за ID

- **GET** `/api/evaluations/:alternativeId/:criterionId` - Отримати оцінку для пари

- **PUT** `/api/evaluations/:id` - Оновити оцінку
  ```json
  { "value": 9.0 }
  ```

- **PUT** `/api/evaluations/:alternativeId/:criterionId` - Оновити/створити оцінку
  ```json
  { "value": 7.5 }
  ```

- **DELETE** `/api/evaluations/:id` - Видалити оцінку

- **DELETE** `/api/evaluations/:alternativeId/:criterionId` - Видалити оцінку для пари

## Основні сутності

### Alternative (Альтернатива)
- `id`: integer (primary key)
- `name`: string (unique, required)
- `description`: string
- `created_at`: datetime

### Criterion (Критерій)
- `id`: integer (primary key)
- `name`: string (unique, required)
- `type`: string ('maximize' | 'minimize', required)
- `description`: string
- `created_at`: datetime

### Evaluation (Оцінка)
- `id`: integer (primary key)
- `alternative_id`: integer (foreign key)
- `criterion_id`: integer (foreign key)
- `value`: real (required)
- `created_at`: datetime
- `updated_at`: datetime

## Архітектура

### Шари системи

1. **Routes** - Обробка HTTP запитів
2. **Services** - Бізнес-логіка та валідація
3. **Models** - Прямий доступ до БД
4. **Database** - Керування з'єднанням та схемою

### Analytics Engine (Заглушка)

Компонент `AnalyticsEngine` передбачений для майбутньої реалізації розрахунків і прийняття рішень. На даному етапі це займанець, який визначає інтерфейс майбутнього функціоналу:

- Розрахунок оцінок альтернатив
- Застосування ваг критеріїв
- Ранжування альтернатив
- Формування рекомендацій

## Приклад використання

### 1. Додати альтернативи
```bash
curl -X POST http://localhost:3000/api/alternatives \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop A", "description": "High performance"}'

curl -X POST http://localhost:3000/api/alternatives \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop B", "description": "Budget friendly"}'
```

### 2. Додати критерії
```bash
curl -X POST http://localhost:3000/api/criteria \
  -H "Content-Type: application/json" \
  -d '{"name": "Price", "type": "minimize", "description": "Cost in USD"}'

curl -X POST http://localhost:3000/api/criteria \
  -H "Content-Type: application/json" \
  -d '{"name": "Performance", "type": "maximize", "description": "Speed and power"}'
```

### 3. Додати оцінки
```bash
curl -X POST http://localhost:3000/api/evaluations \
  -H "Content-Type: application/json" \
  -d '{"alternative_id": 1, "criterion_id": 1, "value": 800}'

curl -X POST http://localhost:3000/api/evaluations \
  -H "Content-Type: application/json" \
  -d '{"alternative_id": 1, "criterion_id": 2, "value": 9.5}'
```

### 4. Отримати матрицю оцінок
```bash
curl http://localhost:3000/api/evaluations/matrix/all
```

## Розширення системи

На наступних етапах можна додати:
- Методи багатокритеріального аналізу (TOPSIS, AHP, ELECTRE)
- Ваги для критеріїв
- Нормалізацію оцінок
- Розрахунок рангів альтернатив
- Для фронтенд - UI для керування даними
- Аутентифікацію та авторизацію
- Тестування

## Залежності

- **express**: Web framework
- **sqlite3**: SQLite драйвер
- **dotenv**: Конфігурація через змінні окруження
