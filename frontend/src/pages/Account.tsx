import React from "react"
import "./Account.css"
import Header from "../components/Header"
import Navegation from "../components/Navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Account: React.FC = () => {
    return (
        <div>
            <div>
                <Header />
            </div>
            <div>
                <Navegation />
                <div></div>
            </div>
        </div>
    )
}

export default Account