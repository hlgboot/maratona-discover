const buttonNew = document.querySelector(".new")
const buttonCancel = document.querySelector("#transactionCancel")

const filterCancel = document.querySelector("#filterCancel")
const filterButton = document.querySelector("#filter")

const filterAllOption = document.querySelector("#filterAll")
const filterIncomeOption = document.querySelector("#filterIncome")
const filterExpenseOption = document.querySelector("#filterExpense")

const filterTypeOptions = [filterIncomeOption, filterAllOption, filterExpenseOption]

const transactionModal = document.querySelector("#newTransactionModal")
const filterModal = document.querySelector("#filterModal")

const expenseDisplay = document.querySelector("#expenseDisplay")
const incomeDisplay = document.querySelector("#incomeDisplay")
const totalDisplay = document.querySelector("#totalDisplay")

const card = document.querySelector(".total")

const toggleModal = () => {
    transactionModal.classList.toggle("active")
}
buttonCancel.addEventListener("click", toggleModal)
buttonNew.addEventListener("click", toggleModal)

const toggleFilterModal = () => {
    filterModal.classList.toggle("active")
}
filterCancel.addEventListener("click", toggleFilterModal)
filterButton.addEventListener("click", toggleFilterModal)

const toggleFilterTypeOption = (type) => {
    const desactiveTypes = filterTypeOptions.filter(element => element !== type)
    desactiveTypes.map(e => e.classList.remove("activated"))
    type.classList.add("activated")
}
filterTypeOptions.map(e => e.addEventListener("click", e => {toggleFilterTypeOption(e.target)}))

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
    },
    getLastId () {
        return JSON.parse(localStorage.getItem("lastID")) || 0
    },
    setLastId (id) {
        localStorage.setItem("lastID", JSON.stringify(id))
    }
}

const idInterface = {
    lastId : StorageInterface.getLastId,
    generate () {
        const newId = this.lastId() + 1
        StorageInterface.setLastId(newId)
        return newId
    },
}

const Transaction = {
    all: StorageInterface.get(),
    add(transaction){
        this.all.push(transaction)
        App.reload()
    },
    remove (index) {
        this.all = this.all.filter(element => element.id !== index)
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
                <a href="#" onclick="Transaction.remove(${transaction.id})"><img src="./assets/minus.svg" alt="Botão Excluir"></a>
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
    },
    unformatDate (date) {
        const splittedDate = date.split("/")
        return `${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`
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
        const id = idInterface.generate() 
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        return {
            id,
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

const Filter = {
    initialDate () { return document.querySelector("#initial-date").value },
    finishDate () { return document.querySelector("#finish-date").value },
    currentType () { return document.querySelector(".activated").attributes.id.value },

    filterType (type) {
        let filteredType = []
        if (type === "filterIncome"){
            filteredType = Transaction.all.filter(element => element.amount > 0)
        } else if (type === "filterExpense"){
            filteredType = Transaction.all.filter(element => element.amount < 0 )
        } else if (type === "filterAll") {
            filteredType = Transaction.all
        }
        return filteredType
    },
    filterDate (filtered, initialDate, finishDate){
        if (initialDate) {        
            filtered = filtered.filter(element => Utils.unformatDate(element.date) >= initialDate)
        }
        if (finishDate) {
            filtered = filtered.filter(element => Utils.unformatDate(element.date) <= finishDate)
        }
        return filtered
    },
    clearFilterFields () {
        console.log("cheguei aqui")
        document.querySelector("#initial-date").value = ""
        document.querySelector("#finish-date").value = ""
        toggleFilterTypeOption(filterAllOption)
        
    },
    filterTransactions () {
        const { initialDate, finishDate } = Filter
        //StorageInterface.setFilter({type, date})
        let filtered = this.filterType(Filter.currentType())
        filtered = this.filterDate(filtered, initialDate(), finishDate())
        return filtered
    },
    submit (event) {
        event.preventDefault()
        try {
            const data =this.filterTransactions()
            this.clearFilterFields()
            toggleFilterModal()
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
