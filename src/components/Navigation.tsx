import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Ajuste o caminho conforme necessário
import "./Navegation.css";

const Navegation: React.FC = () => {
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    window.location.href = "/Login"; // Redireciona para a página de login após logout
  };

  return (
    <div className="leftNavegation">
      <div className="grid">
        <button className="profile"><a href="/Profile">Perfil</a></button>
        <button className="config">Configuração</button>
        <button className="about">Sobre</button>
        <button className="logout" onClick={handleLogout}>Sair</button>
      </div>
    </div>
  );
};

export default Navegation;
