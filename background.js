/**
 * Background Page
 */

chrome.runtime.onInstalled.addListener(() => {
  if (chrome.declarativeContent == null) {
    return
  }
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'calendar.google.com' },
          })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }
    ])
  })
})

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.url === 'https://calendar.google.com/calendar/r/eventedit' &&
      details.transitionQualifiers != null &&
      !details.transitionQualifiers.length
  ) {
    chrome.tabs.sendMessage(details.tabId, {
      message: 'NEW_EVENT',
      data: details
    })
  }
})
