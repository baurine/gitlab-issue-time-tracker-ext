function showMessage(msg) {
  // alert(msg)
  document.getElementById("flash").innerText = msg
}

let option_key = "available_hosts"
let available_hosts = []

function main() {
  handleAddHost()
  loadHosts()
}

function handleAddHost() {
  let host_input = document.getElementById("new_host")
  document.getElementById("add_host").onclick = function() {
    var host = host_input.value.trim()
    if (!host) {
      showMessage("Host can't be empty")
      return
    }
    if (!/^https?:\/\//.test(host)) {
      showMessage("Host should start with http:// or https://")
      return
    }
    if (available_hosts.includes(host)) {
      showMessage("Host is aleady available")
      return
    }
    host_input.value = ""
    available_hosts.push(host)
    let obj = {}
    obj[option_key] = available_hosts
    chrome.storage.local.set(obj, function() {
      showMessage(`Add host ${host}`)
    })
  }
}

function loadHosts() {
  chrome.storage.local.get(option_key, function(obj) {
    available_hosts = obj[option_key] || []
    showHosts()
  })
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
      if (key === option_key) {
        available_hosts = changes[option_key].newValue || []
        showHosts()
        break
      }
    }
  })
}

function showHosts() {
  let hostsListContainer = document.getElementById("available_hosts")
  hostsListContainer.innerHTML = ""

  available_hosts.forEach(item => {
    let cell = document.createElement("li")
    cell.innerHTML = `<span>${item}&nbsp;&nbsp;</span>`

    let btn = document.createElement("button")
    btn.innerText = "x"
    btn.onclick = function() {
      let ret = confirm(`Are you sure want to delete ${item}`)
      if (ret) {
        available_hosts = available_hosts.filter(host => host !== item)
        let obj = {}
        obj[option_key] = available_hosts
        chrome.storage.local.set(obj, function() {
          showMessage(`Remove host ${item}`)
        })
      }
    }
    cell.appendChild(btn)

    hostsListContainer.appendChild(cell)
  })
}

///////////////////////////////////////////
main()
