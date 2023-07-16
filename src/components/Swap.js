import React, { useState, useEffect } from "react";
import { Input,  Popover, Radio, Modal, message} from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import axios from "axios";
import connection from "ethereactjs/menu";
import {Contract, ethers, BigNumber} from 'ethers';
import { ERC20ABI} from "../contracts/ERC20";




export default  function Swap(props) {
  const {chainId,  address, signer, router } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState(0);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(0);
  const [tokenOneSymbol, setSymbolOne] = useState("enter Token");
  const [tokenTwoSymbol, setSymbolTwo] = useState("enter token");
  
  const [tokenOne, setTokenOne] = useState(null);
  const [tokenTwo, setTokenTwo] = useState(null);
  const [tokenOneBal, setTokenOneBal] = useState(0.00);
  const [tokenTwoBal, setTokenTwoBal] = useState(0.00);
  const [tokenOneDecimal, setTokenOneDecimal] = useState(null);
  const [tokenTwoDecimal, setTokenTwoDecimal] = useState(null);
  const [tokenAllownce, setTokenAllownce] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [disabledButton, setDisabledButton] = useState(false);
  const [swapButton, setSwapButton] = useState(false);
  const [error, setError] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)
 

  

  function handleSlippageChange(e) {
    setSlippage(e.target.value);
  }

 async function changeAmount(e) {
 
  const input = e.target.value
    setTokenOneAmount(input);
    if(e.target.value && tokenTwo !== null){
      console.log(changeToken)
      const tokensArray = [tokenOne.address, tokenTwo.address]
      console.log(tokensArray)
      const amount = (e.target.value)*tokenOneDecimal 
      console.log(amount)
      const tokenAmount = await router.getAmountsOut(BigNumber.from(amount.toLocaleString('fullwide', {useGrouping:false})), tokensArray)
      console.log(tokenAmount[1].toString())
      console.log((tokenAmount[1]).toLocaleString('fullwide', {useGrouping:false})/tokenTwoDecimal)
      setTokenTwoAmount((tokenAmount[1]).toLocaleString('fullwide', {useGrouping:false})/tokenTwoDecimal);
      const allowance = await tokenOne.allowance(address, router.address);
      console.log(allowance.toLocaleString('fullwide', {useGrouping:false})/tokenOneDecimal)
      if((allowance.toLocaleString('fullwide', {useGrouping:false})/tokenOneDecimal) < e.target.value && e.target.value <= tokenOneBal){
        setTokenAllownce(true);
      }else{
        setTokenAllownce(false)
      }
    }else{
      setTokenTwoAmount(null);
    }
  }

 async function getTokenName(){
  console.log("tokenNamecalled")
  console.log(changeToken)
  if(changeToken === 1 ){
    if(tokenOne === null){
      setSymbolOne(" enter token")
      setTokenOneBal(0.00)
    }else{
      console.log(tokenOne.address)
      setSymbolOne(await tokenOne.symbol())
      const decimal = 10**(await tokenOne.decimals());
      setTokenOneDecimal(decimal)
      const bal = ((await tokenOne.balanceOf(address)).toString())/decimal

      setTokenOneBal(bal)
    } 
  }
  if(changeToken === 2){
    if(tokenTwo === null){
      setSymbolTwo(" enter token")
      setTokenTwoBal(0.00)
    }else{
      console.log(tokenTwo.address)
      setSymbolTwo(await tokenTwo.symbol())
      const decimal = 10**(await tokenTwo.decimals());
      setTokenTwoDecimal(decimal)
      const bal = ((await tokenTwo.balanceOf(address)).toString())/decimal
      setTokenTwoBal(bal)
    } 
  }
 }

  async function switchTokens() {
    setChangeToken(0)
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    const one = tokenOne
    const two = tokenTwo
    setTokenOne(two);
    setTokenTwo(one);

      // const symbolOne = await two.symbol();
      // const decimal1 = 10**(await two.decimals());
      // const bal1 = ((await two.balanceOf(address)).toString())/decimal1
      // const symbolTwo = await one.symbol()
      // const decimal2 = 10**(await one.decimals());
      // const bal2 = ((await one.balanceOf(address)).toString())/decimal2
      
      setSymbolOne(tokenTwoSymbol)
      setSymbolTwo(tokenOneSymbol)
      setTokenOneDecimal(tokenTwoDecimal)
      setTokenTwoDecimal(tokenOneDecimal)
      setTokenOneBal(tokenTwoBal)
      setTokenTwoBal(tokenOneBal)
      setTokenAllownce(false)
      // console.log(tokenOne.address)
      // console.log(tokenTwo.address)
      // console.log(tokenOneSymbol)
      // console.log(tokenTwoSymbol)
      // console.log(tokenOneDecimal)
      // console.log(tokenTwoDecimal)
    
  }

  function openModal(asset) {
    setChangeToken(asset);
    setIsOpen(true);
  }

 async function modifyToken(){
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    if (changeToken === 1) {
     await tokenOne.connect(signer);
    } 
    setIsOpen(false);
  }

  async function Swap(){
       
      
        
        try{
          setSwapButton(true);
        const tokensArray = [tokenOne.address, tokenTwo.address];
        const amountOutMin = (tokenTwoAmount*(100-slippage)*tokenTwoDecimal)/100;
        console.log(Math.ceil(amountOutMin))
        console.log(Math.ceil((Date.now())/1000) + 10)
        console.log(tokenOneAmount*tokenOneDecimal)
        console.log(tokenTwoAmount*tokenTwoDecimal)
        const tx = await router.swapExactTokensForTokens(
          BigNumber.from((tokenOneAmount*tokenOneDecimal).toLocaleString('fullwide', {useGrouping:false})),
          BigNumber.from((Math.ceil(amountOutMin)).toLocaleString('fullwide', {useGrouping:false})),
          tokensArray,
          address,
          Math.ceil((Date.now())/1000) + 300)
          const swap = await tx.wait(1);
          if(swap.events[0]){
            setIsSuccess(true)
            setTokenOneAmount(0);
            setTokenTwoAmount(0)
            const tokenOneamount = (await tokenOne.balanceOf(address)).toString()/tokenOneDecimal
            const tokenTwoamount = (await tokenTwo.balanceOf(address)).toString()/tokenTwoDecimal
            setTokenOneBal(tokenOneamount)
            setTokenTwoBal(tokenTwoamount)
            setSwapButton(false)
            console.log(swap);
          }
         
        }catch(err){
          setIsSuccess(true)
          console.log(err.data.message)
          setSwapButton(false)  
          setError(err.data.message)
        }
       
        
      
  }

  async function approveToken(){
    setIsSuccess(false)
    setDisabledButton(true)
    console.log(tokenOneAmount)
    console.log(tokenOneDecimal)
    try{
        const tx = await tokenOne.approve(router.address, BigNumber.from((tokenOneAmount*tokenOneDecimal).toLocaleString('fullwide', {useGrouping:false})))
        const Tx = await tx.wait(1);
        console.log(tokenAllownce)
        if(Tx.events[0]){
          setTokenAllownce(false)
          console.log(tokenAllownce)
          setIsSuccess(true)
          setDisabledButton(false)
        }}catch(err){
          setIsSuccess(true)
          console.log(err.data.message);
          setDisabledButton(false)
          setError(err.data.message)
        }
  
  }

  const getContract = (e)=>{
    connection(ERC20ABI, e.target.value).then((res)=>{
      console.log(changeToken)
      console.log(res)
      changeToken === 1 ? setTokenOne(res) : setTokenTwo(res)
      e.target.value = null
    }).catch((err)=>console.log(err))
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
        setError(null)
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

  

  useEffect(()=>{
   changeToken === 1 ?  getTokenName(tokenOne) : getTokenName(tokenTwo)
  
  },[tokenOne, tokenTwo])

  useEffect(()=>{
    const UpdateSigner = async ()=>{
      if(tokenOne != null){
        const bal1 = ((await tokenOne.balanceOf(address)).toString())/tokenOneDecimal
        setTokenOneBal(bal1)
        tokenOne.connect(signer)
      }
      if(tokenTwo != null){
        const bal2 = ((await tokenTwo.balanceOf(address)).toString())/tokenTwoDecimal
        setTokenTwoBal(bal2)
      }
    
    }
    if(tokenOne != null || tokenTwo != null){
      UpdateSigner()
    }
  },[signer])


  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
        <div className="slippageInput"><input className="Input"/></div>
      </div>
    </>
  );

  return (
    <>
      {contextHolder}
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
                onClick={() => modifyToken()}
              >
                <div className="tokenChoiceNames">
                  <div className="tokenName">{changeToken === 1 ? tokenOneSymbol : tokenTwoSymbol}</div>
                </div>
              </div>
           
        </div>
      </Modal>
      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h4>Swap</h4>
          <Popover
            content={settings}
            title="Settings"
            trigger="click"
            placement="bottomRight"
          >
            <SettingOutlined className="cog" />
          </Popover>
        </div>
        <div className="inputs">
          <Input
            placeholder="0"
            value={tokenOneAmount}
            onChange={changeAmount}
          />
          <Input placeholder="0" value={tokenTwoAmount} disabled={true} />
          <div className="switchButton" onClick={switchTokens}>
            <ArrowDownOutlined className="switchArrow" />
          </div>
          <div className="assetOne" onClick={() => openModal(1)}>
            {tokenOneSymbol}
            <DownOutlined />
          </div>
          {tokenOne && signer ? <div className="assetOneBal"> {tokenOneBal.toFixed(6)}</div> : null }
          <div className="assetTwo" onClick={() => openModal(2)}>
            {tokenTwoSymbol}
            <DownOutlined />
          </div>
          {tokenTwo && signer ? <div className="assetTwoBal"> {tokenTwoBal.toFixed(6)}</div> : null}
          
        </div>
        {tokenOne != null && tokenTwo != null && tokenAllownce === true ? 
        <div className="approveButton" disabled={disabledButton} onClick={approveToken}>{disabledButton ? "Loading . . ." : "Approve"}</div> : null}
        <div className="swapButton" disabled={tokenOneAmount > 0 && tokenAllownce === false && swapButton == false ? false : true } onClick={Swap}>{swapButton ? "Loading . . ." : "Swap"}</div>
      </div>
    </>
  );
}

