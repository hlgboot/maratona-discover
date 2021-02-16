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
const editModal = document.querySelector("#editTransactionModal")

const expenseDisplay = document.querySelector("#expenseDisplay")
const incomeDisplay = document.querySelector("#incomeDisplay")
const totalDisplay = document.querySelector("#totalDisplay")

const card = document.querySelector(".total")

const toggles = {
    toggleModal () {
        transactionModal.classList.toggle("active")
    },
    toggleFilterModal () {
        filterModal.classList.toggle("active")
    },
    toogleEditModal () {
        editModal.classList.toggle("active")
    },
    toggleFilterTypeOption (type) {
        const desactiveTypes = filterTypeOptions.filter(element => element !== type)
        desactiveTypes.map(e => e.classList.remove("activated"))
        type.classList.add("activated")
    }
}

buttonCancel.addEventListener("click", toggles.toggleModal)
buttonNew.addEventListener("click", toggles.toggleModal)

filterCancel.addEventListener("click", toggles.toggleFilterModal)
filterButton.addEventListener("click", toggles.toggleFilterModal)

filterTypeOptions.map(e => e.addEventListener("click", e => {toggles.toggleFilterTypeOption(e.target)}))

const Card = {
    negative (){
        card.classList.add("negative")
    },
    positive () {
        card.classList.remove("negative")
    }
    
} 

const deafultDataFilter = {
    type: 'filterAll',
    initialDate: '',
    finishDate: ''
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
    },
    getDataType () {
        return JSON.parse(localStorage.getItem("dataFilter")) || deafultDataFilter
    },
    setDataType (data) {
        localStorage.setItem("dataFilter", JSON.stringify(data))
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
    update (data) {
        const index = Transaction.all.findIndex(element => element.id === data.id)
        Transaction.all[index] = data
        App.reload()
    },
    incomes(data) {
        let income = 0
        data.map(element => {if(element.amount > 0){income += element.amount}})
        return income
    },
    expenses(data) {
        let expense = 0
        data.map(element => {if(element.amount < 0){
            expense += element.amount
        }})
        return expense
    },
    total(data) {
        let total = 0
        total = (this.incomes(data)) + (this.expenses(data))
        return total
    }
}

const DOM = {
    trasnsactionsConteiner : document.querySelector("#data-table tbody"),
    filterDisplay: document.querySelector(".filterDisplay"),
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
                <a href="#" onclick="Edit.setModal(${transaction.id})"><img src="./assets/editIcon.svg" alt="Botão  Editar"></a>
            </td>
            <td>
                <a href="#" onclick="Transaction.remove(${transaction.id})"><img src="./assets/minus.svg" alt="Botão Excluir"></a>
            </td>`
        return html    
    },
    addFilter () {
        const divElement = document.createElement("div")
        divElement.setAttribute("class", "filterContent")
        const data = DOM.innerHTMLFilter()
        divElement.innerHTML = data
        
        DOM.filterDisplay.appendChild(divElement)
    },
    innerHTMLFilter () {
        const html = `
         <small>
            Filter
        </small>
        <a href="#" onclick="Filter.setNull()"><img src="./assets/filterDesactive.svg" alt=""></a>
        `
        return html
    },
    removeFilter () {
        DOM.filterDisplay.innerHTML = ""
    },
    updateBalance (data) {
        incomeDisplay.innerHTML = Utils.formatCurrency(Transaction.incomes(data))
        expenseDisplay.innerHTML = Utils.formatCurrency(Transaction.expenses(data))
        if(Transaction.total(data) < 0 && !card.classList.contains("negative")){
            Card.negative()
        }else{
            Card.positive()
        }
        totalDisplay.innerHTML = Utils.formatCurrency(Transaction.total(data))
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
    },
    unformatAmount (value) {
        return Math.round(value/100)
    },
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
            toggles.toggleModal() 
        } catch (error) {
            alert(error.message)
        }
    }
}

const Filter = {
    initialDate () { return document.querySelector("#initial-date").value },
    finishDate () { return document.querySelector("#finish-date").value },
    currentType () { return document.querySelector(".activated").attributes.id.value },

    setNull () {
        StorageInterface.setDataType(deafultDataFilter)
        DOM.removeFilter()
        App.reload()
    },
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
        filtered.sort((a, b) => a.date > b.date)
        return filtered
    },
    filterTransactions () {
        const data = StorageInterface.getDataType()
        if(JSON.stringify(data) !== JSON.stringify(deafultDataFilter)){
            DOM.removeFilter()
            DOM.addFilter()
        }else {
            DOM.removeFilter()
        }
        let filtered = this.filterType(data.type)
        filtered = this.filterDate(filtered, data.initialDate, data.finishDate)

        return filtered
    },
    newFilterData () {
        const data = {
            type: Filter.currentType(),
            initialDate: Filter.initialDate(),
            finishDate: Filter.finishDate()
        }

        return data
    },
    submit (event) {
        event.preventDefault()
        try {
            const data =this.newFilterData()
            StorageInterface.setDataType(data)
            App.reload()

            toggles.toggleFilterModal()
        } catch (error) {
            alert(error.message)
        }
    },
}

const Edit = {
    description: document.querySelector("#editDescription"),
    amount: document.querySelector("#editAmount"),
    date: document.querySelector("#editDate"),
    saveEditButton: document.querySelector("#saveEdit"),
    setModal (id) {
        const transaction = Transaction.all.filter(element => element.id === id)[0]
        this.description.value = transaction.description
        this.amount.value = Utils.unformatAmount(transaction.amount)
        this.date.value = Utils.unformatDate(transaction.date)

        toggles.toogleEditModal()
        this.saveEditButton.addEventListener("click", e => {
            Edit.submit(id)
        })
    },
    submit (id) {
        const { description, amount, date} = Edit
        const data = {
            id,
            description: description.value,
            amount: Utils.formatAmount(amount.value),
            date: Utils.formatDate(date.value)
        }
        Transaction.update(data)
        this.saveEditButton.removeEventListener("click", e => {
            Edit.submit(id)
        })
        toggles.toogleEditModal()
    },
}

const Download = {
    filterExercise () {
        const dataFilter = StorageInterface.getDataType()
        const data = Filter.filterDate(Transaction.all, dataFilter.initialDate, dataFilter.finishDate)
        return {
            transactions: data,
            initialDate: dataFilter.initialDate,
            finishDate: dataFilter.finishDate
        }
    },
    getContent () {
        const data = Download.filterExercise()
        if (JSON.stringify(data.transactions) === JSON.stringify([])) { throw new Error("Nenhuma transação foi adicionada")}
        if (data.initialDate === "") { data.initialDate = data.transactions[0].date}
        if (data.finishDate === "") { data.finishDate = data.transactions[data.transactions.length -1].date}
        let content = ""

        content += `Extrato, ${data.initialDate}, ${data.finishDate},\n\n`
        content += `Entradas, "${Utils.formatCurrency(Transaction.incomes(data.transactions))}",\n`
        content += `Saídas, "${Utils.formatCurrency(Transaction.expenses(data.transactions))}",\n`
        content += `Total, "${Utils.formatCurrency(Transaction.total(data.transactions))}",\n\n`
        content += `Descrição, Data, Valor, \n`

        data.transactions.map(e => {
            const row = `${e.description}, ${e.date}, "${Utils.formatCurrency(e.amount)}"`
            content += row + "," + "\n"
        })
        return content
    },
    generateFile () {
        try {
            const data = Download.getContent()
            const blob = new Blob ([data], {
                type: "aplication/csv"
            })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            link.setAttribute("download", "devExtract.csv")
            
            document.body.appendChild(link);
            link.click()
            document.body.removeChild(link)            
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init () {
        StorageInterface.set(Transaction.all)

        const data = App.runFilter()
        data.map((element, index) => DOM.addTransaction(element, index))

        DOM.updateBalance(data)

    },
    reload () {
        DOM.clearTransactions()

        App.init()
    },
    runFilter () {
        const data = Filter.filterTransactions()
        return data
    },

}

App.init()
