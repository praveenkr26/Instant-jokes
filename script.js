// JestAI — Joke Generator (vanilla JS)
// Uses the free, no-key JokeAPI: https://jokeapi.dev/

const JOKE_API = 'https://v2.jokeapi.dev/joke';

const $ = (sel) => document.querySelector(sel);
const generateBtn = $('#generateBtn');
const categoryInput = $('#category');
const jokeBox = $('#jokeBox');
const toastEl = $('#toast');

let currentJoke = '';
let speaking = false;

// Footer year
$('#year').textContent = new Date().getFullYear();

// Toast helper
let toastTimer;
const showToast = (message, type = 'info') => {
  clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.classList.toggle('error', type === 'error');
  toastEl.classList.add('show');
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2400);
};

// Build API URL — supports optional category keyword
const buildUrl = (category) => {
  const cat = (category || '').trim();
  // JokeAPI categories — map common keywords to its supported buckets
  const categoryMap = {
    programming: 'Programming',
    code: 'Programming',
    dev: 'Programming',
    misc: 'Misc',
    pun: 'Pun',
    puns: 'Pun',
    spooky: 'Spooky',
    christmas: 'Christmas',
    dark: 'Dark',
  };
  const bucket = categoryMap[cat.toLowerCase()] || 'Any';
  // Use template literal for clean URL building
  const params = new URLSearchParams({
    blacklistFlags: 'nsfw,religious,political,racist,sexist,explicit',
    type: 'single,twopart',
    safe: 'true',
  });
  // If user typed a free-text category that isn't in our map, search for it
  if (!categoryMap[cat.toLowerCase()] && cat) {
    params.set('contains', cat);
  }
  return `${JOKE_API}/${bucket}?${params.toString()}`;
};

const fetchJoke = async () => {
  const category = categoryInput.value;
  setLoading(true);
  try {
    const res = await fetch(buildUrl(category));
    const data = await res.json();
    if (data.error) {
      throw new Error(data.message || 'No joke found');
    }
    const text = data.type === 'twopart'
      ? `${data.setup}\n\n${data.delivery}`
      : data.joke;
    currentJoke = text;
    renderJoke(text);
  } catch (err) {
    console.error(err);
    showToast("Couldn't fetch a joke. Try a different category.", 'error');
  } finally {
    setLoading(false);
  }
};

const setLoading = (isLoading) => {
  generateBtn.disabled = isLoading;
  generateBtn.innerHTML = isLoading
    ? `<span class="spinner"></span><span>Thinking…</span>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M12 3l1.9 5.8L20 10l-5 3.6L16.5 20 12 16.8 7.5 20 9 13.6 4 10l6.1-1.2L12 3z"/></svg><span>Generate Joke</span>`;
};

const escapeHtml = (str) =>
  str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const renderJoke = (text) => {
  speaking = false;
  window.speechSynthesis?.cancel();
  jokeBox.innerHTML = `
    <div class="joke-content">
      <svg class="joke-quote-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h2c0 4-1 5-3 5l0 3z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h2c0 4-1 5-3 5l0 3z"/></svg>
      <p class="joke-text">${escapeHtml(text).replace(/\n/g, '<br/>')}</p>
      <div class="joke-actions">
        <button class="btn btn-sm" id="listenBtn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
          <span>Listen</span>
        </button>
        <button class="btn btn-sm" id="copyBtn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span>Copy</span>
        </button>
        <button class="btn btn-sm" id="shareBtn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          <span>Share</span>
        </button>
        <button class="refresh" id="refreshBtn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Another one
        </button>
      </div>
    </div>
  `;
  $('#listenBtn').addEventListener('click', toggleSpeak);
  $('#copyBtn').addEventListener('click', copyJoke);
  $('#shareBtn').addEventListener('click', shareJoke);
  $('#refreshBtn').addEventListener('click', fetchJoke);
};

// Voice synthesis using free built-in Web Speech API
const toggleSpeak = () => {
  if (!('speechSynthesis' in window)) {
    showToast("Voice isn't supported in this browser.", 'error');
    return;
  }
  if (speaking) {
    window.speechSynthesis.cancel();
    speaking = false;
    updateListenLabel();
    return;
  }
  const utter = new SpeechSynthesisUtterance(currentJoke);
  utter.rate = 1;
  utter.pitch = 1;
  utter.onend = () => { speaking = false; updateListenLabel(); };
  utter.onerror = () => { speaking = false; updateListenLabel(); };
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utter);
  speaking = true;
  updateListenLabel();
};

const updateListenLabel = () => {
  const btn = $('#listenBtn');
  if (!btn) return;
  btn.querySelector('span').textContent = speaking ? 'Stop' : 'Listen';
};

const copyJoke = async () => {
  try {
    await navigator.clipboard.writeText(currentJoke);
    showToast('Joke copied to clipboard');
  } catch {
    showToast("Couldn't copy joke", 'error');
  }
};

const shareJoke = async () => {
  const shareData = { title: 'JestAI Joke', text: currentJoke, url: window.location.href };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(`${currentJoke}\n\n— via ${window.location.href}`);
      showToast('Copied — share it anywhere!');
    }
  } catch (err) {
    if (err?.name !== 'AbortError') showToast("Couldn't share joke", 'error');
  }
};

// Wire up events
generateBtn.addEventListener('click', fetchJoke);
categoryInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') fetchJoke();
});

// Cleanup speech on unload
window.addEventListener('beforeunload', () => window.speechSynthesis?.cancel());
