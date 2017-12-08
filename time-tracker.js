////////////////////////////////////////////////////////////////////
// utils
function log(msg) {
  console.log("Time-tracker extension:", msg)
}

function formatDate(date) {
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  if (month < 10) {
    month = `0${month}`
  }
  let day = date.getDate()
  if (day < 10) {
    day = `0${day}`
  }
  let hours = date.getHours()
  if (hours < 10) {
    hours = `0${hour}`
  }
  let mins = date.getMinutes()
  if (mins < 10) {
    mins = `0${mins}`
  }
  let secs = date.getSeconds()
  if (secs < 10) {
    secs = `0${secs}`
  }
  return `${year}-${month}-${day} ${hours}:${mins}:${secs}`
}
// log(formatDate(new Date()))

////////////////////////////////////////////////////////////////////
let issue_key = ''
let issue_time_statistics = []

function main() {
  log("load")

  // document.location.[href|origin|host|hostname|protocol|pathname|hash|port]
  let origin = document.location.origin
  // TODO: make it configurable
  if (origin !== "https://gitlab.ekohe.com") {
    log('mis match origin')
    return
  }
  let pathname = document.location.pathname
  if (!/\/issues\/\d+/.test(pathname)) {
    log('mis match pathname')
    return
  }

  let host = document.location.host
  issue_key = (host + pathname).replace(/\/|\./g, '_')
  log(issue_key)

  loadTimeStatis()
}

function loadTimeStatis() {
  chrome.storage.local.get(issue_key, function(obj) {
    issue_time_statistics = obj[issue_key] || []
    showTimeView()
  })
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
      if (key === issue_key) {
        log("values changed")
        issue_time_statistics = changes[issue_key].newValue || []
        log(issue_time_statistics)
        showTimeView()
        break
      }
    }
  })
}

function showTimeView() {
  // remove at first if exists
  let timeTrackerContainer = document.querySelector("#gitt-container")
  if (timeTrackerContainer) {
    timeTrackerContainer.remove()
  }

  // add it back
  timeTrackerContainer = document.createElement("div")
  timeTrackerContainer.id = "gitt-container"

  let btnContent = "Start"
  let lastTime = issue_time_statistics[issue_time_statistics.length-1]
  if (lastTime && lastTime.to === undefined) {
    btnContent = "Stop"
  }

  // control btn
  let controllBtn = document.createElement("button")
  controllBtn.innerText = btnContent
  controllBtn.onclick = controlBtnClick
  timeTrackerContainer.appendChild(controllBtn)

  // clear btn
  let clearBtn = document.createElement("button")
  clearBtn.innerText = "Clear"
  clearBtn.onclick = function() {
    chrome.storage.local.clear()
  }
  timeTrackerContainer.appendChild(clearBtn)

  timeTrackerContainer.appendChild(genTimeList())

  let notesContainer = document.querySelector("#notes")
  notesContainer.insertBefore(timeTrackerContainer, notesContainer.lastChild)
}

function controlBtnClick(event) {
  let lastTime = issue_time_statistics[issue_time_statistics.length-1]
  if (lastTime && lastTime.to === undefined) {
    // click stop
    lastTime.to = Date()
  } else {
    // click start
    lastTime = { from: Date() }
    issue_time_statistics.push(lastTime)
  }

  let obj = {}
  obj[issue_key] = issue_time_statistics
  chrome.storage.local.set(obj, function() {
    log("saved")
  })
}

function genTimeList() {
  let timeListContainer = document.createElement("ul")
  issue_time_statistics.forEach(item => {
    let cell = document.createElement("li")
    cell.innerHTML = `<p>from: ${item.from}; to: ${item.to}</p>`
    timeListContainer.appendChild(cell)
  })
  return timeListContainer
}

/////////////////////////////////////////////

main()
