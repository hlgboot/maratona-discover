const changeThemeSwitch = document.querySelector("#themeSwitch")
const html = document.querySelector("html")

const gitIcon = document.querySelector(".git-icon")
const changeIcons = (theme) => {
    theme ? gitIcon.src = "assets/githubLight.png" : gitIcon.src = "assets/github.png"  
}

const trans = () => {
    document.documentElement.classList.add('transition');
    window.setTimeout(() => {
        document.documentElement.classList.remove('transition')
    }, 1000)
}

const darkMode = (theme) => {
    trans()
    changeIcons(theme)
    html.classList.add(theme)
    localStorage.setItem("theme", JSON.stringify(theme))
}
const lightMode = () => {
    trans()
    changeIcons()
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