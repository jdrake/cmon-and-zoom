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
const getDescriptionBox = () => getElement('[aria-label="Description"]')
const getTitleBox = () => getElement('[aria-label="Title"]')

const waitUntil = (condition, options = {}) => {
  return new Promise((resolve, reject) => {
    const timeout = options.timeout || 10000
    const interval = options.interval || 50
    const start = new Date()
    const wait = () => {
      if ((new Date() - start) > timeout) {
        return reject()
      }
      const result = condition()
      if (result) {
        return resolve(result)
      }
      setTimeout(wait, interval)
    }
    wait()
  })
}

const getDescription = () => {
  const el = getDescriptionBox()
  return el && el.textContent
}

const titleIsDefault = () => {
  const el = getTitleBox()
  return el && /Zoom Meeting/.test(el.value)
}

const clearDefaultTitleAndFocus = () => {
  if (titleIsDefault()) {
    const el = getTitleBox()
    el.value = ''
    el.focus()
  }
}

const zoomInfoExists = () => ZOOM_URL_REGEX.test(getDescription())

const __main = async () => {
  if (zoomInfoExists()) {
    console.log('Zoom info already added')
    return
  }

  console.log('Try to add Zoom info...')
  try {
    await waitUntil(() => !!getScheduleButton())
  } catch (err) {
    if (getJoinButton()) {
      console.log('Zoom info already added')
    } else {
      console.error('Timed out trying to find Zoom schedule button')
    }
    return
  }

  if (zoomInfoExists()) {
    console.log('Zoom info already added')
    return
  }
  getScheduleButton().click()

  try {
    await waitUntil(() => titleIsDefault())
    clearDefaultTitleAndFocus()
  } catch (err) {
    console.log('Event title was already set')
  }

  console.log('Complete')
}

const locks = {}
const lock = (key, fn) => {
  return () => {
    if (locks[key]) return
    locks[key] = true
    try {
      fn()
    } catch (err) {
      console.error(err)
    } finally {
      locks[key] = false
    }
  }
}
const main = lock('main', __main)

// Listen for messages sent from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'NEW_EVENT') {
    console.log('NEW_EVENT', request)
    main()
  }
})

if (location.pathname === '/calendar/r/eventedit') {
  console.log('Main thread')
  main()
}
