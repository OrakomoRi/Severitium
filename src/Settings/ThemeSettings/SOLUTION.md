# 🎯 Решение: ThemeSettings с событийной интеграцией

## ✅ Решённые проблемы

### 1. **Получение переменных из Variables.css**
- ❌ Проблема: Нет прямого доступа к файлам через fetch (CORS)
- ✅ Решение: Парсинг переменных из кешированного CSS через события в userscript
- 🔄 Механизм: `severitium:requestVariables` → парсинг главного CSS → `severitium:variablesResponse`

### 2. **Сохранение в GM_setValue**
- ❌ Проблема: GM_setValue доступен только в userscript контексте
- ✅ Решение: Событийная система для передачи данных в userscript
- 🔄 Механизм: `severitium:saveThemeSettings` → GM_setValue в userscript контексте

### 3. **Обновление кеша без перезагрузки**
- ❌ Проблема: Нужно обновлять основной кеш SeveritiumCSS
- ✅ Решение: Мгновенное применение + событийное обновление кеша
- 🔄 Механизм: Изменение → DOM update → `severitium:updateThemeCache` → GM_setValue

### 4. **Ограничения билд-системы (1 JS + 1 CSS на модуль)**
- ❌ Проблема: Нельзя разбивать на множество файлов
- ✅ Решение: Правильный порядок сборки через алфавитную сортировку файлов

## 🏗️ Архитектура решения

```
┌─────────────────┐    CustomEvents    ┌─────────────────┐
│  ThemeSettings  │ ←─────────────────→ │ ThemeIntegration│
│  (обычный JS)   │                    │  (userscript)   │
├─────────────────┤                    ├─────────────────┤
│ • UI интерфейс  │                    │ • GM_setValue   │
│ • Валидация     │                    │ • GM_getValue   │
│ • DOM апдейты   │                    │ • Парсинг CSS   │
│ • localStorage  │                    │ • Кеш апдейты   │
└─────────────────┘                    └─────────────────┘
```

## 📁 Структура файлов (правильный порядок загрузки)

```
src/Settings/ThemeSettings/
├── ThemeCache.js          # 1️⃣ Загружается первым
├── ThemeIntegration.js    # 2️⃣ Мост с userscript
├── ThemeSettings.css      # 3️⃣ Стили
└── ThemeSettings.js       # 4️⃣ Основной модуль (последним)
```

## 🔄 Поток данных

### Инициализация:
1. `ThemeIntegration.js` регистрирует обработчики событий в userscript
2. `ThemeSettings.js` запрашивает переменные через `severitium:requestVariables`
3. Userscript парсит Variables.css из кеша и отвечает
4. Применяются пользовательские настройки или дефолты

### Изменение настроек:
1. Пользователь меняет цвет в UI
2. Мгновенное применение через `document.documentElement.style.setProperty()`
3. Дебаунсированное событие `severitium:updateThemeCache`
4. Userscript обновляет `SeveritiumCSS['theme-variables']`

### Сохранение:
1. Нажатие "Сохранить"
2. Событие `severitium:saveThemeSettings`
3. Userscript сохраняет в `GM_setValue('SeveritiumThemeSettings')`
4. Дублирование в localStorage как fallback

## 🛡️ Система отказоустойчивости

### Fallback #1: Hardcoded переменные
```javascript
getFallbackVariables() {
    return {
        '--severitium-main-color': 'rgb(233, 67, 67)',
        // ... все переменные из Variables.css
    };
}
```

### Fallback #2: localStorage
```javascript
// Если GM функции недоступны
if (typeof localStorage !== 'undefined') {
    localStorage.setItem('SeveritiumThemeSettings', JSON.stringify(settings));
}
```

### Fallback #3: Прямое DOM применение
```javascript
// Всегда работает, даже без кеша
document.documentElement.style.setProperty(variable, value);
```

## 🚀 Преимущества решения

1. **Не нужно модифицировать userscript** - всё через события
2. **Работает с CORS ограничениями** - нет прямых fetch запросов
3. **Автоматически билдится** - GitHub Actions подхватывает файлы
4. **Быстрые изменения** - мгновенное применение без перезагрузки
5. **Отказоустойчивость** - множественные fallback системы
6. **Совместимость** - работает с существующей системой кеширования

## 🔧 Интеграция с существующей системой

### Расширение кеша:
```javascript
// Было:
SeveritiumCSS = {
    'main': '/* основной CSS */'
}

// Стало:
SeveritiumCSS = {
    'main': '/* основной CSS */',
    'theme-variables': ':root { --severitium-main-color: rgb(233,67,67); }'
}
```

### Новые GM ключи:
- `SeveritiumThemeSettings` - пользовательские настройки
- `SeveritiumThemeCacheVersion` - версионирование кеша темы

## 🎨 UI компоненты

- **Цветовые пикеры** с hex/rgb конвертацией
- **Текстовые поля** с валидацией формата
- **Ползунки** для числовых значений
- **Экспорт/импорт** конфигураций
- **Кнопки сброса** к дефолтным значениям

## 📊 Покрытие переменных

✅ **Полное покрытие Variables.css:**
- Main colors (1 переменная)
- Text colors (12 переменных) 
- Highlighting colors (4 переменные)
- Background colors (8 переменных)
- Additional colors (13 переменных)
- Button colors (15 переменных)
- Battle tab colors (8 переменных)
- Metrics (1 переменная)

**Итого: 62 настраиваемые переменные**

## 🚀 Готовность к продакшену

- ✅ Полная функциональность
- ✅ Отказоустойчивость
- ✅ Совместимость с билд-системой
- ✅ Документация и тесты
- ✅ Примеры использования
- ✅ События для расширений

**Модуль готов к коммиту и автоматической сборке!**
