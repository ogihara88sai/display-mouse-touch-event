// 観測するマウスイベントタイプおよびホイールイベントタイプ
const mosueEventTypes = [
  'click',
  'mousedown',
  'mousemove',
  'mouseup',
  'dblclick',
  'auxclick',
  'contextmenu',
  'mouseenter',
  'mouseleave',
  'mouseover',
  'mouseout',
  'wheel',
  'mousewheel',
]

// 観測するタッチイベントタイプ
const touchEventTypes = ['touchstart', 'touchmove', 'touchend', 'touchcancel']

// 観測するポインターイベントタイプ
const pointerEventTypes = [
  'pointerdown',
  'pointermove',
  'pointerup',
  'pointercancel',
  'pointerenter',
  'pointerleave',
  'pointerover',
  'pointerout',
]

// 観測するすべてのイベントタイプ
const allEventTypes = mosueEventTypes
  .concat(touchEventTypes)
  .concat(pointerEventTypes)

const currentLogConfig = {
  mouse: true,
  touch: true,
  pointer: true,
}

const emojiMap = {
  mouse: '🖱',
  touch: '👆',
  pointer: '🌀',
}

// Element 参照用の変数
let eventElm
let eventElmPD
let eventElmPDSP
let eventElmDummy
let log_area
let log_area_d

// ドキュメント読み込み完了時
window.addEventListener('DOMContentLoaded', () => {
  // 参照
  eventElm = document.querySelector('#event_area')
  eventElmPD = document.querySelector('#event_area_pd')
  eventElmPDSP = document.querySelector('#event_area_pdsp')
  eventElmDummy = document.querySelector('#dummy_area')
  log_area = document.querySelector('#log_area')
  log_area_d = document.querySelector('#log_area_d')

  // ユーザ環境表示
  document.querySelector('#user_agent').textContent = navigator.userAgent

  // イベントリスナセット
  allEventTypes.forEach((eventType, i) => {
    const colorStr = `hsl(${i * 20}, 100%, 80%)`

    let parentEventType = ''
    if (mosueEventTypes.includes(eventType)) parentEventType = 'mouse'
    else if (touchEventTypes.includes(eventType)) parentEventType = 'touch'
    else if (pointerEventTypes.includes(eventType)) parentEventType = 'pointer'

    const emoji = emojiMap[parentEventType] || ''

    // preventDefault しない
    eventElm.addEventListener(
      eventType,
      (event) => {
        if (!currentLogConfig[parentEventType]) return
        log(false, emoji + ' ' + eventType, colorStr)
        logHR(false)
      },
      { passive: true },
    )

    // preventDefault する
    eventElmPD.addEventListener(
      eventType,
      (event) => {
        if (!currentLogConfig[parentEventType]) return
        log(false, emoji + ' ' + eventType, colorStr)
        logHR(false)
        event.preventDefault()
      },
      { passive: false },
    )

    // preventDefault, stopPropagation する
    eventElmPDSP.addEventListener(
      eventType,
      (event) => {
        if (!currentLogConfig[parentEventType]) return
        log(false, emoji + ' ' + eventType, colorStr)
        logHR(false)
        event.preventDefault()
        event.stopPropagation()
      },
      { passive: false },
    )

    // ドキュメント
    document.addEventListener(eventType, (event) => {
      if (!currentLogConfig[parentEventType]) return
      log(true, emoji + ' ' + eventType, colorStr)
      logHR(true)
    })
  })

  createDeletableElm()

  const urlQueries = getUrlQueries()
  let field
  if (urlQueries.field) {
    field = {
      mouse: false,
      touch: false,
      pointer: false,
    }
    urlQueries.field.split('+').forEach((item) => {
      field[item] = true
    })
  } else {
    field = {
      mouse: true,
      touch: true,
      pointer: true,
    }
  }

  const checkboxes = document.querySelectorAll('input[type=checkbox]')
  checkboxes.forEach((checkbox) => {
    const eventType = checkbox.getAttribute('data-event-type')
    checkbox.addEventListener('change', () => {
      currentLogConfig[eventType] = checkbox.checked
      let fieldQueryStrs = []
      for (const key in currentLogConfig) {
        if (currentLogConfig[key]) {
          fieldQueryStrs.push(key)
        }
      }
      if (fieldQueryStrs.length === 0) {
        fieldQueryStrs.push('null')
      }
      const fieldQueryStr = fieldQueryStrs.join('+')
      history.replaceState('', '', '?field=' + fieldQueryStr)
    })
    checkbox.checked = currentLogConfig[eventType] = field[eventType]
  })
})

function createDeletableElm() {
  const elm = document.createElement('div')
  elm.classList.add('touch-area')
  elm.textContent = 'mousedown or touchstart で要素削除'

  allEventTypes.forEach((eventType, i) => {
    const colorStr = `hsl(${i * 20}, 100%, 80%)`

    let parentEventType = ''
    if (mosueEventTypes.includes(eventType)) parentEventType = 'mouse'
    else if (touchEventTypes.includes(eventType)) parentEventType = 'touch'
    else if (pointerEventTypes.includes(eventType)) parentEventType = 'pointer'

    const emoji = emojiMap[parentEventType] || ''

    elm.addEventListener(
      eventType,
      (event) => {
        if (!currentLogConfig[parentEventType]) return
        log(false, emoji + ' ' + eventType, colorStr)
        logHR(false)
      },
      { passive: true },
    )
  })

  const deletableEventTypes = ['touchstart', 'mousedown']
  deletableEventTypes.forEach((eventType) => {
    elm.addEventListener(
      eventType,
      () => {
        eventElmDummy.style.setProperty('display', 'block')
        elm.remove()
        setTimeout(() => {
          createDeletableElm()
        }, 1000)
      },
      { passive: true },
    )
  })

  document.querySelector('#touch_area_wrapper').append(elm)
  eventElmDummy.style.setProperty('display', 'none')
}

// 1秒後にログに罫線を追加するための setTimeout, clearTimeout の管理用の変数
const hrTimers = [null, null]

// 1秒後にログに罫線を追加する
function logHR(is_document) {
  const index = is_document ? 0 : 1
  clearTimeout(hrTimers[index])
  hrTimers[index] = setTimeout(() => {
    log(is_document, '-------')
  }, 1000)
}

// ログを追加
function log(is_document, text, colorStyle = '#ddd') {
  // コンソールにログを出す
  const console_text = is_document ? `%c${text} on document` : `%c${text}`
  console.log(
    console_text,
    `background: #000; padding: 4px;color: ${colorStyle}`,
  )

  const div = is_document ? log_area_d : log_area
  let shouldCreateNewP = true
  const pArray = div.querySelectorAll('p')
  const last2p = Array.prototype.slice.call(pArray, -2).reverse()
  for (const p of last2p) {
    const thisEventType = p.getAttribute('data-event-type')
    if (text === thisEventType) {
      const count = parseInt(p.getAttribute('data-count')) || 1
      const newCount = count + 1
      p.setAttribute('data-count', newCount)
      p.innerHTML = `${thisEventType}<span class="count">${newCount}</span>`
      shouldCreateNewP = false
      break
    }
  }

  if (shouldCreateNewP) {
    const p = document.createElement('p')
    p.setAttribute('data-event-type', text)
    p.textContent = text
    p.style.setProperty('color', colorStyle)
    p.style.color = colorStyle
    div.append(p)

    // 一番下までスクロール
    div.scrollTo(0, 99999999)

    // 新しい 100 件のみを残す
    const pArray = div.querySelectorAll('p')
    const maxCount = 100
    for (let i = 0; i < pArray.length - maxCount; i++) {
      pArray[i].remove()
    }
  }
}

function getUrlQueries() {
  const queryStr = window.location.search.slice(1)
  queries = {}
  if (!queryStr) {
    return queries
  }
  queryStr.split('&').forEach(function (queryStr) {
    const queryArr = queryStr.split('=')
    queries[queryArr[0]] = queryArr[1]
  })
  return queries
}
