/**
 * Background Page
 */

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.url === 'https://calendar.google.com/calendar/r/eventedit') {
    chrome.tabs.sendMessage(details.tabId, {
      message: 'NEW_EVENT'
    })
  }
})
