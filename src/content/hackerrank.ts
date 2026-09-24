import { ExtractedSubmissionPayload } from '../shared/types';

console.log('[DSA Memory] Content script loaded');
console.log('[DSA Memory] Current URL:', window.location.href);

function showToast(message: string, subtext?: string) {
  const existing = document.getElementById('dsa-memory-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'dsa-memory-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #10B981;
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    z-index: 9999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: opacity 0.3s ease;
    border: 1px solid #059669;
  `;
  
  if (message === 'Already saved') {
    toast.style.background = '#3B82F6';
    toast.style.border = '1px solid #2563EB';
  } else if (message.includes("Couldn't")) {
    toast.style.background = '#EF4444';
    toast.style.border = '1px solid #DC2626';
  }

  const title = document.createElement('strong');
  title.style.fontSize = '14px';
  title.textContent = message;
  toast.appendChild(title);

  if (subtext) {
    const sub = document.createElement('span');
    sub.style.fontSize = '12px';
    sub.style.opacity = '0.9';
    sub.textContent = subtext;
    toast.appendChild(sub);
  }

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'SHOW_TOAST') {
    showToast(msg.payload.message, msg.payload.subtext);
  }
});

// --- Extractors ---
function getProblemTitle(): string {
  const titleEl = document.querySelector('.ui-icon-label.page-label, .challenge-title, h1.ui-icon-label');
  if (titleEl && titleEl.textContent) {
    return titleEl.textContent.trim().replace('Challenge: ', '');
  }
  
  const h1 = document.querySelector('h1');
  if (h1 && h1.textContent) return h1.textContent.trim();
  
  return 'Unknown Problem';
}

function getProblemUrl(): string {
  return window.location.href.split('?')[0]; // Remove query params
}

function getDifficulty(): string | undefined {
  const diffEl = document.querySelector('.difficulty');
  return diffEl ? diffEl.textContent?.trim() : undefined;
}

function getLanguage(): string {
  const langSelectors = [
    '.select2-selection__rendered',
    '.language-select',
    '#lang-select',
    '[data-analytics="SelectLanguage"]',
    '.css-1hwfws3', // react-select inner
    '.custom-select .text'
  ];
  for (const sel of langSelectors) {
    const el = document.querySelector(sel);
    if (el && el.textContent) {
       const text = el.textContent.trim();
       if (text) return text;
    }
  }
  return 'Unknown';
}

interface ExtractedData {
  code: string;
  language: string;
  method: string;
}

function extractEditorData(): Promise<ExtractedData> {
  return new Promise((resolve) => {
    const requestId = crypto.randomUUID();
    
    const listener = (event: MessageEvent) => {
      if (event.source !== window || !event.data || event.data.type !== 'DSA_MEMORY_MONACO_RESULT') return;
      if (event.data.requestId !== requestId) return;
      
      window.removeEventListener('message', listener);
      clearTimeout(timeout);
      
      if (event.data.success) {
        console.log('[DSA Memory] Monaco extraction successful');
        console.log('[DSA Memory] Source:', event.data.source);
        console.log('[DSA Memory] Language:', event.data.languageId);
        
        // Log diagnostics but NOT the full code
        const lines = event.data.code.split('\\n');
        console.log('[DSA Memory] Lines:', lines.length);
        console.log('[DSA Memory] Characters:', event.data.code.length);
        
        resolve({ code: event.data.code, language: event.data.languageId, method: event.data.source });
      } else {
        console.log('[DSA Memory] Monaco unavailable. Reason:', event.data.reason);
        console.log('[DSA Memory] Falling back to DOM extraction.');
        resolve({ code: getSolutionCodeFromDOM(), language: '', method: 'dom_fallback' });
      }
    };
    
    window.addEventListener('message', listener);
    
    window.postMessage({
      type: 'DSA_MEMORY_GET_EDITOR',
      requestId
    }, '*');

    // Safety timeout in case the MAIN world script is missing or fails silently
    const timeout = setTimeout(() => {
      window.removeEventListener('message', listener);
      console.log('[DSA Memory] Code extraction failed (timeout).');
      console.log('[DSA Memory] Falling back to DOM extraction.');
      resolve({ code: getSolutionCodeFromDOM(), language: '', method: 'timeout_dom_fallback' });
    }, 1000);
  });
}

function getSolutionCodeFromDOM(): string {
  const nbsp = String.fromCharCode(160);
  const replaceNbsp = (str: string) => str.split(nbsp).join(' ');

  // 2. Fallback: Monaco editor lines (DOM)
  const viewLines = document.querySelector('.view-lines');
  if (viewLines) {
    const lines = Array.from(viewLines.children).map(line => replaceNbsp(line.textContent || ''));
    const code = lines.join('\n');
    if (code.trim().length > 0) return code;
  }
  
  // 3. Fallback: older CodeMirror
  const codeMirror = document.querySelector('.CodeMirror-code');
  if (codeMirror) {
    const lines = Array.from(codeMirror.children).map(line => replaceNbsp(line.textContent || ''));
    const code = lines.join('\n');
    if (code.trim().length > 0) return code;
  }
  
  // 4. Fallback: submission result view
  const submissionCode = document.querySelector('.submission-code, .source-code');
  if (submissionCode) {
     return submissionCode.textContent || '';
  }

  return '';
}

// --- Observer ---
const processedFingerprints = new Set<string>();
let isProcessing = false;

async function generateLocalFingerprint(platform: string, url: string, code: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(platform + ':' + url + ':' + code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function checkSubmissionStatus() {
  if (isProcessing) return;

  const successSelectors = [
    '.compiler-message .success',
    '.test-cases-success',
    '.congrats-wrapper',
    '.ui-icon-check', // often accompanies success states
  ];

  let hasSuccess = false;
  for (const selector of successSelectors) {
    const el = document.querySelector(selector);
    if (el) {
      const text = (el.parentElement?.textContent || el.textContent || '').toLowerCase();
      if (text.includes('congratulations') || text.includes('accepted') || text.includes('success')) {
        hasSuccess = true;
        break;
      }
    }
  }

  if (hasSuccess) {
     isProcessing = true;
     
     const editorData = await extractEditorData();
     const solutionCode = editorData.code;
     
     if (!solutionCode) {
        console.warn('[DSA Memory] Success detected but code could not be extracted. Retrying...');
        isProcessing = false;
        return; // Will be picked up by the next mutation once code is rendered
     }

     const platform = 'hackerrank';
     const url = getProblemUrl();
     const fingerprint = await generateLocalFingerprint(platform, url, solutionCode);

     if (processedFingerprints.has(fingerprint)) {
        // We've already captured this exact submission in this page session. Ignore repeated DOM mutations.
        isProcessing = false;
        return; 
     }

     console.log('[DSA Memory] Accepted state detected');
     processedFingerprints.add(fingerprint);

     const finalLanguage = editorData.language || getLanguage();

     console.log('[DSA Memory] Accepted submission detected.');
     
     const payload: ExtractedSubmissionPayload = {
        platform,
        title: getProblemTitle(),
        url,
        difficulty: getDifficulty(),
        language: finalLanguage,
        solutionCode,
        submittedAt: new Date().toISOString()
     };
     
     console.log('[DSA Memory] Problem detected:', payload.title);
     console.log('[DSA Memory] Sending submission to service worker');

     chrome.runtime.sendMessage({
        type: 'SUBMISSION_DETECTED',
        payload
     }, (response) => {
        // If the background request completely fails (not a duplicate, but network error), allow retry
        if (response && response.success === false && !response.duplicate) {
           processedFingerprints.delete(fingerprint);
        }
     });

     isProcessing = false;
  }
}

const observer = new MutationObserver(() => {
  checkSubmissionStatus();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log('[DSA Memory] MutationObserver initialized');
