import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Layout from './components/Layout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Products from './pages/Products.jsx'
import Customers from './pages/Customers.jsx'
import Orders from './pages/Orders.jsx'

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  {
    element: <Layout />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/products',  element: <Products /> },
      { path: '/customers', element: <Customers /> },
      { path: '/orders',    element: <Orders /> },
    ],
  },
])

const TOAST_STYLE = {
  background:   'var(--color-surface-dark)',
  color:        'var(--color-on-dark)',
  borderRadius: 'var(--radius-md)',
  fontFamily:   'var(--font-sans)',
  fontSize:     '14px',
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style:   TOAST_STYLE,
          success: { iconTheme: { primary: '#5db872', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#c64545', secondary: '#fff' } },
        }}
      />
    </>
  )
}
