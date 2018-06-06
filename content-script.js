/**
 * Content Script
 */

const ZOOM_URL_REGEX = /https:\/\/zoom\.us\/j\/[0-9]{9}/g

const isHidden = (el) => el && el.offsetParent === null

const getElement = (selector) => {
  const el = document.querySelector(selector)
  return isHidden(el) ? null : el
}

const getScheduleButton = () => getElement('#zoom_schedule_button')
const getJoinButton = () => getElement('#zoom_schedule_meeting_url')
const getDescriptionBox = () => getElement('[aria-label=Description]')

const waitForScheduleButton = (options = {}) => {
  return new Promise((resolve, reject) => {
    const timeout = options.timeout || 10000
    const interval = options.interval || 50
    const start = new Date()
    const exists = () => {
      if ((new Date() - start) > timeout) {
        return reject()
      }
      const button = getScheduleButton()
      if (button == null) {
        return setTimeout(exists, interval)
      }
      resolve(button)
    }
    exists()
  })
}

const getDescription = () => getDescriptionBox().textContent

const main = async () => {
  let scheduleButton
  try {
    scheduleButton = await waitForScheduleButton()
  } catch (err) {
    if (getJoinButton()) {
      console.log('Zoom info already added')
    } else {
      console.error('Timed out trying to find Zoom schedule button')
    }
    return
  }

  const currentDescription = getDescription()
  if (ZOOM_URL_REGEX.test(currentDescription)) {
    console.log('Zoom info already added')
    return
  }

  scheduleButton.click()
}

// Listen for messages sent from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'NEW_EVENT') {
    main()
  }
})
