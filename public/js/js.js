window.addEventListener("load", () => {
 
    populateTime()

    setupListeners()

    updateBackgroundColor()
})

function populateTime() {
    const timeDiv = document.querySelector("#time")
    requestAnimationFrame(() => {updateDateTime(timeDiv)});
}

function updateDateTime(div) {
    const now = new Date();
    const formatted = now.toLocaleString();
    div.textContent = formatted;
    requestAnimationFrame(() => {updateDateTime(div)});
}

function setupListeners() {
    const settingsDiv = document.querySelector("#settings")
    settingsDiv.addEventListener("click", () => {
        openSettingsDialog()
    })
}

function openSettingsDialog() {
    document.querySelector("#settings-dialog").classList.toggle("hidden")
}

function updateFontSize() {
    const textSelector = document.querySelector("#text-selector")
    if (textSelector.value == "large") {
        document.documentElement.style.fontSize = "1.5rem"
    }
    else if (textSelector.value == "medium") {
        document.documentElement.style.fontSize = "1rem"
    }
    else if (textSelector.value == "small") {
        document.documentElement.style.fontSize = ".66rem"
    }
}

function updateBackgroundColor() {
    const textSelector = document.querySelector("#color-selector")
    if (textSelector.value == "red") {
        document.querySelector("#main").style.backgroundColor = "rgba(230, 154, 154, 1)"
        document.querySelector("#side").style.backgroundColor = "rgba(185, 98, 98, 1)"
    }
    else if (textSelector.value == "blue") {
        document.querySelector("#main").style.backgroundColor = "rgba(143, 143, 204, 1)"
        document.querySelector("#side").style.backgroundColor = "rgba(84, 84, 172, 1)"
    }
    else if (textSelector.value == "green") {
        document.querySelector("#main").style.backgroundColor = "rgba(168, 212, 152, 1)"
        document.querySelector("#side").style.backgroundColor = "rgba(87, 161, 72, 1)"
    }
}