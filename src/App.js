import "./App.css";
import {useState, useEffect} from "react";
import Header from "./components/Header";
import Swap from "./components/Swap";
import Liquidity from "./components/Liquidity";
import { Routes, Route } from "react-router-dom";
import {providers} from "ethers";
import connection from "ethereactjs/menu";
import {DexABI, routerAddress, factoryABI,  networkId, networkRPC} from "./contracts/ERC20";


function App() {
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [err, setErr] = useState(null)
  const [chainId, setChainId] = useState(null);
  const [router, setRouter] = useState("hello");
  const [factory, setFactory] = useState(null)

  const connect = async () => {
    try {
      const Provider = new providers.Web3Provider(window.ethereum);
      const chainID = (await Provider.getNetwork()).chainId
      await Provider.send("eth_requestAccounts", []);
      if(chainID == networkId){
        const signer = Provider.getSigner();
        setSigner(signer); 
      }else{
        setSigner(null)
      }
      setAddress(window.ethereum.selectedAddress);
      setProvider(Provider);
      setChainId(chainID) 
        
    } catch (error) {
      console.log(error)
      setAddress(null);
      setSigner(null)
    }
  };

 
  useEffect(()=>{
    
    
  
    if(window.ethereum.selectedAddress == null && signer == null){
      setSigner(null);
      setAddress(null)
    }
    if(signer != null && window.ethereum.selectedAddress != null){
   
    }
  }, [window.ethereum.selectedAddress, window.ethereum.chainId])
  window.ethereum.on('accountsChanged', connect);
  window.ethereum.on('chainChanged', connect);

  useEffect(()=>{
     const getRouter = async ()=>{
      connection(DexABI, routerAddress)
       .then(async(res)=> {
        setRouter(res)
        console.log(router)
        const factoryAddress = await res.factory();
        console.log(factoryAddress)
        const factory = await connection(factoryABI, factoryAddress)
        setFactory(factory)
        console.log(factory)
        // .then((res)=>{
        // setFactory(res)
        // console.log(factory)
        // })
        // .catch((err)=>setErr(err))
      })
      .catch((err)=>setErr(err))
     }
    //  const getFactory = async()=>{
    //   console.log(router)
    //   const factoryAddress = await router.factory();
    //   await connection(factoryABI, factoryAddress).then((res)=>setFactory(res)).catch((err)=>setErr(err))
    //   console.log(err)
    //  }
     getRouter()
    //  getFactory()
  }, [])
  return (

    <div className="App">
      <Header connect={connect} chainId ={chainId
      }  address={address}  signer={signer}/>
      <div className="mainWindow">
        <Routes>
          <Route path="/" element={<Swap chainId={chainId} signer={signer}  address={address} router={router} />} />
          <Route path="/liquidity" element={<Liquidity chainId={chainId} signer={signer}  address={address}  router={router} factory={factory}/>} />
        </Routes>
      </div>

    </div>
  )
}

export default App;
