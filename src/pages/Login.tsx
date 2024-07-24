import "./UserLogin.css";
import React, { useState } from 'react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        alert('Login realizado com sucesso!');
        // Redirecionar ou atualizar o estado conforme necessário
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao realizar login.');
      }
    } catch (err) {
      setError('Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='total-screen-login'>
      <div className="login">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
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
          <button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default Login;
