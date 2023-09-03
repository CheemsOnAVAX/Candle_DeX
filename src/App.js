import "./App.css";
import {useState, useEffect} from "react";
import Header from "./components/Header";
import Swap from "./components/Swap";
import Liquidity from "./components/Liquidity";
import USDIDashboard from "./components/UsdiDashborad";
import { Routes, Route } from "react-router-dom";
import {providers} from "ethers";
import connection from "ethereactjs/menu";
import {DexABI, routerAddress, factoryABI,  networkId, networkRPC,WNATIVE,  WNATIVEABI, ERC20ABI, AVAXiABI, AVAXi, USDi} from "./contracts/ERC20";


function App() {
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [err, setErr] = useState(null)
  const [chainId, setChainId] = useState(null);
  const [router, setRouter] = useState("hello");
  const [factory, setFactory] = useState(null)
  const [wrraped, setWrraped] = useState(null)
  const [stackTokenOne, setStackOne] = useState(null);
  const [stackTokenTwo, setStackTwo] = useState(null);

  const connect = async () => {
    try {
      const Provider = new providers.Web3Provider(window.ethereum);
      const chainID = (await Provider.getNetwork()).chainId
      await Provider.send("eth_requestAccounts", []);
      if(chainID == networkId){
        const signer = Provider.getSigner();
        setSigner(signer); 
        if(router != null){
          await router.connect(signer)
        }
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
  }
  
 
  useEffect(()=>{
    
    if(window.ethereum != null){
  
    if(window.ethereum.selectedAddress == null && signer == null){
      setSigner(null);
      setAddress(null)
    }
    if(signer != null && window.ethereum.selectedAddress != null){
   
    }}
  }, [window.ethereum != null ? window.ethereum.selectedAddress : null, window.ethereum != null ? window.ethereum.chainId : null])
  if(window.ethereum != null){
  window.ethereum.on('accountsChanged', connect);
  window.ethereum.on('chainChanged', connect);
  }


  useEffect(()=>{
    if(window.ethereum != null){
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
      connection(WNATIVEABI, WNATIVE)
       .then((res)=> {
        setWrraped(res)

        
        // .then((res)=>{
        // setFactory(res)
        // console.log(factory)
        // })
        // .catch((err)=>setErr(err))
      })
      .catch((err)=>setErr(err))

      connection(AVAXiABI,AVAXi)
      .then((res)=> {
        setStackOne(res)

     })
     .catch((err)=>setErr(err))

     connection(ERC20ABI,USDi)
     .then((res)=> {
       setStackTwo(res)

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
    }
  }, [])



  return (

    <div className="App">
      <Header connect={connect} chainId ={chainId
      }  address={address}  signer={signer}/>
      <div className="mainWindow">
        <Routes>
          <Route path="/" element={<Swap chainId={chainId} signer={signer}  address={address} router={router} provider={provider} wrraped={wrraped}/>} />
          <Route path="/liquidity" element={<Liquidity chainId={chainId} signer={signer}  address={address}  router={router}  provider={provider} factory={factory}/>} />
          <Route path="/USDi" element={<USDIDashboard chainId={chainId} signer={signer} address={address} token={stackTokenOne}/>} />
          <Route path="/AVAXi" element={<USDIDashboard chainId={chainId} signer={signer} address={address} token={stackTokenTwo}/>} />

        </Routes>
      </div>

    </div>
  )
}

export default App;
