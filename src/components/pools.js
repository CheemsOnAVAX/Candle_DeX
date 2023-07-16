import React, { useState, useEffect } from "react";
import { ERC20ABI,  pairABI} from "../contracts/ERC20";
import { Input,  Popover, Radio, Modal, message} from "antd";
import {TabList, Tab, Skeleton} from "@web3uikit/core";
import connection from "ethereactjs/menu";
import PoolCard from "./poolCard";



export default function Pools(props){
    const {address,signer, factory, router} = props;
    const [tokenOneSymbol, setSymbolOne] = useState("assetOne");
    const [tokenTwoSymbol, setSymbolTwo] = useState("assetTwo");
    const [tokenOne, setTokenOne] = useState(null);
    const [tokenTwo, setTokenTwo] = useState(null);
    const [pair, setPair] = useState(null);
    const [changeToken , setChangeToken] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
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
        }).catch((err)=>console.log(err))
      }

      useEffect(()=>{
        async function getPair(){if(tokenOne != null && tokenTwo != null){
            const pairAddress = await factory.getPair(tokenOne.address, tokenTwo.address);
            connection(ERC20ABI, pairAddress).then((res)=>{
                console.log(res)
                setPair(res)
            }).catch((err)=>{
                console.log(err)
            })
        }}
        getPair()
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
             
        <Input className="tokenSearchBox"
                  placeholder="enter valid token address" 
                  disabled= {signer == null ? true : false}
                  onChange={getContract}
                  />
             
              <div
                className="tokenChoice"
                onClick={()=>setIsOpen(false)}
              >
                <div className="tokenChoiceNames">
                  <div className="tokenName">{changeToken === 1 ? tokenOneSymbol : tokenTwoSymbol}</div>
                </div>
              </div>
           
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
        </div> : pair == null && tokenOne != null && tokenTwo != null ?
        <div
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
        :  <PoolCard pair={pair} address={address} signer={signer} tokenOne={tokenOne.address} tokenTwo={tokenTwo.address} tickerOne={tokenOneSymbol} tickerTwo={tokenOneSymbol} router={router}/>}
         </div>
         
        </>
    )
}