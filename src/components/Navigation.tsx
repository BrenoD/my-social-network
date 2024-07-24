import React from "react"
import "./Navegation.css"

interface NaverProps {
    // Defina as props aqui, se houver alguma
  }
  
  const Navegation: React.FC<NaverProps> = () => (
    <div className="leftNavegation">
      <div className="grid">
        <button className="profile">Perfil</button>
        <button className="config">Configuração</button>
        <button className="about">Sobre</button>
        </div>
    </div>
  )

  export default Navegation