import { useState, useRef, useEffect, useCallback } from "react";

// ── constants ──────────────────────────────────────────────────────────────
const DEFAULT_HOME = "newtab";
let TAB_CTR = 2;

const QUICK_LINKS = [
  { label: "Google",    url: "https://www.google.com",    icon: "🔍", color: "#4285f4" },
  { label: "YouTube",   url: "https://www.youtube.com",   icon: "▶️", color: "#ff0000" },
  { label: "Wikipedia", url: "https://www.wikipedia.org", icon: "📖", color: "#3366cc" },
  { label: "GitHub",    url: "https://github.com",        icon: "🐙", color: "#6e5494" },
  { label: "Reddit",    url: "https://www.reddit.com",    icon: "🤖", color: "#ff4500" },
  { label: "Maps",      url: "https://maps.google.com",   icon: "🗺️", color: "#34a853" },
  { label: "Gmail",     url: "https://mail.google.com",   icon: "📧", color: "#ea4335" },
  { label: "News",      url: "https://news.google.com",   icon: "📰", color: "#1a73e8" },
];

const SEARCH_ENGINES = {
  google: { name: "Google", url: "https://www.google.com/search?q=", icon: "🔍" },
  bing:   { name: "Bing",   url: "https://www.bing.com/search?q=",   icon: "🅱️" },
  duckduckgo: { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=", icon: "🦆" },
};

const THEMES = {
  dark:  { bg: "#1a1a2e", toolbar: "#16213e", tab: "#0f3460", accent: "#e94560", text: "#eee",  sub: "#aaa", border: "#2a2a4a", tabActive: "#1a1a2e", inputBg: "#0d0d1a" },
  light: { bg: "#f1f3f4", toolbar: "#ffffff", tab: "#dee1e6", accent: "#1a73e8", text: "#202124", sub: "#5f6368", border: "#dadce0", tabActive: "#f1f3f4", inputBg: "#ffffff" },
  midnight: { bg: "#0d1117", toolbar: "#161b22", tab: "#21262d", accent: "#58a6ff", text: "#c9d1d9", sub: "#8b949e", border: "#30363d", tabActive: "#0d1117", inputBg: "#0d1117" },
};

function mkTab(id, url = DEFAULT_HOME) {
  return { id, url, title: url === DEFAULT_HOME ? "New Tab" : url, loading: false, history: [url], histIndex: 0, favicon: null, muted: false };
}

function getFavicon(url) {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`; }
  catch { return null; }
}

function getHostname(url) {
  if (!url || url === DEFAULT_HOME) return "";
  try { return new URL(url).hostname.replace("www.", ""); }
  catch { return url; }
}

function isSecure(url) {
  try { return new URL(url).protocol === "https:"; }
  catch { return false; }
}

// ── New Tab Page ───────────────────────────────────────────────────────────
function NewTabPage({ onNavigate, theme, searchEngine }) {
  const [q, setQ] = useState("");
  const T = THEMES[theme];
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("bn-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const search = () => {
    if (!q.trim()) return;
    onNavigate(q);
    setQ("");
  };

  return (
    <div style={{ height: "100%", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "32px", color: T.text, fontFamily: "'Segoe UI', sans-serif", overflow: "auto", padding: "20px" }}>
      {/* Clock */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "64px", fontWeight: 300, letterSpacing: "-2px", color: T.text }}>{timeStr}</div>
        <div style={{ fontSize: "14px", color: T.sub, marginTop: "4px" }}>{dateStr}</div>
      </div>

      {/* Search Bar */}
      <div style={{ display: "flex", alignItems: "center", background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: "24px", padding: "0 20px", width: "min(580px, 90vw)", height: "48px", gap: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
        <span style={{ fontSize: "18px" }}>{SEARCH_ENGINES[searchEngine].icon}</span>
        <input
          autoFocus
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          placeholder={`${SEARCH_ENGINES[searchEngine].name}-এ সার্চ করুন...`}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "16px", color: T.text }}
        />
        {q && (
          <button onClick={search} style={{ background: T.accent, border: "none", color: "#fff", borderRadius: "16px", padding: "6px 16px", cursor: "pointer", fontWeight: 600, fontSize: "13px" }}>
            সার্চ
          </button>
        )}
      </div>

      {/* Quick Links */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center", maxWidth: "600px" }}>
        {QUICK_LINKS.map(ql => (
          <div key={ql.url} onClick={() => onNavigate(ql.url)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", padding: "12px 16px", background: T.toolbar, border: `1px solid ${T.border}`, borderRadius: "12px", cursor: "pointer", minWidth: "72px", transition: "transform 0.15s, box-shadow 0.15s" }}
            onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)"; }}
            onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
          >
            <span style={{ fontSize: "24px" }}>{ql.icon}</span>
            <span style={{ fontSize: "11px", color: T.sub }}>{ql.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Settings Panel ─────────────────────────────────────────────────────────
function SettingsPanel({ theme, setTheme, searchEngine, setSearchEngine, onClose, T }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: T.toolbar, border: `1px solid ${T.border}`, borderRadius: "16px", padding: "28px", minWidth: "320px", color: T.text, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <span style={{ fontWeight: 700, fontSize: "18px" }}>⚙️ সেটিংস</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.sub, cursor: "pointer", fontSize: "20px" }}>✕</button>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", color: T.sub, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>থিম</div>
          <div style={{ display: "flex", gap: "8px" }}>
            {Object.keys(THEMES).map(t => (
              <button key={t} onClick={() => setTheme(t)} style={{ flex: 1, padding: "8px", background: t === theme ? T.accent : T.bg, color: t === theme ? "#fff" : T.text, border: `1px solid ${T.border}`, borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: t === theme ? 700 : 400 }}>
                {t === "dark" ? "🌙 ডার্ক" : t === "light" ? "☀️ লাইট" : "🌌 মিডনাইট"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: "12px", color: T.sub, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>সার্চ ইঞ্জিন</div>
          <div style={{ display: "flex", gap: "8px" }}>
            {Object.keys(SEARCH_ENGINES).map(k => (
              <button key={k} onClick={() => setSearchEngine(k)} style={{ flex: 1, padding: "8px", background: k === searchEngine ? T.accent : T.bg, color: k === searchEngine ? "#fff" : T.text, border: `1px solid ${T.border}`, borderRadius: "8px", cursor: "pointer", fontSize: "11px", fontWeight: k === searchEngine ? 700 : 400 }}>
                {SEARCH_ENGINES[k].icon} {SEARCH_ENGINES[k].name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "20px", padding: "12px", background: T.bg, borderRadius: "8px", fontSize: "12px", color: T.sub, lineHeight: "1.8" }}>
          <div style={{ fontWeight: 600, color: T.text, marginBottom: "6px" }}>⌨️ কীবোর্ড শর্টকাট</div>
          <div>Ctrl+T → নতুন ট্যাব</div>
          <div>Ctrl+W → ট্যাব বন্ধ</div>
          <div>Ctrl+R → রিলোড</div>
          <div>Ctrl+L → অ্যাড্রেস বার ফোকাস</div>
          <div>Alt+← → পেছনে</div>
          <div>Alt+→ → সামনে</div>
        </div>
      </div>
    </div>
  );
}

// ── Download Bar ───────────────────────────────────────────────────────────
function DownloadBar({ downloads, onClear, T }) {
  if (!downloads.length) return null;
  return (
    <div style={{ background: T.toolbar, borderTop: `1px solid ${T.border}`, padding: "6px 14px", display: "flex", gap: "12px", alignItems: "center", overflowX: "auto" }}>
      <span style={{ fontSize: "12px", color: T.sub, whiteSpace: "nowrap" }}>📥 ডাউনলোড:</span>
      {downloads.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", background: T.bg, borderRadius: "6px", padding: "4px 10px", fontSize: "12px", color: T.text, whiteSpace: "nowrap" }}>
          <span>📄</span><span>{d.name}</span>
          <span style={{ color: d.done ? "#4caf50" : T.accent }}>{d.done ? "✓ সম্পন্ন" : "লোড হচ্ছে..."}</span>
        </div>
      ))}
      <button onClick={onClear} style={{ marginLeft: "auto", background: "none", border: "none", color: T.sub, cursor: "pointer", fontSize: "12px" }}>সব সাফ ✕</button>
    </div>
  );
}

// ── Context Menu ───────────────────────────────────────────────────────────
function ContextMenu({ x, y, items, onClose }) {
  useEffect(() => {
    const h = () => onClose();
    window.addEventListener("click", h);
    return () => window.removeEventListener("click", h);
  }, [onClose]);

  return (
    <div style={{ position: "fixed", left: x, top: y, background: "#1e1e35", border: "1px solid #3a3a5c", borderRadius: "10px", padding: "6px", zIndex: 9999, minWidth: "180px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
      {items.map((item, i) => item === "---"
        ? <div key={i} style={{ height: "1px", background: "#3a3a5c", margin: "4px 0" }} />
        : (
          <div key={i} onClick={() => { item.action(); onClose(); }}
            style={{ padding: "8px 14px", cursor: "pointer", borderRadius: "6px", fontSize: "13px", color: "#eee", display: "flex", alignItems: "center", gap: "8px" }}
            onMouseOver={e => e.currentTarget.style.background = "#2a2a4a"}
            onMouseOut={e => e.currentTarget.style.background = "transparent"}
          >
            <span>{item.icon}</span><span>{item.label}</span>
          </div>
        )
      )}
    </div>
  );
}

// ── Main Browser ───────────────────────────────────────────────────────────
export default function Browser() {
  const [tabs, setTabs] = useState([mkTab(1)]);
  const [activeId, setActiveId] = useState(1);
  const [inputVal, setInputVal] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [searchEngine, setSearchEngine] = useState("google");
  const [showSettings, setShowSettings] = useState(false);
  const [downloads, setDownloads] = useState([]);
  const [zoom, setZoom] = useState(100);
  const [incognito, setIncognito] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [showZoomMenu, setShowZoomMenu] = useState(false);
  const [findText, setFindText] = useState("");
  const [showFind, setShowFind] = useState(false);
  const inputRef = useRef(null);
  const T = THEMES[theme];

  const activeTab = tabs.find(t => t.id === activeId);

  // ── tab helpers ──
  const updateTab = useCallback((id, changes) => setTabs(p => p.map(t => t.id === id ? { ...t, ...changes } : t)), []);

  const navigate = useCallback((tabId, raw) => {
    let url = raw.trim();
    if (!url || url === DEFAULT_HOME) { updateTab(tabId, { url: DEFAULT_HOME, loading: false, title: "New Tab" }); if (tabId === activeId) setInputVal(""); return; }
    if (!/^https?:\/\//i.test(url)) {
      if (url.includes(".") && !url.includes(" ")) url = "https://" + url;
      else url = SEARCH_ENGINES[searchEngine].url + encodeURIComponent(url);
    }
    setTabs(p => p.map(t => {
      if (t.id !== tabId) return t;
      const hist = t.history.slice(0, t.histIndex + 1);
      hist.push(url);
      return { ...t, url, loading: true, history: hist, histIndex: hist.length - 1, favicon: getFavicon(url) };
    }));
    if (tabId === activeId) setInputVal(url);
  }, [activeId, searchEngine, updateTab]);

  const goBack = () => { if (!activeTab || activeTab.histIndex <= 0) return; const i = activeTab.histIndex - 1; const url = activeTab.history[i]; updateTab(activeId, { url, loading: true, histIndex: i }); setInputVal(url); };
  const goForward = () => { if (!activeTab || activeTab.histIndex >= activeTab.history.length - 1) return; const i = activeTab.histIndex + 1; const url = activeTab.history[i]; updateTab(activeId, { url, loading: true, histIndex: i }); setInputVal(url); };
  const reload = () => { if (!activeTab || activeTab.url === DEFAULT_HOME) return; updateTab(activeId, { loading: true }); };

  const addTab = (url = DEFAULT_HOME) => {
    const t = mkTab(TAB_CTR++, url);
    setTabs(p => [...p, t]);
    setActiveId(t.id);
    setInputVal(url === DEFAULT_HOME ? "" : url);
  };

  const closeTab = (id) => {
    if (tabs.length === 1) { setTabs([mkTab(TAB_CTR++)]); setInputVal(""); return; }
    const rest = tabs.filter(t => t.id !== id);
    setTabs(rest);
    if (activeId === id) { const n = rest[rest.length - 1]; setActiveId(n.id); setInputVal(n.url === DEFAULT_HOME ? "" : n.url); }
  };

  const switchTab = (id) => { const t = tabs.find(t => t.id === id); setActiveId(id); setInputVal(t?.url === DEFAULT_HOME ? "" : t?.url || ""); };

  // ── keyboard shortcuts ──
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "t") { e.preventDefault(); addTab(); }
        if (e.key === "w") { e.preventDefault(); closeTab(activeId); }
        if (e.key === "r") { e.preventDefault(); reload(); }
        if (e.key === "l") { e.preventDefault(); inputRef.current?.focus(); inputRef.current?.select(); }
        if (e.key === "f") { e.preventDefault(); setShowFind(f => !f); }
        if (e.key === "+" || e.key === "=") { e.preventDefault(); setZoom(z => Math.min(z + 10, 200)); }
        if (e.key === "-") { e.preventDefault(); setZoom(z => Math.max(z - 10, 50)); }
        if (e.key === "0") { e.preventDefault(); setZoom(100); }
      }
      if (e.altKey) {
        if (e.key === "ArrowLeft") { e.preventDefault(); goBack(); }
        if (e.key === "ArrowRight") { e.preventDefault(); goForward(); }
      }
      if (e.key === "Escape") { setShowFind(false); setShowSettings(false); setContextMenu(null); }
      if (e.key === "F5") { e.preventDefault(); reload(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeId, tabs]);

  // ── display url ──
  const displayUrl = inputFocused ? inputVal : (activeTab?.url === DEFAULT_HOME ? "" : activeTab?.url || "");
  const hostname = getHostname(activeTab?.url || "");
  const secure = isSecure(activeTab?.url || "");

  const canBack = activeTab && activeTab.histIndex > 0;
  const canFwd = activeTab && activeTab.histIndex < (activeTab.history?.length ?? 1) - 1;

  const tabMenu = (e, tabId) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, items: [
      { icon: "🔄", label: "রিলোড", action: () => { if (tabId === activeId) reload(); } },
      { icon: "📌", label: "পিন করুন", action: () => {} },
      "---",
      { icon: "📋", label: "URL কপি করুন", action: () => { const t = tabs.find(x => x.id === tabId); if (t) navigator.clipboard?.writeText(t.url); } },
      "---",
      { icon: "✕", label: "ট্যাব বন্ধ করুন", action: () => closeTab(tabId) },
      { icon: "✕✕", label: "অন্য সব বন্ধ করুন", action: () => { const t = tabs.find(x => x.id === tabId); setTabs([t]); setActiveId(tabId); } },
    ]});
  };

  const navBtns = [
    { icon: "←", action: goBack, disabled: !canBack, title: "পেছনে (Alt+←)" },
    { icon: "→", action: goForward, disabled: !canFwd, title: "সামনে (Alt+→)" },
    { icon: activeTab?.loading ? "✕" : "↻", action: activeTab?.loading ? () => updateTab(activeId, { loading: false }) : reload, disabled: false, title: activeTab?.loading ? "বাতিল করুন" : "রিলোড (Ctrl+R)" },
    { icon: "🏠", action: () => { updateTab(activeId, { url: DEFAULT_HOME, loading: false }); setInputVal(""); }, disabled: false, title: "হোমপেজ" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: T.bg, fontFamily: "'Segoe UI', system-ui, sans-serif", color: T.text, overflow: "hidden", userSelect: "none" }}>

      {/* ── Tab Bar ── */}
      <div style={{ display: "flex", alignItems: "flex-end", background: T.toolbar, padding: "6px 6px 0", gap: "2px", overflowX: "auto", minHeight: "42px", borderBottom: `1px solid ${T.border}` }}>
        {incognito && <div style={{ alignSelf: "center", fontSize: "16px", padding: "0 6px", opacity: 0.7 }}>🕵️</div>}
        {tabs.map((tab) => (
          <div key={tab.id} onClick={() => switchTab(tab.id)} onContextMenu={e => tabMenu(e, tab.id)}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 10px 8px 12px", background: tab.id === activeId ? T.tabActive : "transparent", borderRadius: "10px 10px 0 0", cursor: "pointer", minWidth: "90px", maxWidth: "180px", border: tab.id === activeId ? `1px solid ${T.border}` : "1px solid transparent", borderBottom: tab.id === activeId ? `1px solid ${T.tabActive}` : "none", transition: "background 0.15s", position: "relative", top: "1px" }}
          >
            {tab.favicon && !tab.loading
              ? <img src={tab.favicon} style={{ width: "14px", height: "14px", borderRadius: "3px" }} alt="" onError={e => e.target.style.display = "none"} />
              : <span style={{ fontSize: "11px", animation: tab.loading ? "spin 1s linear infinite" : "none" }}>{tab.loading ? "⟳" : "🌐"}</span>
            }
            <span style={{ fontSize: "12px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", flex: 1, color: tab.id === activeId ? T.text : T.sub }}>
              {tab.url === DEFAULT_HOME ? "New Tab" : getHostname(tab.url) || "New Tab"}
            </span>
            <span onClick={e => { e.stopPropagation(); closeTab(tab.id); }}
              style={{ fontSize: "11px", opacity: 0.4, cursor: "pointer", padding: "2px 4px", borderRadius: "4px", flexShrink: 0, transition: "opacity 0.1s, background 0.1s" }}
              onMouseOver={e => { e.target.style.opacity = 1; e.target.style.background = "rgba(255,255,255,0.1)"; }}
              onMouseOut={e => { e.target.style.opacity = 0.4; e.target.style.background = "transparent"; }}
            >✕</span>
          </div>
        ))}
        <button onClick={() => addTab()} style={{ background: "transparent", border: "none", color: T.sub, fontSize: "20px", cursor: "pointer", padding: "4px 10px 8px", alignSelf: "flex-end", borderRadius: "6px 6px 0 0", lineHeight: 1 }} title="নতুন ট্যাব (Ctrl+T)">+</button>
        <div style={{ flex: 1 }} />
        {/* Incognito */}
        <button onClick={() => setIncognito(i => !i)} title="Incognito মোড"
          style={{ background: incognito ? T.accent : "transparent", border: `1px solid ${incognito ? T.accent : "transparent"}`, color: incognito ? "#fff" : T.sub, borderRadius: "6px", padding: "4px 8px", cursor: "pointer", fontSize: "13px", marginBottom: "2px" }}>
          🕵️
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", background: T.toolbar, borderBottom: `1px solid ${T.border}` }}>
        {/* Nav buttons */}
        {navBtns.map(({ icon, action, disabled, title }) => (
          <button key={title} onClick={action} disabled={disabled} title={title}
            style={{ background: "transparent", border: "none", color: disabled ? T.border : T.sub, width: "32px", height: "32px", borderRadius: "50%", cursor: disabled ? "default" : "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s, color 0.15s" }}
            onMouseOver={e => { if (!disabled) { e.currentTarget.style.background = "rgba(128,128,128,0.15)"; e.currentTarget.style.color = T.text; } }}
            onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = disabled ? T.border : T.sub; }}
          >{icon}</button>
        ))}

        {/* Address Bar */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", background: T.inputBg, border: `1.5px solid ${inputFocused ? T.accent : T.border}`, borderRadius: "24px", padding: "0 14px", height: "36px", gap: "8px", transition: "border-color 0.2s, box-shadow 0.2s", boxShadow: inputFocused ? `0 0 0 3px ${T.accent}22` : "none" }}>
          {!inputFocused && activeTab?.url !== DEFAULT_HOME && (
            <span title={secure ? "보안 연결" : "비보안"} style={{ fontSize: "13px", flexShrink: 0 }}>{secure ? "🔒" : "⚠️"}</span>
          )}
          <input
            ref={inputRef}
            value={inputFocused ? inputVal : (hostname || "")}
            onChange={e => setInputVal(e.target.value)}
            onFocus={() => { setInputFocused(true); setInputVal(activeTab?.url === DEFAULT_HOME ? "" : activeTab?.url || ""); setTimeout(() => inputRef.current?.select(), 10); }}
            onBlur={() => setInputFocused(false)}
            onKeyDown={e => { if (e.key === "Enter") { navigate(activeId, inputVal); inputRef.current?.blur(); } if (e.key === "Escape") inputRef.current?.blur(); }}
            placeholder="সার্চ বা URL লিখুন..."
            spellCheck={false}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "13px", color: T.text, fontFamily: "inherit" }}
          />
          {inputFocused && inputVal && (
            <button onMouseDown={e => { e.preventDefault(); setInputVal(""); }} style={{ background: "none", border: "none", color: T.sub, cursor: "pointer", fontSize: "14px", padding: "0", flexShrink: 0 }}>✕</button>
          )}
        </div>

        {/* Zoom indicator */}
        {zoom !== 100 && (
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowZoomMenu(z => !z)} style={{ background: T.inputBg, border: `1px solid ${T.border}`, color: T.text, borderRadius: "8px", padding: "4px 8px", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap" }}>
              {zoom}%
            </button>
            {showZoomMenu && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", background: T.toolbar, border: `1px solid ${T.border}`, borderRadius: "10px", padding: "8px", zIndex: 100, display: "flex", flexDirection: "column", gap: "4px", minWidth: "120px" }}>
                {[50,75,100,125,150,175,200].map(z => (
                  <button key={z} onClick={() => { setZoom(z); setShowZoomMenu(false); }} style={{ background: z === zoom ? T.accent : "transparent", color: z === zoom ? "#fff" : T.text, border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "13px", textAlign: "left" }}>{z}%</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Toolbar actions */}
        {[
          { icon: "⭐", title: "বুকমার্ক (Ctrl+D)", action: () => {} },
          { icon: "🔍", title: "পেজে খুঁজুন (Ctrl+F)", action: () => setShowFind(f => !f) },
          { icon: zoom !== 100 ? `🔍` : "🔎", title: "জুম", action: () => setShowZoomMenu(z => !z) },
          { icon: "⚙️", title: "সেটিংস", action: () => setShowSettings(true) },
        ].map(({ icon, title, action }) => (
          <button key={title} onClick={action} title={title}
            style={{ background: "transparent", border: "none", color: T.sub, width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            onMouseOver={e => { e.currentTarget.style.background = "rgba(128,128,128,0.15)"; e.currentTarget.style.color = T.text; }}
            onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.sub; }}
          >{icon}</button>
        ))}
      </div>

      {/* ── Find Bar ── */}
      {showFind && (
        <div style={{ background: T.toolbar, borderBottom: `1px solid ${T.border}`, padding: "6px 14px", display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", color: T.sub }}>🔍 খুঁজুন:</span>
          <input autoFocus value={findText} onChange={e => setFindText(e.target.value)} placeholder="পেজে খুঁজুন..."
            style={{ background: T.inputBg, border: `1px solid ${T.border}`, borderRadius: "6px", padding: "4px 10px", color: T.text, fontSize: "13px", outline: "none", minWidth: "180px" }} />
          <button onClick={() => setShowFind(false)} style={{ background: "none", border: "none", color: T.sub, cursor: "pointer", fontSize: "16px" }}>✕</button>
        </div>
      )}

      {/* ── Viewport ── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {tabs.map(tab => (
          <div key={tab.id} style={{ position: "absolute", inset: 0, display: tab.id === activeId ? "block" : "none" }}>
            {tab.url === DEFAULT_HOME
              ? <NewTabPage onNavigate={url => navigate(tab.id, url)} theme={theme} searchEngine={searchEngine} />
              : (
                <div style={{ width: "100%", height: "100%", transform: `scale(${zoom / 100})`, transformOrigin: "top left", width: `${10000 / zoom}%`, height: `${10000 / zoom}%` }}>
                  <iframe
                    key={tab.url}
                    src={tab.url}
                    style={{ width: "100%", height: "100%", border: "none", background: "#fff" }}
                    title={`tab-${tab.id}`}
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                    onLoad={() => updateTab(tab.id, { loading: false })}
                  />
                </div>
              )
            }
          </div>
        ))}

        {/* Loading bar */}
        {activeTab?.loading && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${T.accent}, ${T.accent}88, transparent)`, animation: "loadbar 1.5s ease-in-out infinite", zIndex: 10 }} />
        )}
      </div>

      {/* ── Download Bar ── */}
      <DownloadBar downloads={downloads} onClear={() => setDownloads([])} T={T} />

      {/* ── Status Bar ── */}
      <div style={{ background: T.toolbar, borderTop: `1px solid ${T.border}`, padding: "2px 14px", fontSize: "11px", color: T.sub, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{activeTab?.loading ? "🔄 লোড হচ্ছে..." : "✓ প্রস্তুত"}</span>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {incognito && <span>🕵️ Incognito</span>}
          <span>{tabs.length} ট্যাব খোলা</span>
          <span style={{ cursor: "pointer" }} onClick={() => setZoom(z => Math.min(z + 10, 200))} title="জুম বাড়ান">🔍 {zoom}%</span>
          <span>{theme === "dark" ? "🌙" : theme === "light" ? "☀️" : "🌌"}</span>
        </div>
      </div>

      {/* ── Settings ── */}
      {showSettings && <SettingsPanel theme={theme} setTheme={setTheme} searchEngine={searchEngine} setSearchEngine={setSearchEngine} onClose={() => setShowSettings(false)} T={T} />}

      {/* ── Context Menu ── */}
      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} items={contextMenu.items} onClose={() => setContextMenu(null)} />}

      {/* ── CSS Animations ── */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes loadbar { 0% { width: 0%; opacity: 1; } 70% { width: 80%; opacity: 1; } 100% { width: 100%; opacity: 0; } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #3a3a5c; border-radius: 3px; }
      `}</style>
    </div>
  );
    }
