import { useState } from 'react'
import { supabase } from './lib/supabase'


function Login() {
    const [user, setUser] = useState("")
    const [pass, setPass] = useState("")
    const [error, setError] = useState("")


    async function login(email: string, password: string) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message)
    }



  return (
            <>
            <section>
                <div>
                <h1 className="text-3xl font-bold">Welcome</h1>
                </div>
            </section>
            <section>
                <div>
                <label htmlFor="user">Email:</label>
                <input id="user" value={user} onChange={(e) => setUser(e.target.value)}/>
                <label htmlFor="pass">Contraseña:</label>
                <input id="pass" value={pass} type="password" onChange={(e) => setPass(e.target.value)}/>
                </div>    
                <button type="button" onClick={() => login(user, pass)}>
                Entrar
                </button>
                {error && <p>{error}</p>}
            </section>
            </>
        )
    }

export default Login
