window.addEventListener('message', (event) => {
  if (event.source !== window || !event.data || event.data.type !== 'DSA_MEMORY_GET_EDITOR') {
    return;
  }

  const requestId = event.data.requestId;
  if (!requestId) return;

  const result: any = {
    type: 'DSA_MEMORY_MONACO_RESULT',
    requestId,
    success: false,
    code: '',
    languageId: '',
    source: '',
    reason: 'MONACO_UNAVAILABLE_FALLBACK_TO_DOM'
  };

  // We have empirically determined that HackerRank obfuscates Monaco.
  // We return immediately to trigger the DOM fallback.
  window.postMessage(result, '*');
});
