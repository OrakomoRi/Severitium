# ThemeSettings Implementation Summary

## Решенная проблема

Изначально была проблема с извлечением CSS переменных из минифицированного файла `release.min.css`. В этом файле все переменные сбилжены и их невозможно корректно извлечь.

## Архитектурное решение

### 1. Отдельная билд система для переменных

**GitHub Actions модификация:**
```yaml
- name: Extract Variables to JSON
  run: |
    node -e "
    const fs = require('fs');
    const css = fs.readFileSync('src/Variables/Variables.css', 'utf8');
    const variables = {};
    const regex = /--(severitium-[^:]+):\s*([^;]+)/g;
    let match;
    while ((match = regex.exec(css)) !== null) {
      variables['--' + match[1]] = match[2].trim();
    }
    fs.writeFileSync('variables.json', JSON.stringify(variables, null, 2));
    "
```

Результат: `variables.json` создается отдельно и доступен через CDN.

### 2. Система загрузки переменных

**Приоритеты источников:**
1. **CDN (jsDelivr)** - `https://cdn.jsdelivr.net/gh/OrakomoRi/Severitium@builds/{version}/variables.json`
2. **Кэшированный CSS** - парсинг из localStorage как fallback
3. **Пустой объект** - graceful degradation

**Асинхронная загрузка:**
```javascript
async function getCurrentVariablesFromCache() {
    const version = getVersionString();
    const cdnUrl = `https://cdn.jsdelivr.net/gh/OrakomoRi/Severitium@builds/${version}/variables.json`;
    
    try {
        const response = await GM_xmlhttpRequest({
            method: 'GET',
            url: cdnUrl,
            timeout: 5000
        });
        return JSON.parse(response.responseText);
    } catch (error) {
        // Fallback to cached CSS parsing
        const cachedCSS = GM_getValue('SeveritiumCSS', '');
        return parseCSSVariables(cachedCSS);
    }
}
```

### 3. Event-based архитектура

**Проблема:** GM_setValue доступен только в userscript контексте, а ThemeSettings работает в обычном JS.

**Решение:** CustomEvents для связи между контекстами:

```javascript
// ThemeSettings.js (обычный JS)
const requestEvent = new CustomEvent('severitium:requestVariables');
document.dispatchEvent(requestEvent);

// ThemeIntegration.js (userscript контекст)
document.addEventListener('severitium:requestVariables', async (event) => {
    const variables = await getCurrentVariablesFromCache();
    const responseEvent = new CustomEvent('severitium:variablesResponse', {
        detail: { variables }
    });
    document.dispatchEvent(responseEvent);
});
```

### 4. Асинхронный UI

**UI показывает состояние загрузки:**
```javascript
async showThemeSettings() {
    // Показываем загрузку
    this.contentContainer.innerHTML = '<div class="severitium-loading">Загрузка настроек темы...</div>';
    
    // Асинхронно загружаем переменные
    await this.initializeVariables();
    
    // Показываем интерфейс
    this.createSettingsContent();
}
```

## Файловая структура

```
ThemeSettings/
├── ThemeCache.js          # Кэширование через события
├── ThemeSettings.js       # UI с асинхронной загрузкой
├── ThemeSettings.css      # Стили + loading states
├── ThemeIntegration.js    # Мост с userscript + CDN loading
└── README.md             # Документация
```

## Ключевые особенности

### 1. Устойчивость к ошибкам
- 5-секундный таймаут для CDN
- Fallback на парсинг кэшированного CSS
- Graceful degradation при полном отказе

### 2. Производительность
- Переменные загружаются только при открытии настроек
- Кэширование в localStorage для быстрого доступа
- Debounced обновления кэша (500ms)

### 3. Пользовательский опыт
- Loading indicator при загрузке
- Error handling с понятными сообщениями
- Live preview изменений

## Интеграционные точки

### С Severitium Core:
- Использует существующую систему версионирования
- Интегрируется с GM_setValue/GM_getValue через события
- Совместим с существующим кэшированием CSS

### С GitHub Actions:
- Автоматическое извлечение переменных при билде
- Публикация в ветку builds для CDN доступа
- Версионирование через git tags

### С jsDelivr CDN:
- Автоматическое обновление при новых билдах
- Кэширование на уровне CDN
- Fallback при недоступности

## Результат

✅ **Полностью решена проблема** с доступом к CSS переменным из минифицированных файлов  
✅ **Асинхронная архитектура** обеспечивает отзывчивость UI  
✅ **Надежная система fallback** гарантирует работоспособность  
✅ **Event-based communication** обходит ограничения CORS и контекстов  
✅ **Автоматическая интеграция** с существующей билд системой
