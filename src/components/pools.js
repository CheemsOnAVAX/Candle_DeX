import React, { useState, useEffect } from "react";
import { ERC20ABI, pairABI, nativeTicker, USDC, USDT, WNATIVE} from "../contracts/ERC20";
import Token from  "../components/tokenChoice"
import { Input,  Popover, Radio, Modal, message} from "antd";
import {TabList, Tab, Skeleton} from "@web3uikit/core";
import connection from "ethereactjs/menu";
import PoolCard from "./poolCard";



export default function Pools(props){
    const {address,signer, factory, router, provider, receive} = props;
    const [tokenOneSymbol, setSymbolOne] = useState("assetOne");
    const [tokenTwoSymbol, setSymbolTwo] = useState("assetTwo");
    const [tokenOne, setTokenOne] = useState(null);
    const [tokenTwo, setTokenTwo] = useState(null);
    const [pair, setPair] = useState(null);
    const [changeToken , setChangeToken] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [token , setToken] = useState(false);
    const [input, setInput] = useState('')
    console.log(factory)

    function openModal(asset) {
        setChangeToken(asset);
        setIsOpen(true);
    }

    const getContract = (e)=>{
          connection(ERC20ABI, e.target.value).then(async(res)=>{
          console.log(changeToken)
          console.log(res)
          changeToken == 1 ? setTokenOne(res) : setTokenTwo(res)
          changeToken == 1 ? setSymbolOne(await res.symbol()) : setSymbolTwo(await res.symbol());
          setToken(res.address);
        }).catch((err)=>console.log(err))
      }

    function listedToken(token){
      if(token == "native"){
        changeToken == 1? setSymbolOne(nativeTicker) : setSymbolTwo(nativeTicker)
        changeToken == 1? setTokenOne({address: WNATIVE}) : setTokenTwo({address: WNATIVE})
      }else{
        connection(ERC20ABI, token).then(async(res)=>{
          console.log(changeToken)
          console.log(res)
          changeToken == 1 ? setTokenOne(res) : setTokenTwo(res)
          changeToken == 1 ? setSymbolOne(await res.symbol()) : setSymbolTwo(await res.symbol());
        }).catch((err)=>console.log(err))       
      }
      setIsOpen(false);
      setToken(false)
      setInput("Enter token address....")

    }

    async function modifyToken(){
      setIsOpen(false);
      setInput('')
      setToken(false)
    }

      useEffect(()=>{

        async function getPair(){
            const pairAddress = await factory.getPair(tokenOne.address, tokenTwo.address);
            connection(ERC20ABI, pairAddress).then((res)=>{
                console.log(res)
                setPair(res)
            }).catch((err)=>{
                console.log(err)
            })
        }
        console.log(tokenOneSymbol)
        console.log(tokenTwoSymbol)
        if(tokenOne != null && tokenTwo != null){
        getPair()}
      }, [tokenOne, tokenTwo])

    return(
        <>
        <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
        width={1000}
      >
        <div className="modalContent">
             
        <input className="searchInput" placeholder="Enter token address..."  value={input} onClick={()=>setInput("")} onChange={getContract} onFocus={()=>setInput("")} />
        {token == false ? 
        <div className="tokenList">
         <Token listed={()=>listedToken("native")} tokenName={nativeTicker} provider={provider} token={null} address= {address} />
         <Token listed={()=>listedToken(USDC)} tokenName={'stAVES'} token= {USDC}  address= {address} />
         {/* <Token listed={()=>listedToken(USDT)} tokenName={'USDT'} token= {USDT}  address= {address} /> */}
         <Token listed={()=>listedToken(WNATIVE)} tokenName={`W${nativeTicker}`} token= {WNATIVE}  address= {address} />

         </div>
          : <div className="tokenList">
          <Token modify={modifyToken} tokenName={changeToken == 1 ? tokenOneSymbol : tokenTwoSymbol} provider={null} token={token} address={address} />
         </div> }
           
        </div>
      </Modal>
         <div className="tokenInput">
            <div className="tokensTicker" onClick={()=>openModal(1)}>{tokenOneSymbol}</div>
            <div className="tokensTicker" onClick={()=>openModal(2)}>{tokenTwoSymbol}</div>
         </div>
         <div className="pool">
            {pair == null && tokenOne == null && tokenTwo == null  ? <div
            style={{
                display: 'flex',
                padding: '7px',
                border: '1px solid',
                borderRadius: '20px',
                width: '380px',
                height: "20px",
                gap: '2px',
            }}
        >
            
            <div style={{ width: '100%', height: '100%' }}>
                <div > Input tokens pair to get your liquidity position</div>
            </div>
        </div> : tokenOne != null && tokenTwo != null ?  <PoolCard pair={pair} address={address} signer={signer} tokenOne={tokenOne.address} tokenTwo={tokenTwo.address} tickerOne={tokenOneSymbol} tickerTwo={tokenTwoSymbol} router={router} receive={receive}/>
       : <div
        style={{
            display: 'flex',
            padding: '7px',
            border: '1px solid',
            borderRadius: '20px',
            width: '380px',
            height: "20px",
            gap: '2px',
        }}
    >
        
        <div style={{ width: '100%', height: '100%' }}>
            <Skeleton theme="text" />
        </div> </div> 
        }
         </div>
         
        </>
    )
}
