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

## Формалізація задачи

### Предметна область
Система розв'язує задачу вибору найкращого ноутбука на основі множинних критеріїв. Це реальна напівструктурована задача, яка вимагає аналітичної підтримки при прийнятті рішення.

### Множина альтернатив (A)
A = {Laptop A, Laptop B, Laptop C}, де:
- **Laptop A** — високовартісний ноутбук з максимальною продуктивністю
- **Laptop B** — ноутбук середнього цінового діапазону зі збалансованими характеристиками
- **Laptop C** — бюджетний варіант з тривалою роботою батареї

### Множина критеріїв (C)
C = {Price, Performance, Battery Life}, де:
- **Price (Ціна)** — критерій типу *minimize* (чим менша ціна, тим краще). Вимірюється в USD.
- **Performance (Продуктивність)** — критерій типу *maximize* (чим більша продуктивність, тим краще). Оцінюється за шкалою від 1 до 10.
- **Battery Life (Час роботи)** — критерій типу *maximize* (чим більший час роботи, тим краще). Вимірюється в годинах.

### Матриця оцінювання (R)
Матриця R розміром 3×3 містить оцінки кожної альтернативи за кожним критерієм:

| Альтернатива | Price | Performance | Battery Life |
|---|---|---|---|
| Laptop A | 1500 | 9.5 | 5 |
| Laptop B | 900 | 7 | 8 |
| Laptop C | 400 | 4.5 | 10 |

### Обрана методологія
Для розв'язання цієї задачі використовується **метод взважених сум** — основний метод багатокритеріального аналізу. Для кожної альтернативи розраховується інтегральна оцінка за формулою:

**Score(A) = Σ(w_i × norm(r_ij))**, де:
- w_i — вага критерію i (Σw_i = 1.0)
- r_ij — оцінка альтернативи A за критерієм j
- norm(r_ij) — нормалізована оцінка в діапазон [0, 1]

Примітка: Для критеріїв типу "minimize" нормалізація виконується з інверсією (1 - normalized), щоб менші значення отримували вищі бали.

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

- **GET** `/api/criteria/weights/all` - Отримати ваги всіх критеріїв

- **PUT** `/api/criteria/:id/weight` - Встановити вагу критерію
  ```json
  { "weight": 0.3 }
  ```
  * Вага може бути будь-яким позитивним числом, ваги будуть нормалізовані

- **POST** `/api/criteria/weights/normalize` - Нормалізувати ваги (сума = 1.0)

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

### Рішення та аналітика

- **POST** `/api/decisions/calculate` - Розрахувати рішення
  ```json
  { "algorithm": "weighted_sum" }
  ```
  * Повертає ранжування альтернатив, найкращий вибір та пояснення
  * Поточно підтримується лише `weighted_sum` алгоритм

- **GET** `/api/decisions/matrix` - Отримати матрицю оцінювання

- **GET** `/api/decisions/algorithms` - Отримати список підтримуваних алгоритмів

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
- `weight`: real (default 0.0) — вага критерію для розрахунків
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

1. **Routes** - Обробка HTTP запитів та валідація параметрів
2. **Services** - Бізнес-логіка, валідація, координація операцій
3. **Models** - Прямий доступ до БД, SQL запити
4. **Database** - Керування з'єднанням, ініціалізація схеми, міграції
5. **Analytics** - Розрахунки, багатокритеріальний аналіз, ранжування

### Analytics Engine (Аналітичний блок)

Компонент `AnalyticsEngine` це дійсна реалізація аналітичного ядра СППР. Він поєднує:

- **Нормалізацію оцінок** — приведення значень з різних шкал до єдиного дипазону [0, 1]
- **Розрахунок взважених сум** — обчислення інтегральної оцінки для кожної альтернативи
- **Ранжування альтернатив** — впорядкування за отриманими оцінками
- **Генерування пояснень** — текстовий опис логіки вибору найкращої альтернативи

**Метод взважених сум:**
- Для кожного критерію всі значення нормалізуються до діапазону [0, 1]
- Для критеріїв типу "minimize" застосовується інверсія (1 - normalized)
- Інтегральна оцінка кожної альтернативи: Score = ∑(w_i × norm(r_ij))
- Альтернативи ранжуються за зменшеннямScore

**Впровадження сервісу:**
- `DecisionService` координує роботу AnalyticsEngine
- Отримує матрицю оцінок та ваги критеріїв
- Запускає вибраний алгоритм розрахунку
- Повертає рейтинги, найкращий вибір та пояснення

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
# Laptop A (id=1)
curl -X POST http://localhost:3000/api/evaluations \
  -H "Content-Type: application/json" \
  -d '{"alternative_id": 1, "criterion_id": 1, "value": 1500}'

curl -X POST http://localhost:3000/api/evaluations \
  -H "Content-Type: application/json" \
  -d '{"alternative_id": 1, "criterion_id": 2, "value": 9.5}'

# Laptop B (id=2)
curl -X POST http://localhost:3000/api/evaluations \
  -H "Content-Type: application/json" \
  -d '{"alternative_id": 2, "criterion_id": 1, "value": 900}'

curl -X POST http://localhost:3000/api/evaluations \
  -H "Content-Type: application/json" \
  -d '{"alternative_id": 2, "criterion_id": 2, "value": 7}'
```

### 4. Встановити ваги критеріїв
```bash
# Price (id=1) - 30% важливості
curl -X PUT http://localhost:3000/api/criteria/1/weight \
  -H "Content-Type: application/json" \
  -d '{"weight": 0.3}'

# Performance (id=2) - 40% важливості
curl -X PUT http://localhost:3000/api/criteria/2/weight \
  -H "Content-Type: application/json" \
  -d '{"weight": 0.4}'

# Опціонально: нормалізувати ваги
curl -X POST http://localhost:3000/api/criteria/weights/normalize \
  -H "Content-Type: application/json"
```

### 5. Розрахувати рішення
```bash
# Основний крок - розраховуємо рейтинги альтернатив
curl -X POST http://localhost:3000/api/decisions/calculate \
  -H "Content-Type: application/json" \
  -d '{"algorithm": "weighted_sum"}'
```

Результат містить:
- `rankings` — упорядкований список альтернатив з оцінками
- `best_choice` — найкраща альтернатива
- `explanation` — текстове пояснення вибору

### 6. Переглянути матрицю та алгоритми
```bash
curl http://localhost:3000/api/decisions/matrix
curl http://localhost:3000/api/decisions/algorithms
```
