import React from 'react';
import './Header.css';
import Image from 'next/image';

const Header: React.FC = () => (
  <header>
    <aside>
      <Image src="/images/logoKartus.png" alt="logoKartus" width={140} height={50} />
    </aside>
    <div className="navegation">
      <a href="/" id='navHeader'>Feed</a>
    </div>
    <div className="log">
      <a href="/Login" id='navHeader'>Login</a>
      <a href="/Register" id='navHeader'>Registrar</a>
    </div>
  </header>
);

export default Header;
