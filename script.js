// Buttons Import
const buttonNew = document.querySelector(".new")
const buttonCancel = document.querySelector(".cancel")

//Modal Overlay Import
const modal = document.querySelector(".modal-overlay")

//Modal Function Declaration
const Modal = {
    open() {
        console.log("open")
        modal.classList.add("active")
    },
    close() {
        console.log("close")
        modal.classList.remove("active")
    }
}
buttonCancel.addEventListener("click", Modal.close)
buttonNew.addEventListener("click", Modal.open)

//=================================================================================

