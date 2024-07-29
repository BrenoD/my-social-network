import React, { useState } from 'react';
import "./UserRegister.css"

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setErrorMessage(''); // Limpa mensagens de erro anteriores

    try {
      const response = await fetch('http://localhost:8000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        alert('Usuário registrado com sucesso!');
        // Limpar os campos do formulário se desejado
        setUsername('');
        setEmail('');
        setPassword('');
      } else {
        const errorText = await response.text(); // Captura o texto do erro
        setErrorMessage(errorText); // Armazena a mensagem de erro
        alert(`Erro ao registrar usuário: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao enviar requisição:', error);
      setErrorMessage('Erro ao registrar usuário.');
      alert('Erro ao registrar usuário.');
    }
  };

  return (
    <div className='total-screen-register'>
    <div className="register">
      <h2>Registrar</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Nome:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Escreva Seu Nome Completo"
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Senha:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Registrar</button>
      </form>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
    </div>
  );
};

export default Register;
