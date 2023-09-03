import React, { useState, useEffect } from "react";
import { Popover, Radio, Modal, message, Checkbox, InputNumber} from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Input} from "@web3uikit/core";
import axios from "axios";
import connection from "ethereactjs/menu";
import {Contract, ethers, BigNumber, utils} from 'ethers';
import { ERC20ABI, nativeTicker, USDC,  WNATIVE} from "../contracts/ERC20";
import Token from  "../components/tokenChoice"





export default  function Swap(props) {
  const {chainId,  address, signer, router, provider, wrraped } = props;
  const [messageApi, contextHolder] = message.useMessage();
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState(0);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(0);
  const [input, setInput] = useState("Enter token address...");
  const [token, setToken] = useState(false);
  const [native, setNative] = useState(0);
  const [tokenOneSymbol, setSymbolOne] = useState("enter Token");
  const [tokenTwoSymbol, setSymbolTwo] = useState("enter token");
  
  const [tokenOne, setTokenOne] = useState(null);
  const [tokenTwo, setTokenTwo] = useState(null);
  const [tokenOneBal, setTokenOneBal] = useState(0);
  const [tokenTwoBal, setTokenTwoBal] = useState(0);
  const [receive, setReceive] = useState(false);
  const [receiver, setReceiver] = useState(address)
  const [showOneBal, setShowOne] = useState(0);
  const [showTwoBal, setShowTwo] = useState(0);
  const [tokenOneDecimal, setTokenOneDecimal] = useState(null);
  const [tokenTwoDecimal, setTokenTwoDecimal] = useState(null);
  const [tokenAllownce, setTokenAllownce] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [disabledButton, setDisabledButton] = useState(false);
  const [swapButton, setSwapButton] = useState(false);
  const [error, setError] = useState(null)
  const [isSuccess, setIsSuccess] = useState(false)
 
console.log(receiver)
  

  function handleSlippageChange(e) {
    setSlippage(e.target.value);
  }

 async function changeAmountTwo(e) {
 
  const input = e.target.value;
  getTokenTwoAmount(input);
   
  }

  async function changeAmountOne(e){
     const input =  e.target.value;
     getTokenOneAmount(input)
  }

  async function getTokenOneAmount(input){
    var _tokenOneAmount;
    console.log(typeof input)
    setTokenTwoAmount(input);
    if(tokenOne != null && tokenTwo != null && input != ""){
      if(tokenOne.address == tokenTwo.address){
        setTokenOneAmount(input)
        if(tokenOneSymbol == `W${nativeTicker}`){
          const allowance =  await tokenOne.allowance(address, router.address)
          console.log(allowance.toString())
          
           if(allowance.toString() < (input*(10**18)) && input <= tokenOneBal ){
          setTokenAllownce(true);
           }else{
          setTokenAllownce(false)
           }
        }
      }else{
        const tokensArray = [tokenOne.address, tokenTwo.address]
        const amount = (input)*(10**tokenTwoDecimal) 
        const tokenAmount = await router.getAmountsIn(BigNumber.from(amount.toLocaleString('fullwide', {useGrouping:false})), tokensArray)
        console.log(tokenAmount[0].toString())
         _tokenOneAmount = ((tokenAmount[0]).toString()/(10**tokenOneDecimal)).toLocaleString('fullwide', {useGrouping:false})
        console.log(((tokenAmount[0]).toString()/(10**tokenOneDecimal)).toLocaleString('fullwide', {useGrouping:false}))
        setTokenOneAmount(((tokenAmount[0]).toString()/(10**tokenOneDecimal)).toString());      }
    }else{
      setTokenOneAmount("");
    }
    
    if(tokenOneSymbol != nativeTicker){
      const allowance =  await tokenOne.allowance(address, router.address)
      console.log(allowance.toString())
      console.log((allowance.toString()/(10**tokenOneDecimal)).toLocaleString('fullwide', {useGrouping:false}))
       if(allowance.toString() < _tokenOneAmount && _tokenOneAmount <= tokenOneBal ){
      setTokenAllownce(true);
       }else{
      setTokenAllownce(false)
       }
    }
  }
  async function getTokenTwoAmount(input){
    var amount;
    setTokenOneAmount(input);
    if(tokenOne != null && tokenTwo != null && input != ""){
      if(tokenOne.address == tokenTwo.address){
        setTokenTwoAmount(input)
        if(tokenOneSymbol == `W${nativeTicker}`){
          const allowance =  await tokenOne.allowance(address, router.address)
          console.log(allowance.toString())
          
           if(allowance.toString() < (input*(10**18)) && input <= tokenOneBal ){
          setTokenAllownce(true);
           }else{
          setTokenAllownce(false)
           }
        }
      }else{
        const tokensArray = [tokenOne.address, tokenTwo.address]
        console.log(tokensArray)
        console.log(tokenOneDecimal)
         amount = (input)*(10**tokenOneDecimal) 
        console.log(amount.toString())
        const tokenAmount = await router.getAmountsOut(BigNumber.from(amount.toLocaleString('fullwide', {useGrouping:false})), tokensArray)
        console.log(tokenAmount[1].toString())
        console.log(((tokenAmount[1]).toString()/(10**tokenTwoDecimal)).toLocaleString('fullwide', {useGrouping:false}))
        setTokenTwoAmount(((tokenAmount[1]).toString()/(10**tokenTwoDecimal)).toString());
        
      }
    }else{
      setTokenTwoAmount("");
    }
    if(tokenOneSymbol != nativeTicker){
      const allowance =  await tokenOne.allowance(address, router.address)
      console.log(allowance.toString())
      console.log((allowance.toString()/(10**tokenOneDecimal)).toLocaleString('fullwide', {useGrouping:false}))
       if(allowance.toString() < amount && input <= tokenOneBal && native != 1){
      setTokenAllownce(true);
       }else{
      setTokenAllownce(false)
       }
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
      if(tokenOne == "native"){
        setSymbolOne(nativeTicker);
        setTokenOneDecimal(18)
        if(nativeTicker === tokenTwoSymbol && tokenTwoSymbol != "enter token"){
          setSymbolTwo("enter token")
          setTokenTwoBal(0)
        }
        const balance = (((await provider.getBalance(address)).toString())/(10**18)).toLocaleString('fullwide', {useGrouping:false}); 
        setTokenOneBal(balance)
        setTokenOne({address : WNATIVE})
        setNative(1)
      }else{
        const symbol = await tokenOne.symbol();
        setSymbolOne(symbol)
        if(symbol === tokenTwoSymbol && tokenTwoSymbol != "enter token"){
          setSymbolTwo("enter token")
          setTokenTwoBal(0)
        }
      console.log(tokenOne.address)
      const decimal = (await tokenOne.decimals());
      setTokenOneDecimal(decimal)
      const bal = (((await tokenOne.balanceOf(address)).toString())/(10**decimal)).toLocaleString('fullwide', {useGrouping:false});
      setTokenOneBal(bal)
      setNative(0)
      }
    } 
  }
  if(changeToken === 2){
    if(tokenTwo === null){
      setSymbolTwo(" enter token")
      setTokenTwoBal(0.00)
    }else{
      if(tokenTwo == "native"){
        setSymbolTwo(nativeTicker);
        if(nativeTicker === tokenOneSymbol && tokenOneSymbol != "enter token"){
          setSymbolOne("enter token")
          setTokenOneBal(0)
        }
        const balance = (((await provider.getBalance(address)).toString())/(10**18)).toLocaleString('fullwide', {useGrouping:false});  
        setTokenTwoBal(balance)
        setTokenTwo({address : WNATIVE})
        setTokenTwoDecimal(18)
        setNative(2)
      }else{
        const symbol = await tokenTwo.symbol();
        setSymbolTwo(symbol)
        if(symbol === tokenOneSymbol && tokenOneSymbol != "enter token"){
          setSymbolOne("enter token")
          setTokenOneBal(0)
        }
      console.log(tokenTwo.address)
      
      const decimal = (await tokenTwo.decimals());
      setTokenTwoDecimal(decimal)
      const bal = (((await tokenTwo.balanceOf(address)).toString())/(10**decimal)).toLocaleString('fullwide', {useGrouping:false})
      console.log(bal)
      setTokenTwoBal(bal)
      setNative(0)
      }
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
    setToken(false);
  }

 async function modifyToken(){
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    if (changeToken === 1) {
        await tokenOne.connect(signer);
      }
     
    setIsOpen(false);
    setInput("Enter token address....")
  }

  async function listedToken(token){
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    if(token == "native"){
      changeToken === 1 ? setTokenOne(token) : setTokenTwo(token);
    }else{
      getToken(token)
    }
   
    setIsOpen(false);
    setInput("Enter token address....")
  }

  async function getToken(token) {
    connection(ERC20ABI, token).then(async(res)=>{
      if(changeToken === 1){
        setTokenOne(res)
        await res.connect(signer)
      }else{
        setTokenTwo(res)
      }
      setToken(true);
    }).catch((err)=>console.log(err))
    
  }


  function handleCheck(e){
    setReceive(e.target.checked);
    setReceiver(address)
  }
  function handleReceiver(e){
    setReceiver(e.target.value)
  }

  async function Swap(){
       
       console.log(receiver)
        
        try{
         await  router.connect(signer)
          setSwapButton(true);
        const tokensArray = [tokenOne.address, tokenTwo.address];
        console.log(tokensArray)
        const gasPriceGwei = utils.parseUnits((await provider.getGasPrice()).toString(), "gwei").toString();
        console.log(utils.parseUnits((await provider.getGasPrice()).toString(), "gwei").toString())
        
        const amountOutMin = (tokenTwoAmount*(100-slippage)*(10**tokenTwoDecimal))/100;
        console.log(Math.ceil(amountOutMin))
        console.log(Math.ceil((Date.now())/1000) + 10)
        console.log(tokenOneAmount*(10**tokenOneDecimal))
        console.log(tokenTwoAmount*(10**tokenTwoDecimal))
        console.log((ethers.utils.parseEther(tokenOneAmount)).toString())
        // console.log(ethers.utils.parseUnits(tokenOneAmount.toLocaleString('fullwide', {useGrouping:false}), "ethers"))
        var tx
        if(tokenOneSymbol == nativeTicker){
          if(tokenTwo.address == WNATIVE){
            await wrraped.connect(signer);
            tx = await wrraped.deposit({ 
              // gasPrice: utils.parseUnits((await provider.getGasPrice()).toString(), "gwei"),
              gasLimit: BigNumber.from("500000"),
              value: utils.parseUnits(tokenOneAmount, "ether")
            })
          }else{
          tx = await router.swapExactAVAXForTokens(
            BigNumber.from((Math.ceil(amountOutMin)).toLocaleString('fullwide', {useGrouping:false})),
            tokensArray,
            receiver,
            Math.ceil((Date.now())/1000) + 300,
            { 
              // gasPrice: utils.parseUnits("2", "gwei"),
              gasLimit: BigNumber.from("500000"),
              value: utils.parseUnits(tokenOneAmount, "ether")
            }
            // {value: BigNumber.from((tokenOneAmount*(10**18)).toLocaleString("fullwide", {useGrouping: false}))}
          )}
 
        }else if(tokenTwoSymbol == nativeTicker){
          if(tokenOne.address == WNATIVE){
            await wrraped.connect(signer);
            tx = await wrraped.withdraw(BigNumber.from((tokenOneAmount*(10**18)).toLocaleString("fullwide", {useGrouping: false})))
          }else{
          tx = await router.swapExactTokensForAVAXSupportingFeeOnTransferTokens(
            BigNumber.from((tokenOneAmount*(10**tokenOneDecimal)).toLocaleString('fullwide', {useGrouping:false})),
            BigNumber.from((Math.ceil(amountOutMin)).toLocaleString('fullwide', {useGrouping:false})),
            tokensArray,
            receiver,
            Math.ceil((Date.now())/1000) + 300)}
        }
        else{
          console.log(3)
        tx = await router.swapExactTokensForTokens(
          BigNumber.from((tokenOneAmount*(10**tokenOneDecimal)).toLocaleString('fullwide', {useGrouping:false})),
          BigNumber.from((Math.ceil(amountOutMin)).toLocaleString('fullwide', {useGrouping:false})),
          tokensArray,
          receiver,
          Math.ceil((Date.now())/1000) + 300)
        }
          const swap = await tx.wait(1);
          console.log(swap)
          if(swap){
            setIsSuccess(true)
            setTokenOneAmount(0);
            setTokenTwoAmount(0)
            const tokenOneamount = tokenOneSymbol == nativeTicker ? (((await provider.getBalance(address)).toString())/(10**18)).toString()  :((await tokenOne.balanceOf(address)).toString())/(10**tokenOneDecimal)
            const tokenTwoamount = tokenTwoSymbol == nativeTicker ? (((await provider.getBalance(address)).toString())/(10**18)).toString()  :((await tokenTwo.balanceOf(address)).toString())/(10**tokenTwoDecimal)
            setTokenOneBal(tokenOneamount)
            setTokenTwoBal(tokenTwoamount)
            setSwapButton(false)
            console.log(swap);
          }
         
        }catch(err){
          if(err){
            if(err.data != undefined){
              setError(err.data.message)
            }else{
              setError(err.message)
            }
          }
          setIsSuccess(true)
          console.log(err)
          setSwapButton(false)  
        }
       
        
      
  }

  async function approveToken(){
    setIsSuccess(false)
    setDisabledButton(true)
    console.log(tokenOneAmount)
    console.log(tokenOneDecimal)
    try{
        const tx = await tokenOne.approve(router.address, BigNumber.from((tokenOneAmount*(10**tokenOneDecimal)).toLocaleString('fullwide', {useGrouping:false})))
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
    setInput(e.target.value);
    if(e.target.value != null){
    connection(ERC20ABI, e.target.value).then(async(res)=>{
      if(changeToken == 1){
        setTokenOne(res)
        setSymbolOne(await res.symbol())
      }else{
        setTokenTwo(res)
        setSymbolTwo(await res.symbol())
      }
      setToken(e.target.value)
    }).catch((err)=>console.log(err)) 
   }else{
    setInput("")
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
        const bal1 = tokenOneSymbol == nativeTicker ? (((await provider.getBalance(address)).toString())/(10**18)).toString()  :((await tokenOne.balanceOf(address)).toString())/(10**tokenOneDecimal)
        setTokenOneBal(bal1)
        if(nativeTicker != tokenOneSymbol){
          tokenOne.connect(signer)
        }
      }
      if(tokenTwo != null){
        const bal2 = tokenTwoSymbol == nativeTicker ? (((await provider.getBalance(address)).toString())/(10**18)).toString()  :((await tokenTwo.balanceOf(address)).toString())/tokenTwoDecimal
        setTokenTwoBal(bal2)
      }
      await router.connect(signer)
    
    }
    if(tokenOne != null || tokenTwo != null){
      UpdateSigner()
    }
    setReceiver(address)
    
  },[signer])


  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div className="setting">
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
          <Radio.Button value={10}>10%</Radio.Button>
          <Radio.Button value={15}>15%</Radio.Button>
        </Radio.Group>
        <div className="slippageInput"><div className="input">set manually</div><input className="Input"  value={slippage} onChange={handleSlippageChange}/></div>
        <div className="slippageInput"><div className="input" color="white">manual receiver</div><Checkbox className="input" onChange={handleCheck}></Checkbox></div>
      </div>
    </>
  );

  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => {setIsOpen(false) ;setToken(false); setInput("Enter Token Address....")}}
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
          {/* <InputNumber size="large" style={{ width: '100%', height:"100px" , background: "#1f2639", fontSize:"30px"}}
            placeholder="0"
            value={tokenOneAmount}
            onChange={changeAmount}
            type="number"
          
            
          /> */}
          {/* <Input
               style={{ width: '500px', height:"100px" , fontSize:"40px" , color: "white"}}
               width="400px"
               name="Test text Input"
              //  onBlur={function noRefCheck(){}}
               onChange={changeAmount}
              //   validation={{
               
              //  }}
                 value={tokenOneAmount}
                /> */}
                <input className="tokenValueInput" type="number" value={tokenOneAmount} onChange={changeAmountTwo}/>
                <input className="tokenValueInput" type="number" value={tokenTwoAmount} onChange={changeAmountOne}/>
          {/* <InputNumber size="large" style={{ width: '100%', height:"100px" }} placeholder="0" value={tokenTwoAmount} disabled={true} /> */}
          <div className="switchButton" onClick={switchTokens}>
            <ArrowDownOutlined className="switchArrow" />
          </div>
          <div className="assetOne" onClick={() => openModal(1)}>
            {tokenOneSymbol}
            <DownOutlined />
          </div>
          {tokenOne && signer ? <div className="assetOneBal"> { Number(tokenOneBal).toFixed(3)}</div> : null }
          <div className="assetTwo" onClick={() => openModal(2)}>
            {tokenTwoSymbol}
            <DownOutlined />
          </div>
          {tokenTwo && signer ? <div className="assetTwoBal"> {Number(tokenTwoBal).toFixed(3)}</div> : null}
          
        </div>
        {tokenOne != null && tokenTwo != null && tokenAllownce === true ? 
        <div className="approveButton" disabled={disabledButton} onClick={approveToken}>{disabledButton ? "Loading . . ." : "Approve"}</div> : null}
        {receive == true ? <div className="receiver"  ><input className="receiverInput" placeholder="Enter a receiver address..." onChange={handleReceiver}/></div> : null}
        <div className="swapButton" disabled={tokenOneAmount > 0 && tokenAllownce === false && swapButton == false ? false : true } onClick={Swap}>{
        tokenOneAmount > tokenOneBal ? `insufficient ${tokenOneSymbol} balance` : tokenOne && tokenTwo && tokenOne.address == WNATIVE && tokenTwo.address == WNATIVE ? tokenOneSymbol == nativeTicker ? "WRAP":"UNWRAP":swapButton ? "Loading . . ." : "Swap"}
        </div>
      </div>
    </>
  );
}

