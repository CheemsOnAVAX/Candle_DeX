import React, { useState, useEffect } from "react";
import {  pairABI, nativeTicker, USDC, USDT, WNATIVE, AVAXiABI, AVAXi} from "../contracts/ERC20";
import Token from  "../components/tokenChoice"
import {Contract, ethers, BigNumber, utils} from 'ethers';
import { Input,  Popover, Radio, Modal, message} from "antd";
import {TabList, Tab, Skeleton} from "@web3uikit/core";
import connection from "ethereactjs/menu";
import PoolCard from "./poolCard";



export default function Pools(props){
    const {address,signer, factory, router, provider, receive, token} = props;
    const [messageApi, contextHolder] = message.useMessage();
    const [balance, setBalance] = useState(0.00);
    const [Token, setToken] = useState(token);
    const [error, setErr] = useState(null)
    const [decimal, setDecimal] = useState(null);
    const [claimed, setClaimed] = useState(0);
    const [pendingClaimed, setPendingClaim] = useState(0);
    const [claimTax, setClaimTax] = useState(0);
    const [stacked, setStacked] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState(0);
    

  

    useEffect(()=>{
     const getBal = async()=>{
      connection(AVAXiABI,AVAXi)
      .then(async(res)=> {
        setToken(res)
        const _decimal = await res.decimals();
        setBalance((await res.balanceOf(address)).toLocaleString('fullwide', {useGrouping:false})/(10** _decimal))
        setDecimal(_decimal)
        console.log(await res.Claim(address))
        const claim = await res.Claim(address)
        setPercentage(claim[0].toString()/ 10);
        setClaimed((claim[1].toLocaleString('fullwide', {useGrouping:false})/ (10**_decimal)));
        setPendingClaim((claim[2].toLocaleString('fullwide', {useGrouping:false})/ (10**_decimal)))
        const stack = await res.stacked(address);
        setStacked((stack.toLocaleString('fullwide', {useGrouping:false})/(10**_decimal)))
        setClaimTax("5%")
        console.log(res)
     })
     .catch((err)=>setErr(err))
    //  console.log(Token)
    //  const claim = await Token.Claim(address)
    //  const stack = await Token.stacked(address)
    //  console.log(claim[0].toString())
    // //  setClaimed(claim[1].toLocaleString('fullwide', {useGrouping:false})/ (10**decimal))
    //  setPendingClaim(claim[2].toLocaleString('fullwide', {useGrouping:false})/ (10**decimal))
    //  setPercentage(claim[0].toString()/10)
    //  setStacked(stack.toLocaleString('fullwide', {useGrouping:false})/(10**decimal))

    //  setBalance((await token.balanceOf(address)).toString()/(10**decimal))
     }

      getBal()

  
    },[])
  
  const claim = async(compound)=>{
    setIsSuccess(false)
    setErr(false)
    setIsLoading(true)
     try{
      await Token.connect(signer);
      const tx = await Token.claimReward(address, compound);
      const Tx = await tx.wait(1);
      setIsSuccess(true);
      setIsLoading(false)
      setBalance((await Token.balanceOf(address)).toLocaleString('fullwide', {useGrouping:false})/(10**decimal))
      const claim = await Token.Claim(address)
      const stack = await Token.stacked(address)
      console.log(claim[0].toString())
      setClaimed(claim[1].toLocaleString('fullwide', {useGrouping:false})/ (10**decimal))
      setPendingClaim((claim[2].toLocaleString('fullwide', {useGrouping:false})/ (10**decimal)).toLocaleString('fullwide', {useGrouping:false}))
      setPercentage(claim[0].toString()/10)
      setStacked(stack.toLocaleString('fullwide', {useGrouping:false})/(10**decimal))
     }catch(err){
      if(err){
        if(err.data != undefined){
          setErr(err.data.message)
        }else{
          setErr(err.message)
        }
      }

      setIsSuccess(true)
      setIsLoading(false)
     }
  }




  const stack = async()=>{
   
        try{
          setIsLoading(true)
          setIsSuccess(false)
          const tx = await Token.stack(
            BigNumber.from((input*(10**decimal)).toString())
            );
          const Tx = await tx.wait(1);
          setIsLoading(false);
          setIsSuccess(true);
          const stack = await Token.stacked(address);
          const claim = await Token.Claim(address)
          setPercentage(claim[0].toString()/10)
          setBalance((await Token.balanceOf(address)).toLocaleString('fullwide', {useGrouping:false})/(10**decimal))
          setStacked(stack.toString()/ (10**decimal))
        }catch(err){
          if(err){
            if(err.data != undefined){
              setErr(err.data.message)
            }else{
              setErr(err.message)
            }
          }
          setIsSuccess(true)
          setIsLoading(false)
        }
  }

  const withdraw = async()=>{
    try{
      setIsLoading(true)
      setIsSuccess(false)
      const tx = await Token.withdrawStack( BigNumber.from((input*(10**decimal)).toString()), address);
      const Tx = await tx.wait(1);
      const stack = await Token.stacked(address);
      const claim = await Token.Claim(address)
      setPercentage(claim[0].toString()/10)
      setBalance((await Token.balanceOf(address)).toLocaleString('fullwide', {useGrouping:false})/(10**decimal))
      setStacked(stack.toString()/ (10**decimal))
      setIsLoading(false);
      setIsSuccess(true)
    }catch(err){
      if(err){
        if(err.data != undefined){   setErr(err.data.message)
        }else{
          setErr(err.message)
        }
      }
      setIsSuccess(true)
      setIsLoading(false)
    }
}


  useEffect(()=>{
    messageApi.destroy();
    if(isSuccess){
      console.log(error)
      if(error != null){
        messageApi.open({
          type: 'error',
          content: `Transaction Failed due to : ${error}`,
          duration: 5,
        })
        setErr(null)
      }else{
        messageApi.open({
          type: 'success',
          content: 'Transaction Successful',
          duration: 5,
        })
      }
    }else{
      messageApi.destroy();
    }
 setTimeout(()=>{setIsSuccess(false)}, 5000)

  },[isSuccess])
   

    return(
        <>
         {contextHolder}
         <div className="token-dapp">
        <div className="balance-card">
          <h5>Your AVAXi Balance : {balance}</h5> 
          <h5>Total Stake : {balance}</h5> 
          <h5> Todays total Reward distributed : {balance}</h5>
          </div>
        <div className="token-card">
        <div className="info-card">
         <div className="info-title">
            Claim  your USDC
         </div>
         <div className= "info">
           <div>Total Claimed : {claimed}</div>
           <div>Pending claim : {pendingClaimed}</div>
           <div>Tax : {claimTax}</div>
           <div> Your USDC after tax : {balance}</div>
           <div className="claim-button">
           <div className="button-claim" onClick={()=>claim(false)} disabled={pendingClaimed > 0 && isLoading}>Claim </div>
            <div className="button-claim"  onClick={()=>claim(true)} disabled={pendingClaimed > 0 && isLoading}>Compound</div>
           </div>
            </div>
         </div>
         <div className="info-card">
         <div className="info-title"> Stake your AVAXi</div>
         <div className= "info">
           <div>Your stake: {stacked}</div>
           <div>Your pool % : {percentage}</div>
           <div className="input-div">
           <input className="stack-input" placeholder="Enter Amount..." value={input} onChange={(e)=>setInput(e.target.value)}/>
           <div className="max-button" onClick={()=>setInput(stacked)}>max</div>
           </div>
           <div className="claim-button">
           <div className="button-claim"  onClick={stack} disabled ={isLoading}>Stack Now</div>
            <div className="button-claim"  onClick={withdraw} disabled ={input > stacked || isLoading}>Withdraw</div>
           </div>
            </div>
         </div>
         </div>
         </div>
        </>
    )
}
