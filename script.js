const buttonNew = document.querySelector(".new")
const buttonCancel = document.querySelector(".cancel")

const modal = document.querySelector(".modal-overlay")

const expenseDisplay = document.querySelector("#expenseDisplay")
const incomeDisplay = document.querySelector("#incomeDisplay")
const totalDisplay = document.querySelector("#totalDisplay")

const card = document.querySelector(".total")

const toggleModal = () => {
    modal.classList.toggle("active")
}
buttonCancel.addEventListener("click", toggleModal)
buttonNew.addEventListener("click", toggleModal)

const Card = {
    negative (){
        card.classList.add("negative")
    },
    positive () {
        card.classList.remove("negative")
    }
    
} 

const StorageInterface = {
    get(){
        return  JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: StorageInterface.get(),
    add(transaction){
        this.all.push(transaction)
        App.reload()
    },
    remove (index) {
        this.all.splice(index, 1)
        App.reload()
    },
    incomes() {
        let income = 0
        this.all.map(element => {if(element.amount > 0){income += element.amount}})
        return income
    },
    expenses() {
        let expense = 0
        this.all.map(element => {if(element.amount < 0){
            expense += element.amount
        }})
        return expense
    },
    total() {
        let total = 0
        total = this.incomes() + this.expenses()
        return total
    }
}

const DOM = {
    trasnsactionsConteiner : document.querySelector("#data-table tbody"),
    addTransaction (transaction, index) {
        const tr = document.createElement("tr")
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.trasnsactionsConteiner.appendChild(tr)

    },
    innerHTMLTransaction (transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"
        const amount = Utils.formatCurrency(transaction.amount)
        const html = `                       
            <td class="transaction-description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="transaction-date">${transaction.date}</td>
            <td>
                <a href="#" onclick="Transaction.remove(${index})"><img src="./assets/minus.svg" alt="Botão Excluir"></a>
            </td>`
        return html    
    },
    updateBalance () {
        incomeDisplay.innerHTML = Utils.formatCurrency(Transaction.incomes())
        expenseDisplay.innerHTML = Utils.formatCurrency(Transaction.expenses())
        if(Transaction.total() < 0 && !card.classList.contains("negative")){
            Card.negative()
        }else{
            Card.positive()
        }
        totalDisplay.innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransactions () {
        DOM.trasnsactionsConteiner.innerHTML = ""
    }
}

const Utils = {
    formatCurrency (value) {
        const signal = Number(value) < 0 ? "-" : ""
        value = String(value).replace(/\D/g, "")
        
        value = Number(value) / 100
        
        value = Number(value).toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL"
        })
        return ( signal + value )
    },
    formatAmount (value) {
        value = Number(value) * 100
        return Math.round(value)
    },
    formatDate(date){
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }

}

const Form = {
    description: document.querySelector("#description"),
    amount: document.querySelector("#amount"),
    date: document.querySelector("#date"),

    getValues () {
        return {
            description : this.description.value,
            amount : this.amount.value,
            date : this.date.value
        }
    },
    validateFields () {
        const { amount, date, description } = this.getValues()
        if (description.trim() === "" || date.trim() === "" || amount.trim() === ""){
            throw new Error ("Por favor preencha todos os campos")
        }
    },
    formatData () {
        let { amount, date, description } = this.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        return {
            description, 
            amount,
            date
        }
    },
    saveTransaction (data) {
        Transaction.add(data)
    },
    clearFields () {
        this.description.value = ""
        this.amount.value= ""
        this.date.value = ""
    },
    submit(event){
        event.preventDefault()
        try {
            this.validateFields()
            const data = this.formatData()
            this.clearFields()
            this.saveTransaction(data)
            toggleModal() 
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init () {
        Transaction.all.map((element, index) => DOM.addTransaction(element, index))
        DOM.updateBalance()

        StorageInterface.set(Transaction.all)
    },
    reload () {
        DOM.clearTransactions()

        App.init()
    }
}


App.init()
