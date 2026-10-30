import { useState } from 'react'


interface Bill {
  id: string
  amount: number
  note: string
}


function App() {
  //const [total, setTotal] = useState(0)
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [bills, setBills] = useState<Bill[]>([])
  const total = bills.reduce((acumulado, bill) => acumulado + bill.amount, 0)


  function addBill() {
    const num = Number(amount)

    if (isNaN(num) || num <= 0) return
    
    const newBill: Bill = {
      id: crypto.randomUUID(),
      amount: num,
      note: note
    }

    setBills((prev) => [...prev, newBill])

    setAmount('')
    setNote('')
  }

  function deleteBill(id: string) {

    setBills((prev) => prev.filter((bill) => bill.id !== id))
  }

  return (
    <>
      <section>
        <div>
          <h1>Mis Gastos</h1>
          <p>Total gastado: {total}€</p>
        </div>
      </section>
      <section>
        <div>
          <h2>Nuevo gasto</h2>
          <label htmlFor="amount">Importe:</label>
          <input id="amount" value={amount} min="0.01" step="0.01" type="number" onChange={(e) => setAmount(e.target.value)}/>
          <label htmlFor="note">Nota:</label>
          <input id="note" value={note} onChange={(e) => setNote(e.target.value)}/>
        </div>    
        <button type="button" onClick={addBill}>
          Añadir
        </button>
        <p>Gastos: </p>
        <ul>
          {bills.map((g) => (
            <li key={g.id}>{g.note}: {g.amount} €
            <button type="button" onClick={() => deleteBill(g.id)}>Borrar</button>
            </li> 
          ))}
        </ul>
      </section>
    </>
  )
}

export default App
