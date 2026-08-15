
import { createBrowserRouter, RouterProvider } from 'react-router'
import './App.css'
import Login from './routes/Login'
import Dashboard from './routes/Dashboard'
import Admin from './routes/Admin'

function App() {
  const router = createBrowserRouter([
    {
      path:'/login',
      Component: Login
    },
    {
      path: '/admin',
      Component: Admin
    },
    {
      path:'/dashboard',
      Component: Dashboard
    }
  ])


  return (
    <>
    <RouterProvider router={router}/>
    </>
  )
}

export default App
