import "./UserLogin.css";
import "../app/globals.css";
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MdMail, MdLock, MdOutlineClose } from 'react-icons/md';

const Login: React.FC = () => {
  const { login } = useContext(AuthContext);
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
        const { token } = await response.json(); // Assumindo que o token JWT é retornado aqui
        login(token); // Usando o contexto para definir o estado de autenticação
        alert('Login realizado com sucesso!');
        window.location.href = "/"; // Redireciona para o Feed
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
    <div className='flex bg-slate-50 justify-center items-center w-full h-screen'>
      <div className="relative flex flex-col justify-center bg-gray-800 shadow-xl w-[480px] h-[600px] rounded-xl overflow-hidden">
        <div className="flex flex-col justify-start items-center w-full pt-4">
          <h2 className="font-poppins text-[34px] font-black text-white">LOGIN</h2>
        </div>
        <div className="flex justify-center w-auto h-screen m-12">
          <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
            <div>
              <label htmlFor="email" className="mb-2 text-gray-900 font-black text-sm dark:text-white">Email:</label>
              <div className="flex justify-center bg-gray-700 rounded-xl border border-gray-300 overflow-hidden">
                <div className="flex justify-center items-center ps-3.5">
                  < MdMail className="text-gray-400 text-[24px]" />
                </div>
                <input
                  id="email"
                  className="outline-none active:outline-none bg-gray-700 text-white font-medium p-2 w-full"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="mb-2 text-gray-900 font-black text-sm dark:text-white">Password</label>
              <div className="flex justify-center bg-gray-700 rounded-xl border border-gray-300 overflow-hidden">
                <div className="flex justify-center items-center ps-3.5">
                  < MdLock className="text-gray-400 text-[24px]" />
                </div>
                <input
                  id="password"
                  className="outline-none active:outline-none bg-gray-700 text-white font-medium p-2 w-full"
                  type="password"
                  value={password}
                  placeholder="•••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-blue-500 hover:bg-blue-600 rounded-xl text-white text-2xl font-semibold p-3 w-9/12" type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
            {error && <div role="alert">
              <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">Danger</div>
              <div className="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                <p>{error}</p>
              </div>
            </div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
