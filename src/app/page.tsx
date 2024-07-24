"use client"

import React from "react";
import Header from "../components/Header.tsx";
import Navegation from "../components/Navigation.tsx";
import Feed from "../components/Feed.tsx"
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