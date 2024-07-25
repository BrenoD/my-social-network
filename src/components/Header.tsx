import React from 'react';
import './Header.css';
import Image from 'next/image'


interface HeaderProps {
  // Defina as props aqui, se houver alguma
}

const Header: React.FC<HeaderProps> = () => (
  <header>
    <aside>
      <Image src="/images/logoKartus.png" alt="logoKartus" width={300} height={300} />
    </aside>
    <div className="navegation">
      <a href="/">Feed</a>
    </div>
    <div className="log">
      <a href="/Login">Login</a>
      <a href="/Register">Registrar</a>
    </div>
  </header>
);

export default Header;
