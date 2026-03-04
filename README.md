# README.md

# 🤖 AI Chat — Бесплатный чат с AI моделями

Современный AI-чат с поддержкой нескольких LLM моделей через [OpenRouter](https://openrouter.ai). Полностью работает из России без VPN, серверов и прокси — только фронтенд.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)

---

## ✨ Возможности

- 🆓 **Полностью бесплатно** — все модели доступны без оплаты и привязки карты
- 🇷🇺 **Работает из России** — OpenRouter не заблокирован, VPN не нужен
- 🖥️ **Только фронтенд** — никаких серверов, бэкендов и прокси
- 🧠 **5 AI моделей** на выбор — переключение в один клик
- 💭 **Блок «Размышление»** — видно, как модель думает (Qwen 3, Nemotron)
- 📝 **Markdown** — заголовки, списки, таблицы, блоки кода с подсветкой синтаксиса
- 📋 **Копирование** — ответы и блоки кода копируются в один клик
- 📱 **Адаптивный дизайн** — одинаково удобен на ПК и мобильных устройствах
- 🔒 **Приватность** — API-ключ хранится только в localStorage вашего браузера
- 🎨 **Современный UI** — glassmorphism, анимации, тёмная тема, BEM-нотация

---

## 🧩 Доступные модели

| Модель                     | Параметры | Особенности                             |
| -------------------------- | --------- | --------------------------------------- |
| **Qwen 3 235B A22B**       | 235B MoE  | 🧠 Thinking · самая умная · рекомендуем |
| **Nvidia Nemotron 3 Nano** | 30B       | 🧠 Thinking · быстрая · рекомендуем     |
| **Mistral Small 3.1**      | 24B       | Быстрый и точный                        |
| **Qwen 3 Coder**           | 235B MoE  | Специализация на коде                   |
| **Llama 3.3 70B**          | 70B       | Универсальная от Meta                   |

> 🧠 — модели с Thinking показывают процесс рассуждения в сворачиваемом блоке «Размышление»

---

## 🚀 Быстрый старт

### 1. Клонируйте репозиторий

```bash
git https://github.com/Mauzek/hh-school-infra.git
cd hh-school-infra
```

### 2. Установите зависимости

```bash
npm install
```

### 3. Запустите

```bash
npm run dev
```

### 4. Откройте в браузере

```
http://localhost:3000
```

### 5. Получите API-ключ

При первом запуске приложение попросит ввести ключ OpenRouter:

1. Откройте [openrouter.ai](https://openrouter.ai)
2. Войдите через **Google** или **GitHub** (1 минута)
3. Перейдите в [openrouter.ai/keys](https://openrouter.ai/keys)
4. Нажмите **Create Key**
5. Скопируйте ключ (`sk-or-v1-...`)
6. Вставьте в поле на стартовом экране чата

**Готово!** 🎉

---

## 📦 Стек технологий

| Технология                                                                                       | Назначение               |
| ------------------------------------------------------------------------------------------------ | ------------------------ |
| [React 19](https://react.dev)                                                                    | UI-фреймворк             |
| [TypeScript](https://typescriptlang.org)                                                         | Типизация                |
| [Vite](https://vitejs.dev)                                                                       | Сборщик                  |
| [Axios](https://axios-http.com)                                                                  | HTTP-клиент              |
| [ReactMarkdown](https://github.com/remarkjs/react-markdown)                                      | Рендеринг Markdown       |
| [remark-gfm](https://github.com/remarkjs/remark-gfm)                                             | GitHub Flavored Markdown |
| [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter) | Подсветка синтаксиса     |
| [Lucide React](https://lucide.dev)                                                               | Иконки                   |

---

## �️ Инфраструктура разработки

Проект полностью настроен для профессиональной разработки:

| Инструмент                                            | Назначение                                            |
| ----------------------------------------------------- | ----------------------------------------------------- |
| [ESLint](https://eslint.org)                          | Линтер кода — обнаружение ошибок и опасных паттернов  |
| [Prettier](https://prettier.io)                       | Автоформатирование кода — единый стиль                |
| [TypeScript](https://typescriptlang.org)              | Типизация — предотвращение ошибок на этапе разработки |
| [EditorConfig](https://editorconfig.org)              | Единые правила для всех редакторов                    |
| [Husky](https://typicode.github.io/husky)             | Git-хуки — проверка кода перед коммитом               |
| [lint-staged](https://github.com/okonet/lint-staged)  | Линтинг только изменённых файлов в коммитах           |
| [GitHub Actions](https://github.com/features/actions) | CI/CD — автоматизированные проверки при push          |
| [gh-pages](https://pages.github.com)                  | Деплой — автоматическая публикация на GitHub Pages    |

### Автоматические проверки

При каждом коммите Husky + lint-staged автоматически:

- ✅ Форматируют код через Prettier
- ✅ Запускают ESLint на изменённых файлах
- ✅ Проверяют типы TypeScript
- ✅ Запускают тесты (если они есть)

При push на GitHub Actions:

- ✅ Запускает полный ESLint
- ✅ Проверяет типы во всём проекте
- ✅ Собирает Production-сборку (vite build)
- ✅ Публикует на GitHub Pages

### Скрипты разработки

```bash
npm run dev          # Запуск dev-сервера с hot-reload
npm run build        # Production-сборка
npm run preview      # Предпросмотр Production-сборки локально
npm run lint         # Проверка отступов, пробелов, стиля кода
npm run format       # Автоформатирование всого кода через Prettier
npm run type-check   # Проверка типов TypeScript
```

---

## �📁 Структура проекта

```
hh-school-infra/
├── public/
├── src/
│   ├── App.tsx          # Основной компонент приложения
│   ├── App.css          # Стили (BEM-нотация)
│   ├── main.tsx         # Точка входа React
│   └── index.css        # Глобальные стили и переменные
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## ⚙️ Конфигурация

### API-ключ

Ключ сохраняется в `localStorage` браузера под именем `or_key`. Управление ключом:

- **Ввод** — стартовый экран при первом запуске
- **Изменение** — кнопка ⚙️ в шапке чата
- **Удаление** — очистите localStorage в DevTools

### Выбор модели

Текущая модель сохраняется в `localStorage` под именем `or_model`. Переключение — выпадающий список в шапке чата.

---

## 🏗️ Сборка для продакшена

```bash
npm run build
```

Готовые файлы появятся в папке `dist/`. Их можно развернуть на любом статическом хостинге:

- [Vercel](https://vercel.com) — `vercel --prod`
- [Netlify](https://netlify.com) — drag & drop папки `dist`
- [GitHub Pages](https://pages.github.com)
- Любой веб-сервер (Nginx, Apache)

---

## ❓ FAQ

<details>
<summary><b>Это правда бесплатно?</b></summary>

Да. OpenRouter предоставляет бесплатный доступ к моделям с пометкой `:free`. Регистрация не требует привязки карты. Есть лимиты на количество запросов в минуту, но для обычного использования их достаточно.

</details>

<details>
<summary><b>Безопасно ли хранить ключ в браузере?</b></summary>

Ключ хранится только в `localStorage` вашего браузера и отправляется напрямую в OpenRouter по HTTPS. Никакие третьи стороны не имеют к нему доступа. Для дополнительной безопасности вы можете в любой момент отозвать ключ на [openrouter.ai/keys](https://openrouter.ai/keys) и создать новый.

</details>

<details>
<summary><b>Работает ли из России?</b></summary>

Да. OpenRouter не заблокирован в России. Все запросы идут напрямую из браузера к API OpenRouter по HTTPS. VPN, прокси и серверы не нужны.

</details>

<details>
<summary><b>Что такое блок «Размышление»?</b></summary>

Модели Qwen 3 235B и Nvidia Nemotron 3 поддерживают режим Thinking — перед ответом модель «думает вслух», выстраивая цепочку рассуждений. Это повышает качество ответов на сложные вопросы. Процесс рассуждения отображается в сворачиваемом блоке.

</details>

<details>
<summary><b>Ошибка 429 — что делать?</b></summary>

Это означает превышение лимита запросов. Бесплатные модели имеют ограничение ~20 запросов в минуту. Подождите 30–60 секунд и повторите. Также можно переключиться на другую модель.

</details>

<details>
<summary><b>Можно добавить свою модель?</b></summary>

Да. Откройте `App.tsx`, найдите массив `MODELS` и добавьте новую запись. Список всех доступных моделей: [openrouter.ai/models](https://openrouter.ai/models). Бесплатные модели имеют в ID суффикс `:free`.

</details>

---

<div align="center">
  <sub>Сделано с помощью Claude Opus 4.6-thinking ❤️ и ☕</sub>
</div>
