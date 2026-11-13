import { useState } from 'react'
import { supabase } from './lib/supabase'
import { card, input, label, primaryButton } from './ui'


function Login() {
    const [user, setUser] = useState("")
    const [pass, setPass] = useState("")
    const [error, setError] = useState("")
    const [sending, setSending] = useState(false)


    async function login(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault()
        setSending(true)
        const { error } = await supabase.auth.signInWithPassword({ email: user, password: pass })
        setSending(false)
        if (error) setError(error.message)
    }


  return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-900">
                <form onSubmit={login} className={`${card} w-full max-w-sm space-y-4`}>
                    <h1 className="text-3xl font-bold">Mis Gastos</h1>
                    <div>
                        <label htmlFor="user" className={label}>Email</label>
                        <input id="user" className={input} type="email" autoComplete="email" value={user} onChange={(e) => setUser(e.target.value)}/>
                    </div>
                    <div>
                        <label htmlFor="pass" className={label}>Contraseña</label>
                        <input id="pass" className={input} type="password" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)}/>
                    </div>
                    <button type="submit" className={`${primaryButton} w-full`} disabled={sending}>
                        {sending ? 'Entrando...' : 'Entrar'}
                    </button>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </form>
            </div>
        )
    }

export default Login
