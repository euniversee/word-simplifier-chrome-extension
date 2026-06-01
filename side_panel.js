// ── State ─────────────────────────────────────────────
let currentWord = "";
let currentData = null;

// ── DOM refs ──────────────────────────────────────────
const $ = (id) => document.getElementById(id);

const viewMain     = $("view-main");
const viewSettings = $("view-settings");
const settingsToggle = $("settings-toggle");

const emptyState = $("empty-state");
const loader     = $("loader");
const resultCard = $("result-card");
const errorMsg   = $("error-msg");
const wordTitle  = $("word-title");
const defVal     = $("def-val");
const exVal      = $("ex-val");
const indoVal    = $("indo-val");
const ttsBtn     = $("tts-btn");
const saveBtn    = $("save-btn");

const savedToggle = $("saved-toggle");
const savedList   = $("saved-list");

const apiKeyInput = $("api-key-input");
const saveKeyBtn  = $("save-key-btn");
const testKeyBtn  = $("test-key-btn");
const keyStatus   = $("key-status");
const wordCount   = $("word-count");
const exportBtn   = $("export-btn");
const clearBtn    = $("clear-btn");

// ── Init ──────────────────────────────────────────────
loadHistory();
loadSettings();

// ── Navigation ────────────────────────────────────────
let onSettings = false;

settingsToggle.addEventListener("click", () => {
  onSettings = !onSettings;
  viewMain.classList.toggle("active", !onSettings);
  viewSettings.classList.toggle("active", onSettings);

  if (onSettings) loadSettings();
});

// ── Message listener ──────────────────────────────────
chrome.runtime.onMessage.addListener((req) => {
  if (req.action === "analyzeText" && req.text) {
    // Switch to main view if on settings
    if (onSettings) {
      onSettings = false;
      viewMain.classList.add("active");
      viewSettings.classList.remove("active");
    }
    processText(req.text);
  }
});

// ── UI States ─────────────────────────────────────────
function showLoader() {
  emptyState.style.display = "none";
  resultCard.classList.remove("active");
  errorMsg.style.display = "none";
  loader.classList.add("active");
}

function showError(msg) {
  loader.classList.remove("active");
  errorMsg.textContent = msg;
  errorMsg.style.display = "block";
}

function showResult(text, data) {
  currentWord = text;
  currentData = data;

  loader.classList.remove("active");
  errorMsg.style.display = "none";

  wordTitle.textContent = text;
  defVal.textContent = data.basic_english || "—";
  exVal.textContent  = data.example_sentence || "—";
  indoVal.textContent = data.indonesian_translation || "—";

  checkIfSaved(text);
  resultCard.classList.add("active");
}

// ── Gemini API ────────────────────────────────────────
const MODELS = [
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-flash-latest"
];

async function processText(text) {
  showLoader();

  try {
    const { geminiApiKey } = await chrome.storage.local.get(["geminiApiKey"]);
    if (!geminiApiKey) {
      throw new Error("No API key set. Open Settings to add one.");
    }

    const prompt = `Word/Phrase to analyze: "${text}"`;
    const system = `You are an expert English language teacher specializing in CEFR A2 Basic English.
Analyze the requested word or phrase and return a strictly structured JSON object.

Format:
{
  "basic_english": "[Simplified definition, max 5 words]",
  "example_sentence": "[Short CEFR A2 level example sentence]",
  "indonesian_translation": "[Accurate Indonesian translation]"
}
Return ONLY valid JSON.`;

    let response = null;

    for (const model of MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: system }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (response.ok || response.status !== 429) break;
    }

    if (!response || !response.ok) {
      if (response?.status === 429) throw new Error("All models rate-limited. Wait a moment.");
      throw new Error(`API error ${response?.status || "network"}.`);
    }

    const json = await response.json();
    const raw = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error("Empty response from API.");

    showResult(text, JSON.parse(raw.trim()));
  } catch (err) {
    showError(err.message);
  }
}

// ── TTS ───────────────────────────────────────────────
ttsBtn.addEventListener("click", () => {
  if (currentWord) chrome.tts.speak(currentWord, { lang: "en-US", rate: 0.95 });
});

// ── Save / Unsave ─────────────────────────────────────
saveBtn.addEventListener("click", () => {
  if (!currentWord || !currentData) return;

  chrome.storage.local.get(["savedWords"], (r) => {
    let list = r.savedWords || [];
    const idx = list.findIndex(i => i.word.toLowerCase() === currentWord.toLowerCase());

    if (idx === -1) {
      list.push({ word: currentWord, basic_english: currentData.basic_english, savedAt: Date.now() });
      saveBtn.classList.add("saved");
    } else {
      list.splice(idx, 1);
      saveBtn.classList.remove("saved");
    }

    chrome.storage.local.set({ savedWords: list }, loadHistory);
  });
});

function checkIfSaved(word) {
  chrome.storage.local.get(["savedWords"], (r) => {
    const saved = (r.savedWords || []).some(i => i.word.toLowerCase() === word.toLowerCase());
    saveBtn.classList.toggle("saved", saved);
  });
}

// ── Saved Words Drawer ────────────────────────────────
savedToggle.addEventListener("click", () => {
  savedList.classList.toggle("open");
  savedToggle.classList.toggle("open");
});

function loadHistory() {
  chrome.storage.local.get(["savedWords"], (r) => {
    const list = r.savedWords || [];
    savedList.innerHTML = "";

    if (!list.length) {
      savedList.innerHTML = '<div class="saved-empty">No saved words yet.</div>';
      return;
    }

    list.sort((a, b) => b.savedAt - a.savedAt).forEach(item => {
      const el = document.createElement("div");
      el.className = "saved-item";
      el.innerHTML = `<div class="saved-word">${item.word}</div><div class="saved-def">${item.basic_english || ""}</div>`;
      el.addEventListener("click", () => processText(item.word));
      savedList.appendChild(el);
    });
  });
}

// ── Settings ──────────────────────────────────────────
function loadSettings() {
  chrome.storage.local.get(["geminiApiKey", "savedWords"], (r) => {
    const key = r.geminiApiKey || "";
    apiKeyInput.value = key;
    keyStatus.innerHTML = key
      ? '<span class="badge badge-ok">Key saved</span>'
      : '<span class="badge badge-warn">No key</span>';

    const count = (r.savedWords || []).length;
    wordCount.textContent = `${count} word${count !== 1 ? "s" : ""} saved`;
  });
}

saveKeyBtn.addEventListener("click", () => {
  const key = apiKeyInput.value.trim();
  if (!key) {
    keyStatus.innerHTML = '<span class="badge badge-warn">Enter a key first</span>';
    return;
  }
  chrome.storage.local.set({ geminiApiKey: key }, () => {
    keyStatus.innerHTML = '<span class="badge badge-ok">Saved ✓</span>';
  });
});

testKeyBtn.addEventListener("click", async () => {
  const key = apiKeyInput.value.trim();
  if (!key) { keyStatus.innerHTML = '<span class="badge badge-warn">Enter a key first</span>'; return; }

  keyStatus.innerHTML = '<span class="badge" style="background:var(--accent);color:var(--fg-muted)">Testing…</span>';

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    const count = data.models?.filter(m => m.supportedGenerationMethods?.includes("generateContent")).length || 0;
    keyStatus.innerHTML = `<span class="badge badge-ok">Valid — ${count} models available</span>`;
  } catch (e) {
    keyStatus.innerHTML = `<span class="badge badge-warn">Invalid key (${e.message})</span>`;
  }
});

// ── Export ─────────────────────────────────────────────
exportBtn.addEventListener("click", () => {
  chrome.storage.local.get(["savedWords"], (r) => {
    const list = r.savedWords || [];
    if (!list.length) return;

    const csv = "Word,Definition,Saved At\n" + list.map(i =>
      `"${i.word}","${i.basic_english || ""}","${new Date(i.savedAt).toISOString()}"`
    ).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "word-simplifier-export.csv";
    a.click();
  });
});

// ── Clear All ─────────────────────────────────────────
clearBtn.addEventListener("click", () => {
  if (confirm("Delete all saved words?")) {
    chrome.storage.local.set({ savedWords: [] }, () => {
      loadHistory();
      loadSettings();
    });
  }
});
