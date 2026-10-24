import { useState } from 'react'

function App() {
  const [total, setTotal] = useState(0)

  return (
    <>
      <section>
        <div>
          <h1>Mis Gastos</h1>
          <p>
            Total gastado:
          </p>
          <p>
            {total}€
          </p>
        </div>
        <button
          type="button"
          onClick={() => setTotal((total) => total + 10)}
        >
          Añadir 10€
        </button>
        <button
          type="button"
          onClick={() => setTotal(0)}
        >
          Reiniciar
        </button>
      </section>

    </>
  )
}

export default App
