import { useState } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

export default function Login() {
  const [username, setUsername] = useState('')

  const handleLogin = () => {
    const MySwal = withReactContent(Swal)

    MySwal.fire({
      title: <i>Ingresa tu usuario</i>,
      input: 'text',
      inputValue: username,
      preConfirm: () => {
        const value = Swal.getInput()?.value || ''
        setUsername(value)

        // Mostrar mensaje de "Usuario aceptado"
        Swal.fire({
          icon: 'success',
          title: 'Usuario aceptado',
          text: `Bienvenido, ${value}!`,
        })
      },
    })
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Login</h1>
      <button onClick={handleLogin}>Ingresar</button>
      <div style={{ marginTop: '20px' }}>
        Usuario actual: {username || 'No ingresado'}
      </div>
    </div>
  )
}
