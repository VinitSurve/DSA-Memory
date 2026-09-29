// Minimal logic for MVP popup
document.addEventListener('DOMContentLoaded', () => {
  const dbStatus = document.getElementById('db-status');
  if (dbStatus) {
    dbStatus.textContent = 'Connected to Supabase';
    dbStatus.style.color = '#10b981';
  }

  // Load last captured submission
  chrome.storage.local.get(['lastSubmission'], (result) => {
    if (result.lastSubmission) {
      const card = document.getElementById('last-submission-card');
      const title = document.getElementById('last-submission-title');
      const time = document.getElementById('last-submission-time');
      
      if (card && title && time) {
        card.style.display = 'block';
        title.textContent = result.lastSubmission.title;
        
        const date = new Date(result.lastSubmission.time);
        let timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        if (result.lastSubmission.duplicate) {
          time.textContent = `Already captured (${timeStr})`;
        } else {
          time.textContent = `Captured today at ${timeStr}`;
        }
      }
    }
  });
});
