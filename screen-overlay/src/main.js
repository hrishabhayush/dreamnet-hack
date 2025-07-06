/*
 * Periodically polls the local webhook for the latest agent response
 * and renders it inside an element with id="agent-message".
 * Assumes webhook returns: { text: "[ { text: '...', user: '...' } ]", saveModified: false }
 */

const WEBHOOK_URL = window.WEBHOOK_URL || 'http://localhost:4000';
const POLL_INTERVAL = 5000; // 5 s, adjust as needed

async function fetchAgentMessage() {
  try {
    // Simple health request (you can switch to a designated endpoint)
    const res = await fetch(WEBHOOK_URL + '/latest'); // Example endpoint you might expose
    if (!res.ok) return;
    const data = await res.json();
    const messageArr = JSON.parse(data.text);
    const msg = messageArr[0]?.text || '';

    document.getElementById('agent-message').textContent = msg;
  } catch (err) {
    console.error('Overlay fetch error', err);
  }
}

setInterval(fetchAgentMessage, POLL_INTERVAL);
