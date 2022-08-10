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

    let emoji = ''
    if (mosueEventTypes.includes(eventType)) emoji = '🖱'
    else if (touchEventTypes.includes(eventType)) emoji = '👆'
    else if (pointerEventTypes.includes(eventType)) emoji = '🌀'

    // preventDefault しない
    eventElm.addEventListener(
      eventType,
      (event) => {
        log(false, emoji + ' ' + eventType, colorStr)
        logHR(false)
      },
      { passive: true },
    )

    // preventDefault する
    eventElmPD.addEventListener(
      eventType,
      (event) => {
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
        log(false, emoji + ' ' + eventType, colorStr)
        logHR(false)
        event.preventDefault()
        event.stopPropagation()
      },
      { passive: false },
    )

    // ドキュメント
    document.addEventListener(eventType, (event) => {
      log(true, emoji + ' ' + eventType, colorStr)
      logHR(true)
    })
  })

  createDeletableElm()
})

function createDeletableElm() {
  const elm = document.createElement('div')
  elm.classList.add('touch-area')
  elm.textContent = 'mousedown or touchstart で要素削除'

  allEventTypes.forEach((eventType, i) => {
    const colorStr = `hsl(${i * 20}, 100%, 80%)`

    let emoji = ''
    if (mosueEventTypes.includes(eventType)) emoji = '🖱'
    else if (touchEventTypes.includes(eventType)) emoji = '👆'
    else if (pointerEventTypes.includes(eventType)) emoji = '🌀'

    elm.addEventListener(
      eventType,
      (event) => {
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
let hrTimer

// 1秒後にログに罫線を追加する
function logHR(is_document) {
  clearTimeout(hrTimer)
  hrTimer = setTimeout(() => {
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

  // ログエリアに p 要素を追加
  const div = is_document ? log_area_d : log_area
  const p = document.createElement('p')
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
