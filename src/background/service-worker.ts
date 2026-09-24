import { ExtensionMessage } from '../shared/types';
import { saveSubmission } from '../services/submission-service';

chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  if (message.type === 'SUBMISSION_DETECTED') {
    console.log('[DSA Memory] Received submission from content script:', message.payload);
    
    // Process asynchronously and keep message channel open
    saveSubmission(message.payload).then(result => {
      sendResponse(result);
      
      if (result.success) {
        if (!result.duplicate) {
          // Could optionally send a message back to the tab to show a success toast
          chrome.tabs.sendMessage(sender.tab!.id!, { type: 'SHOW_TOAST', payload: { message: '✓ Saved to DSA Memory', subtext: `${message.payload.title} (${message.payload.platform})` } }).catch(() => {});
        } else {
          chrome.tabs.sendMessage(sender.tab!.id!, { type: 'SHOW_TOAST', payload: { message: 'Already saved' } }).catch(() => {});
        }
      } else {
        chrome.tabs.sendMessage(sender.tab!.id!, { type: 'SHOW_TOAST', payload: { message: 'Couldn\'t capture this submission. See extension logs.' } }).catch(() => {});
      }
    });
    
    return true; // Indicates async response
  }
});
