const changeThemeSwitch = document.querySelector("#themeSwitch")
const html = document.querySelector("html")

const trans = () => {
    document.documentElement.classList.add('transition');
    window.setTimeout(() => {
        document.documentElement.classList.remove('transition')
    }, 1000)
}

const darkMode = (theme) => {
    trans()
    html.classList.add(theme)
    localStorage.setItem("theme", JSON.stringify(theme))
}
const lightMode = () => {
    trans()
    html.classList.remove("dark-theme")
    localStorage.setItem("theme", null)
}
const getIntoStorge = () => {
    return JSON.parse(localStorage.getItem("theme"))
}

const Theme = {
    toggleTheme () {
        getIntoStorge() === null ? darkMode("dark-theme") : lightMode()
    }
}

getIntoStorge() === "dark-theme" ? darkMode("dark-theme") : lightMode()

changeThemeSwitch.addEventListener("change", Theme.toggleTheme)