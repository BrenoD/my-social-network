"use client"

import React from "react";
import Header from "../components/Header";
import Navegation from "../components/Navigation";
import Feed from "../components/Feed"
import { useClient } from "next/client"; // Importe useClient do next/client

const HomePage: React.FC = () => {
  // useClient();

return (
  <div>
    <Header />
    <div className="homeFeed">
      <Navegation />
      <Feed />
    </div>
  </div>
)
}

export default HomePage;