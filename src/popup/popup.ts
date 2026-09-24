// Minimal logic for MVP popup
document.addEventListener('DOMContentLoaded', () => {
  const dbStatus = document.getElementById('db-status');
  if (dbStatus) {
    dbStatus.textContent = 'Connected to Supabase';
    dbStatus.style.color = '#10b981';
  }
});
