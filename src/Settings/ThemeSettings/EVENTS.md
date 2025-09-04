# 📡 События для интеграции с Userscript

Модуль ThemeSettings использует систему событий для взаимодействия с userscript, поскольку обычный JavaScript не имеет доступа к `GM_setValue`/`GM_getValue`.

## 🔄 Архитектура событий

```
ThemeSettings (обычный JS) ←→ CustomEvents ←→ ThemeIntegration (userscript context)
```

## 📤 События исходящие от ThemeSettings

### 1. `severitium:requestVariables`
**Назначение**: Запрос переменных темы из кеша
**Данные**: 
```javascript
{
  detail: {
    timestamp: Date.now()
  }
}
```

### 2. `severitium:requestThemeSettings`
**Назначение**: Запрос пользовательских настроек темы
**Данные**:
```javascript
{
  detail: {
    timestamp: Date.now()
  }
}
```

### 3. `severitium:saveThemeSettings`
**Назначение**: Сохранение настроек темы в GM_setValue
**Данные**:
```javascript
{
  detail: {
    settings: { /* объект с переменными */ },
    timestamp: Date.now()
  }
}
```

### 4. `severitium:updateThemeCache`
**Назначение**: Обновление кеша CSS с новыми переменными темы
**Данные**:
```javascript
{
  detail: {
    themeCSS: "/* CSS с переменными */",
    variables: { /* объект с переменными */ },
    version: "1.7.2",
    timestamp: Date.now()
  }
}
```

## 📥 События входящие в ThemeSettings

### 1. `severitium:variablesResponse`
**Назначение**: Ответ с переменными темы
**Данные**:
```javascript
{
  detail: {
    variables: { /* объект с переменными из Variables.css */ },
    timestamp: Date.now(),
    source: 'userscript'
  }
}
```

### 2. `severitium:themeSettingsResponse`
**Назначение**: Ответ с пользовательскими настройками
**Данные**:
```javascript
{
  detail: {
    settings: { /* пользовательские настройки */ } || null,
    timestamp: Date.now(),
    source: 'userscript'
  }
}
```

## 🔧 Реализация в Userscript

Файл `ThemeIntegration.js` автоматически добавляет обработчики событий:

```javascript
// Обработка запроса переменных
document.addEventListener('severitium:requestVariables', (event) => {
    const variables = getCurrentVariablesFromCache();
    const responseEvent = new CustomEvent('severitium:variablesResponse', {
        detail: { variables, timestamp: Date.now(), source: 'userscript' }
    });
    document.dispatchEvent(responseEvent);
});

// Сохранение настроек
document.addEventListener('severitium:saveThemeSettings', (event) => {
    if (event.detail?.settings) {
        GM_setValue('SeveritiumThemeSettings', JSON.stringify(event.detail.settings));
    }
});

// Обновление кеша
document.addEventListener('severitium:updateThemeCache', (event) => {
    if (event.detail?.themeCSS) {
        const cachedCSS = GM_getValue('SeveritiumCSS', {});
        cachedCSS['theme-variables'] = event.detail.themeCSS;
        GM_setValue('SeveritiumCSS', cachedCSS);
    }
});
```

## ⚡ Синхронность

События используют синхронную модель с таймаутом:

```javascript
// Запрос
document.dispatchEvent(requestEvent);

// Ожидание ответа (100мс)
const startTime = Date.now();
while (Date.now() - startTime < 100 && !response) {
    // Busy wait
}
```

## 🛡️ Fallback система

При отсутствии userscript-контекста:
- Переменные берутся из hardcoded значений
- Настройки сохраняются в localStorage
- Кеш обновляется через localStorage

## 📝 Ключи хранения

### GM_setValue (основное):
- `SeveritiumThemeSettings` - пользовательские настройки
- `SeveritiumCSS` - основной кеш CSS (расширяется секцией `theme-variables`)
- `SeveritiumThemeCacheVersion` - версия кеша

### localStorage (fallback):
- `SeveritiumThemeSettings` - дублирование настроек
- `SeveritiumCSS` - дублирование кеша
- `SeveritiumThemeCacheVersion` - версия

## 🔍 Отладка

```javascript
// Включить логирование событий
document.addEventListener('severitium:requestVariables', e => console.log('Request vars:', e));
document.addEventListener('severitium:variablesResponse', e => console.log('Response vars:', e));
document.addEventListener('severitium:saveThemeSettings', e => console.log('Save settings:', e));
document.addEventListener('severitium:updateThemeCache', e => console.log('Update cache:', e));

// Проверить доступность GM функций
console.log('GM_setValue available:', typeof GM_setValue !== 'undefined');
console.log('GM_getValue available:', typeof GM_getValue !== 'undefined');
```

## ⚠️ Ограничения

1. **Таймаут событий**: 100мс на ответ от userscript
2. **Синхронность**: Busy wait может блокировать UI на короткое время
3. **Отсутствие гарантий**: События могут не дойти при ошибках в userscript
4. **Размер данных**: Большие объекты могут влиять на производительность

## 💡 Рекомендации

1. **Мониторинг**: Проверяйте логи консоли на предмет ошибок событий
2. **Fallback**: Всегда имейте запасной план через localStorage
3. **Версионирование**: Следите за совместимостью версий кеша
4. **Производительность**: Минимизируйте частоту обновлений кеша
