import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // Ajuste o caminho conforme necessário
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCog, faInfoCircle, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
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
        <button className="profile">
          <a href="/Profile"><FontAwesomeIcon icon={faUser} className="iconUser"/> Perfil</a>
        </button>
        <button className="config">
          <FontAwesomeIcon icon={faCog} className="iconConfig"/> Configuração
        </button>
        <button className="about">
          <FontAwesomeIcon icon={faInfoCircle} className="iconAbout"/> Sobre
        </button>
        <button className="logout" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} className="iconLeave"/> Sair
        </button>
      </div>
    </div>
  );
};

export default Navegation;
