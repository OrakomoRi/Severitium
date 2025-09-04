# 🔧 Интеграция модуля ThemeSettings

Для полной интеграции модуля ThemeSettings в проект Severitium необходимо выполнить следующие шаги:

## 1. Структура файлов

Модуль состоит из следующих файлов:
- `ThemeCache.js` - Система кеширования настроек темы
- `ThemeSettings.js` - Основной модуль управления настройками
- `ThemeSettings.css` - Стили интерфейса настроек
- `ThemeIntegration.js` - Интеграция с основной системой

## 2. Порядок загрузки

Файлы должны загружаться в следующем порядке:
1. `ThemeCache.js` (первым, так как от него зависят остальные)
2. `ThemeSettings.js` 
3. `ThemeIntegration.js` (последним)
4. `ThemeSettings.css` (может загружаться в любом порядке с CSS)

## 3. Интеграция в систему сборки

Модуль автоматически интегрируется в систему сборки благодаря структуре папок. GitHub Actions будет автоматически включать файлы при сборке.

## 4. Система кеширования

Модуль использует расширенную систему кеширования:

### Ключи localStorage:
- `SeveritiumThemeSettings` - Пользовательские настройки
- `SeveritiumCSS` - Основной кеш CSS (расширяется темой)
- `SeveritiumThemeCacheVersion` - Версия кеша темы

### Интеграция с основным кешем:
```javascript
// Кеш CSS расширяется секцией theme-variables
const cachedCSS = GM_getValue('SeveritiumCSS', {});
cachedCSS['theme-variables'] = themeCSS;
GM_setValue('SeveritiumCSS', cachedCSS);
```

## 5. Динамическое обновление

### Немедленное применение:
- Изменения применяются сразу через `document.documentElement.style.setProperty()`
- Дополнительно инжектируется `<style>` элемент для постоянства

### Дебаунсинг:
- Обновление кеша происходит с задержкой 500мс для оптимизации
- Используется система дебаунсинга для группировки изменений

### Сохранение в кеш:
- При каждом изменении обновляется localStorage
- При сохранении настроек обновляется основной кеш CSS

## 6. API для использования

### Глобальные объекты:
```javascript
window.severitiumThemeSettings // Основной экземпляр настроек
window.SeveritiumThemeCache     // Класс для кеширования
```

### Основные методы:
```javascript
// Сохранить настройки
window.severitiumThemeSettings.saveSettings();

// Сбросить к умолчанию
window.severitiumThemeSettings.resetToDefaults();

// Экспорт/импорт
window.severitiumThemeSettings.exportSettings();
window.severitiumThemeSettings.importSettings(event);

// Применить переменные
window.severitiumThemeSettings.applyVariables();
```

## 7. Совместимость

Модуль совместим с:
- Существующей системой переменных в `Variables.css`
- Системой кеширования Severitium
- Автоматической сборкой через GitHub Actions
- SweetAlert2 для уведомлений (с fallback на alert)

## 8. Обработка ошибок

- Graceful degradation при отсутствии зависимостей
- Fallback на alert() при отсутствии SweetAlert2
- Предупреждения в консоли при проблемах с кешем
- Валидация форматов цветов и значений

## 9. Тестирование

После интеграции проверьте:
1. Появление вкладки "Тема Severitium" в настройках игры
2. Работу цветовых пикеров и текстовых полей
3. Немедленное применение изменений
4. Сохранение настроек между сессиями
5. Экспорт/импорт настроек

## 10. Отладка

Для отладки используйте:
```javascript
// Проверка состояния
console.log(window.severitiumThemeSettings);
console.log(window.severitiumThemeSettings.currentVariables);

// Проверка кеша
console.log(GM_getValue('SeveritiumCSS', {}));
console.log(GM_getValue('SeveritiumThemeSettings', {}));
```
