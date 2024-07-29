// pages/profile.tsx
import React from 'react';
import "./Profile.css"
import Image from 'next/image'

const Profile: React.FC = () => {
    return (
        <div className="profile-container">
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
            <div className="leftNavegation">
                <div className="grid">
                    <button className="profile"><a href="/Profile" className='Profile'>Perfil</a></button>
                    <button className="config">Configuração</button>
                    <button className="about">Sobre</button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
