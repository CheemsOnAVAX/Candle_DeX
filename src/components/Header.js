import React, {useEffect} from "react";
import Logo from "../aveslogo.png";
import { Link } from "react-router-dom";
import {networkName, networkId} from "../contracts/ERC20"

function Header(props) {

  const {connect, address, chainId, signer} = props;
  
  return (
    <header>
      <div className="leftH">
      <img src={Logo} alt="logo" className="logo" />
        <Link to="/" className="link">
          <div className="headerItem">Swap</div>
        </Link>
        <Link to="/liquidity" className="link">
          <div className="headerItem">Liquidity</div>
        </Link>
        <Link to="/USDi" className="link">
          <div className="headerItem">USDi</div>
        </Link>
        <Link to="/AVAXi" className="link">
          <div className="headerItem">AVAXi</div>
        </Link>
      </div>
      <div className="rightH">
        <div className="headerItem">
          {window.ethereum != null ? chainId == null ? null : chainId === networkId ? networkName : "Wrong Network" : ""}
        </div>
        <div className="connectButton" onClick={address == null ? connect : null}>
          {window.ethereum != null ? address != null ? (address.slice(0,4) +"..." +address.slice(38)): "connect" : "plz install metamsk"}
        </div>
      </div>
    </header>
  );
}

export default Header;
