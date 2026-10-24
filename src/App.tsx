import { useState } from 'react'


interface Bills {
  id: string
  amount: number
  note: string
}


function App() {
  //const [total, setTotal] = useState(0)
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [bills, setBills] = useState<Bills[]>([])
  const total = bills.reduce((acumulado, bill) => acumulado + bill.amount, 0)


  function addBill() {
    const newBill: Bills = {
      id: crypto.randomUUID(),
      amount: Number(amount),
      note: note
    }

    setBills((prev) => [...prev, newBill])

    setAmount('')
    setNote('')
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
          <label>Importe:</label>
          <input id="amount" value={amount} onChange={(e) => setAmount(e.target.value)}/>
          <label>Nota:</label>
          <input id="note" value={note} onChange={(e) => setNote(e.target.value)}/>
        </div>    
        <button type="button" onClick={addBill}>
          Añadir
        </button>
        <p>Gastos: </p>
        <ul>
          {bills.map((g) => (
            <li key={g.id}>{g.note}: {g.amount} €</li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default App
