import React from 'react';
import './Header.css';
import Image from 'next/image';

const Header: React.FC = () => (
  <header>
    <aside>
      <Image src="/images/logoKartus.png" alt="logoKartus" width={140} height={50} />
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
