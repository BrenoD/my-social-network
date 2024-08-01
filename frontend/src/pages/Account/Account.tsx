import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./Account.css"
import Header from "../../components/Header"
import Navegation from "../../components/Navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    username: string;
    email: string
    exp: number;
    iat: number;
    user_id: number;
    
}

const Account: React.FC = () => {
    const [username, setUsername] = useState<string>('');

    return (
        <div className="total-area-account">
            <div className="header">
                <Header />
            </div>
            <div className="area-account-nav">
                <Navegation />
                <div className="area-account">
                    <div className="data-user">

                        <h1>oi</h1>
                    </div>
                    <div className="data-user">
                        <h1>oiii</h1>
                    </div>
                </div>
                {/* <div>
                    
                </div>
                <div>
                    
                </div> */}
            </div>
        </div>
    )
}

export default Account