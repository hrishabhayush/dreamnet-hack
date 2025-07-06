const { contextBridge } = require('electron');

// Use native fetch API to avoid external dependencies (axios caused module resolution issues in preload)

// URL of the webhook service that stores the latest agent reply
const ENDPOINT_CANDIDATES = [
  process.env.LATEST_ENDPOINT,          // user-provided override
  'http://localhost:3000/latest',       // activity-buffer default
  'http://localhost:4000/latest',       // webhook server default
].filter(Boolean);

const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.openai_api_key || '';

async function speak(text, voiceId) {
  // Prefer OpenAI TTS if key available, else fallback to browser speechSynthesis
  if (OPENAI_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: voiceId || 'alloy',
          format: 'mp3'
        })
      });

      if (!res.ok) throw new Error('OpenAI TTS HTTP ' + res.status);

      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      return;
    } catch (err) {
      console.warn('[overlay] OpenAI TTS failed, falling back to browser TTS');
    }
  }

  // Fallback: use built-in browser TTS available in the renderer
  try {
    const utter = new SpeechSynthesisUtterance(text);
    // Cancel any ongoing speech to avoid overlaps
    window.speechSynthesis?.cancel();
    window.speechSynthesis?.speak(utter);
  } catch (err) {
    console.warn('[overlay] Browser TTS unavailable', err);
  }
}

// Try each candidate endpoint until we receive a non-empty reply
async function getLatest() {
  for (const url of ENDPOINT_CANDIDATES) {
    try {
      console.debug('[overlay] Trying', url);
      const res = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (res.status === 204) continue; // no content yet, try next
      if (res.ok) {
        const data = await res.json();
        if (data) return data;
      }
    } catch (err) {
      console.warn('[overlay] fetch error for', url, err.message || err);
      // Ignore and try the next one
    }
  }
  return null;
}

contextBridge.exposeInMainWorld('overlay', {
  getLatest,
  speak,
}); 