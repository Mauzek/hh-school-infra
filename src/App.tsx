import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type JSX,
} from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Send,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Loader2,
  AlertCircle,
  MessageSquare,
  X,
  ChevronDown,
  Settings,
  ExternalLink,
  CheckCircle2,
  Brain,
  ChevronRight,
} from 'lucide-react';
import './App.css';

/* ══════════ Types ══════════ */

interface Model {
  id: string;
  name: string;
  short: string;
  desc: string;
  thinking: boolean;
}

interface Msg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string | null;
  model?: string;
  ts: Date;
  entering?: boolean;
}

/* ══════════ Constants ══════════ */

const MODELS: Model[] = [
  {
    id: 'qwen/qwen3-235b-a22b-thinking-2507',
    name: 'Qwen 3 235B A22B',
    short: 'Qwen 3',
    desc: 'Thinking · 235B MoE · рекомендуем',
    thinking: true,
  },
  {
    id: 'nvidia/nemotron-3-nano-30b-a3b:free',
    name: 'Nvidia Nemotron 3 Nano 30B',
    short: 'Nvidia Nemotron 3',
    desc: 'Nvidia · 30B · рекомендуем',
    thinking: true,
  },
  {
    id: 'mistralai/mistral-small-3.1-24b-instruct:free',
    name: 'Mistral Small 3.1',
    short: 'Mistral',
    desc: '24B · быстрый и точный',
    thinking: false,
  },
  {
    id: 'qwen/qwen3-coder:free',
    name: 'Qwen 3 Coder',
    short: 'Qwen 3 Coder',
    desc: 'Кодер · 235B MoE · хорош для кода',
    thinking: false,
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B',
    short: 'Llama 3.3',
    desc: 'Meta · 70B · универсальный',
    thinking: false,
  },
];

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const PROMPTS = [
  { emoji: '💡', text: 'Объясни квантовые вычисления простыми словами' },
  { emoji: '🧑‍💻', text: 'Напиши функцию сортировки на Python' },
  { emoji: '📝', text: 'Составь план изучения React за месяц' },
  { emoji: '🌍', text: '5 интересных фактов о космосе' },
];

const LS_KEY = 'or_key';
const LS_MODEL = 'or_model';

/* ══════════ Helpers ══════════ */

const uid = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const getModel = (id: string): Model =>
  MODELS.find((m) => m.id === id) || MODELS[0];

function extractThinking(raw: string): {
  thinking: string | null;
  answer: string;
} {
  const re = /<think>([\s\S]*?)(<\/think>|$)/g;
  let thinking = '';
  let cleaned = raw;

  let match;
  while ((match = re.exec(raw)) !== null) {
    thinking += (thinking ? '\n\n' : '') + match[1].trim();
    cleaned = cleaned.replace(match[0], '');
  }

  cleaned = cleaned.trim();
  return {
    thinking: thinking || null,
    answer: cleaned || raw,
  };
}

const codeCss: React.CSSProperties = {
  margin: 0,
  padding: '16px',
  background: 'rgba(0,0,0,.42)',
  fontSize: '.84rem',
  lineHeight: 1.6,
};

/* ══════════ Component ══════════ */

export default function App(): JSX.Element {
  /* ── State ── */
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem(LS_KEY) || '',
  );
  const [modelId, setModelId] = useState(
    () => localStorage.getItem(LS_MODEL) || MODELS[0].id,
  );
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showSetup, setShowSetup] = useState(!apiKey);
  const [keyInput, setKeyInput] = useState('');
  const [setupErr, setSetupErr] = useState('');

  const taRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const curModel = getModel(modelId);

  /* ── Persist ── */
  useEffect(() => {
    localStorage.setItem(LS_MODEL, modelId);
  }, [modelId]);

  /* ── Scroll ── */
  const scroll = useCallback(
    () => endRef.current?.scrollIntoView({ behavior: 'smooth' }),
    [],
  );
  useEffect(scroll, [msgs, scroll]);

  /* ── Auto resize ── */
  useEffect(() => {
    const el = taRef.current;
    if (!el) {
      return;
    }
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [input]);

  const copy = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  /* ── Save key ── */
  const saveKey = useCallback(() => {
    const k = keyInput.trim();
    if (!k) {
      setSetupErr('Введите API ключ');
      return;
    }
    if (!k.startsWith('sk-or-')) {
      setSetupErr('Ключ должен начинаться с sk-or-');
      return;
    }
    localStorage.setItem(LS_KEY, k);
    setApiKey(k);
    setShowSetup(false);
    setSetupErr('');
  }, [keyInput]);

  /* ── Clear ── */
  const clear = useCallback(() => {
    setMsgs([]);
    setError(null);
  }, []);

  /* ── Send ── */
  const send = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || busy) {
        return;
      }
      setError(null);

      const uId = uid();
      setMsgs((p) => [
        ...p,
        { id: uId, role: 'user', content, ts: new Date(), entering: true },
      ]);
      setInput('');
      setBusy(true);
      if (taRef.current) {
        taRef.current.style.height = 'auto';
      }

      setTimeout(
        () =>
          setMsgs((p) =>
            p.map((m) => (m.id === uId ? { ...m, entering: false } : m)),
          ),
        350,
      );

      try {
        const history = msgs.map((m) => ({ role: m.role, content: m.content }));

        const { data } = await axios.post(
          API_URL,
          {
            model: modelId,
            messages: [
              {
                role: 'system',
                content:
                  'Ты полезный AI-ассистент. Отвечай подробно, структурированно, используя markdown.',
              },
              ...history,
              { role: 'user', content },
            ],
            temperature: 0.7,
            max_tokens: 4096,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': window.location.origin,
              'X-Title': 'AI Chat',
            },
            timeout: 120_000,
          },
        );

        const raw = data.choices?.[0]?.message?.content || '';
        const reasoning = data.choices?.[0]?.message?.reasoning || null;

        const { thinking, answer } = extractThinking(raw);
        const allThinking =
          [reasoning, thinking].filter(Boolean).join('\n\n') || null;

        const bId = uid();
        setMsgs((p) => [
          ...p,
          {
            id: bId,
            role: 'assistant',
            content: answer,
            thinking: allThinking,
            model: curModel.short,
            ts: new Date(),
            entering: true,
          },
        ]);
        setTimeout(
          () =>
            setMsgs((p) =>
              p.map((m) => (m.id === bId ? { ...m, entering: false } : m)),
            ),
          600,
        );
      } catch (err) {
        let txt = 'Ошибка при обращении к API';
        if (err instanceof axios.AxiosError) {
          const s = err.response?.status;
          if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') {
            txt = 'Ошибка сети. Проверьте интернет-соединение.';
          } else if (s === 401) {
            txt = 'Неверный API ключ. Нажмите ⚙️ чтобы изменить.';
          } else if (s === 429) {
            txt = 'Лимит запросов. Подождите минуту и попробуйте снова.';
          } else if (s === 402) {
            txt =
              'Недостаточно кредитов. Используйте бесплатную модель (:free).';
          } else {
            const msg =
              err.response?.data?.error?.message ||
              err.response?.data?.error ||
              err.message;
            txt = `Ошибка ${s}: ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`;
          }
        }
        setError(txt);
      } finally {
        setBusy(false);
        taRef.current?.focus();
      }
    },
    [input, busy, msgs, modelId, apiKey, curModel.short],
  );

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      send();
    },
    [send],
  );
  const onKey = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    },
    [send],
  );

  /* ── Markdown ── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type P = any;

  const md = useMemo(
    () => ({
      pre: (p: P) => <div className="md-pre">{p.children}</div>,
      code: (p: P) => {
        const { className, children } = p;
        const m = /language-(\w+)/.exec(className || '');
        const raw = String(children).replace(/\n$/, '');
        if (m) {
          const cid = `c-${m[1]}-${raw.length}`;
          return (
            <div className="codeblk">
              <div className="codeblk__bar">
                <span className="codeblk__lang">{m[1]}</span>
                <button
                  className={`codeblk__copy${copied === cid ? ' codeblk__copy--ok' : ''}`}
                  onClick={() => copy(raw, cid)}
                >
                  {copied === cid ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied === cid ? 'Готово' : 'Копировать'}</span>
                </button>
              </div>
              <SyntaxHighlighter
                style={oneDark}
                language={m[1]}
                PreTag="div"
                customStyle={{ ...codeCss, borderRadius: '0 0 10px 10px' }}
              >
                {raw}
              </SyntaxHighlighter>
            </div>
          );
        }
        if (raw.includes('\n')) {
          return (
            <div className="codeblk">
              <SyntaxHighlighter
                style={oneDark}
                language="text"
                PreTag="div"
                customStyle={{ ...codeCss, borderRadius: 10 }}
              >
                {raw}
              </SyntaxHighlighter>
            </div>
          );
        }
        return <code className="md-code">{children}</code>;
      },
      table: (p: P) => (
        <div className="md-tw">
          <table className="md-table">{p.children}</table>
        </div>
      ),
      th: (p: P) => <th className="md-th">{p.children}</th>,
      td: (p: P) => <td className="md-td">{p.children}</td>,
      ul: (p: P) => <ul className="md-ul">{p.children}</ul>,
      ol: (p: P) => <ol className="md-ol">{p.children}</ol>,
      li: (p: P) => <li className="md-li">{p.children}</li>,
      a: (p: P) => (
        <a
          className="md-a"
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {p.children}
        </a>
      ),
      blockquote: (p: P) => (
        <blockquote className="md-bq">{p.children}</blockquote>
      ),
      h1: (p: P) => <h1 className="md-h1">{p.children}</h1>,
      h2: (p: P) => <h2 className="md-h2">{p.children}</h2>,
      h3: (p: P) => <h3 className="md-h3">{p.children}</h3>,
      p: (p: P) => <p className="md-p">{p.children}</p>,
      strong: (p: P) => <strong className="md-strong">{p.children}</strong>,
      em: (p: P) => <em className="md-em">{p.children}</em>,
      hr: () => <hr className="md-hr" />,
    }),
    [copy, copied],
  );

  const hasMsgs = msgs.length > 0;

  /* ════════════ SETUP SCREEN ════════════ */
  if (showSetup) {
    return (
      <div className="app setup">
        <div className="setup__card">
          <div className="setup__icon">
            <Sparkles size={28} />
          </div>
          <h1 className="setup__title">AI Ассистент</h1>
          <p className="setup__desc">
            Бесплатный чат с лучшими AI моделями.
            <br />
            Нужен ключ OpenRouter (бесплатно, без карты).
          </p>

          {setupErr && <div className="setup__error">{setupErr}</div>}

          <div className="setup__field">
            <label className="setup__label">API ключ OpenRouter</label>
            <input
              className="setup__input"
              type="password"
              placeholder="sk-or-v1-..."
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                setSetupErr('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && saveKey()}
              autoFocus
            />
          </div>

          <button
            className="setup__btn"
            onClick={saveKey}
            disabled={!keyInput.trim()}
          >
            Начать чат
          </button>

          <a
            className="setup__link"
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink size={16} />
            Получить ключ бесплатно
          </a>

          <div className="setup__features">
            <div className="setup__feat">
              <CheckCircle2 size={16} className="setup__feat-icon" />
              Регистрация за 1 минуту (Google / GitHub)
            </div>
            <div className="setup__feat">
              <CheckCircle2 size={16} className="setup__feat-icon" />
              Бесплатные модели: Qwen, Llama, Gemma, Mistral
            </div>
            <div className="setup__feat">
              <CheckCircle2 size={16} className="setup__feat-icon" />
              Работает из России без VPN
            </div>
            <div className="setup__feat">
              <CheckCircle2 size={16} className="setup__feat-icon" />
              Ключ хранится только в вашем браузере
            </div>
          </div>
        </div>

        {/* Close button if returning from chat */}
        {apiKey && (
          <button
            className="chat__btn"
            style={{ position: 'fixed', top: 20, right: 20 }}
            onClick={() => setShowSetup(false)}
          >
            <X size={20} />
          </button>
        )}
      </div>
    );
  }

  /* ════════════ CHAT SCREEN ════════════ */
  return (
    <div className="app">
      <div className="chat">
        {/* ── Header ── */}
        <header className="chat__header">
          <div className="chat__brand">
            <div className="chat__logo">
              <Sparkles size={20} />
            </div>
            <div className="chat__brand-text">
              <h1 className="chat__title">AI Ассистент</h1>
              <p className="chat__subtitle">
                <span
                  className={`chat__dot chat__dot--${error ? 'err' : 'ok'}`}
                />
                {error ? 'Ошибка' : 'Онлайн · бесплатно'}
              </p>
            </div>
          </div>

          <div className="chat__actions">
            {/* Model picker */}
            <div className="picker">
              <button
                className={`picker__trigger${showPicker ? ' picker__trigger--open' : ''}`}
                onClick={() => setShowPicker(!showPicker)}
              >
                <span>{curModel.short}</span>
                <ChevronDown size={14} className="picker__trigger-icon" />
              </button>

              {showPicker && (
                <>
                  <div
                    className="picker__backdrop"
                    onClick={() => setShowPicker(false)}
                  />
                  <div className="picker__drop">
                    {MODELS.map((m) => (
                      <button
                        key={m.id}
                        className={`picker__item${m.id === modelId ? ' picker__item--active' : ''}`}
                        onClick={() => {
                          setModelId(m.id);
                          setShowPicker(false);
                        }}
                      >
                        <div className="picker__item-info">
                          <span className="picker__item-name">{m.name}</span>
                          <span className="picker__item-desc">{m.desc}</span>
                        </div>
                        {m.id === modelId && (
                          <Check size={16} className="picker__item-check" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              className="chat__btn"
              onClick={() => {
                setKeyInput(apiKey);
                setShowSetup(true);
              }}
              title="Настройки"
              aria-label="Настройки"
            >
              <Settings size={17} />
            </button>

            {hasMsgs && (
              <button
                className="chat__btn chat__btn--danger"
                onClick={clear}
                title="Очистить"
                aria-label="Очистить чат"
              >
                <Trash2 size={17} />
              </button>
            )}
          </div>
        </header>

        {/* ── Error ── */}
        {error && (
          <div className="chat__error">
            <AlertCircle size={17} className="chat__error-icon" />
            <span>{error}</span>
            <button className="chat__error-x" onClick={() => setError(null)}>
              <X size={15} />
            </button>
          </div>
        )}

        {/* ── Body ── */}
        <div className="chat__body">
          {!hasMsgs && (
            <div className="chat__empty">
              <div className="chat__empty-icon">
                <MessageSquare size={26} />
              </div>
              <p className="chat__empty-title">Привет! 👋</p>
              <p className="chat__empty-desc">
                Задайте любой вопрос — модель <strong>{curModel.short}</strong>{' '}
                ответит бесплатно
              </p>
              <div className="chat__prompts">
                {PROMPTS.map((q) => (
                  <button
                    key={q.text}
                    className="chat__prompt"
                    onClick={() => send(q.text)}
                  >
                    <span className="chat__prompt-emoji">{q.emoji}</span>
                    {q.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {msgs.map((m) => (
            <article
              key={m.id}
              className={`msg msg--${m.role === 'user' ? 'user' : 'bot'}${m.entering ? ' msg--enter' : ''}`}
            >
              <div
                className={`msg__avatar msg__avatar--${m.role === 'user' ? 'user' : 'bot'}`}
              >
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="msg__body">
                <div
                  className={`msg__bubble msg__bubble--${m.role === 'user' ? 'user' : 'bot'}`}
                >
                  {/* Thinking block */}
                  {m.thinking && (
                    <details className="think">
                      <summary className="think__toggle">
                        <Brain size={14} />
                        Размышление
                        <ChevronRight
                          size={14}
                          className="think__toggle-arrow"
                        />
                      </summary>
                      <div className="think__content">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={md}
                        >
                          {m.thinking}
                        </ReactMarkdown>
                      </div>
                    </details>
                  )}
                  {m.role === 'assistant' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={md}>
                      {m.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="msg__text">{m.content}</p>
                  )}
                </div>
                <div className="msg__meta">
                  <time className="msg__time">
                    {m.ts.toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                  {m.model && <span className="msg__model">{m.model}</span>}
                  {m.role === 'assistant' && (
                    <button
                      className={`msg__copy${copied === m.id ? ' msg__copy--ok' : ''}`}
                      onClick={() => copy(m.content, m.id)}
                      title="Копировать"
                    >
                      {copied === m.id ? (
                        <Check size={13} />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}

          {busy && (
            <article className="msg msg--bot msg--enter">
              <div className="msg__avatar msg__avatar--bot">
                <Bot size={16} />
              </div>
              <div className="msg__body">
                <div className="msg__bubble msg__bubble--bot">
                  <div className="typing">
                    <span className="typing__dot" />
                    <span className="typing__dot" />
                    <span className="typing__dot" />
                  </div>
                </div>
              </div>
            </article>
          )}

          <div ref={endRef} />
        </div>

        {/* ── Composer ── */}
        <footer className="composer">
          <form className="composer__form" onSubmit={onSubmit}>
            <div className="composer__wrap">
              <textarea
                ref={taRef}
                className="composer__textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                placeholder="Напишите сообщение…"
                disabled={busy}
                rows={1}
              />
            </div>
            <button
              type="submit"
              className={`composer__send${input.trim() && !busy ? ' composer__send--go' : ''}`}
              disabled={busy || !input.trim()}
              aria-label="Отправить"
            >
              {busy ? (
                <Loader2 size={19} className="composer__spin" />
              ) : (
                <Send size={19} />
              )}
            </button>
          </form>
          <p className="composer__hint">
            <kbd>Enter</kbd> — отправить · <kbd>Shift+Enter</kbd> — новая строка
          </p>
        </footer>
      </div>
    </div>
  );
}
