
import { useState } from "react"
import { useNavigate } from "react-router"
import Cookies from "universal-cookie"

export default function Login() {
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [errorMsg, setErrorMsg] = useState<string>("")
    const [successMsg, setSuccessMsg] = useState<string>("")

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? ""
    const navigate = useNavigate()
    const cookies = new Cookies()

    const handleFormSubmit = async (event: React.SubmitEvent) => {
        try {
            event?.preventDefault()
            const response = await fetch(`${BACKEND_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials:'include',
                body: JSON.stringify({ username: username, password: password }),
            })

            if (!response.ok) {
                setErrorMsg('Error occured in fetch')
                return;
            }

            const data = await response.json()
            if (!data || data?.status != 'success') {
                setErrorMsg(data?.message ?? 'Error occured in fetch')
                return;
            }

            const userData = data?.data
            if (!userData) {
                setErrorMsg('No user data available')
                return
            }
            cookies.set('user_data', userData, {
                path: '/',
                maxAge: 3600,
                secure: true,
                sameSite: 'none'
            });
            setErrorMsg("")
            setUsername("")
            setPassword("")
            setSuccessMsg(data?.message ?? "")
            setTimeout(() => {
                navigate('/dashboard')
                setSuccessMsg("")
            }, 2000)


        } catch (error) {
            console.log(error)

        }
    }
    return (
        <>
            <div className="w-screen h-screen flex items-center justify-center">
                <div className="w-2xl flex-col items-center justify-center gap-3 bg-zinc-200 px-10 py-8 rounded-2xl">
                    <h1 className="text-center pb-12">Welcome to Login Page</h1>
                    <div >
                        <form onSubmit={handleFormSubmit} className="flex flex-col gap-6 items-center ">
                            <div >
                                <label htmlFor="username" className="pr-4" >Username</label>
                                <input type="text" name="username" value={username} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setUsername(event?.target.value ?? "")} className="border-2 border-blue-400 rounded-b-lg" />
                            </div>
                            <div>
                                <label htmlFor="password" className="pr-4">Password</label>
                                <input type="password" name="password" value={password} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value ?? "")} className="border-2 border-blue-400 rounded-b-lg" />
                            </div>
                            <button type="submit" className="bg-green-500 text-white cursor-pointer py-2 px-4 rounded-2xl">
                                Login
                            </button>
                            {errorMsg && errorMsg.length > 0 && <p className="text-red-400">{errorMsg}</p>}
                            {successMsg && successMsg.length > 0 && <p className="text-green-400">{successMsg}</p>}
                        </form>
                    </div>
                </div>

            </div>
        </>
    )
}