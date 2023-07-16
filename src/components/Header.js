import Logo from "../dexlogo.png";
import { Link } from "react-router-dom";
import {networkName, networkId} from "../contracts/ERC20"

function Header(props) {

  const {connect, address, chainId} = props;
  
  return (
    <header>
      <div className="leftH">
        <img src={Logo}  alt="logo" className="logo" />
        <Link to="/" className="link">
          <div className="headerItem">Swap</div>
        </Link>
        <Link to="/liquidity" className="link">
          <div className="headerItem">Liquidity</div>
        </Link>
      </div>
      <div className="rightH">
        <div className="headerItem">
          {chainId == null
            ? null
            : chainId === networkId
            ? networkName
            : "Wrong Network"}
        </div>
        <div
          className="connectButton"
          onClick={address == null ? connect : null}
        >
          {address != null
            ? address.slice(0, 4) + "..." + address.slice(38)
            : "connect"}
        </div>
      </div>
    </header>
  );
}

export default Header;
