import React from "react";
import "./Configuration.css"
import Header from "../components/Header"
import Navegation from "../components/Navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';

const Configuration: React.FC = () => {
    return (
        <div>
            <div className="totalconfig"></div>
            <div className="Header">
                <Header />
            </div>
            <div className="Navegation">
                <Navegation />
                <div className="navConfig">
                <a href="/Account" className="navAccount"><FontAwesomeIcon icon={faKey} className="iconKey"/>Conta</a>
                <a href="/Privacy" className="navPrivacy">Privacidade</a>
                <a href="/recentLike" className="navRecentLike">Curtidas Recente</a>
                </div>
            </div>
        </div>
    )
}


export default Configuration