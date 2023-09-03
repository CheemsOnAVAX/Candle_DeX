import React, { useState, useEffect } from "react";
import { Input,  Popover, Radio, Modal, message, Checkbox} from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {TabList, Tab, Skeleton} from "@web3uikit/core";
import axios from "axios";
import connection from "ethereactjs/menu";
import {Contract, ethers, BigNumber, utils} from 'ethers';
import { ERC20ABI,pairABI, nativeTicker, USDC,  WNATIVE} from "../contracts/ERC20";
import Token from  "../components/tokenChoice";
import Pools from "../components/pools"




export default  function Position(props) {
    const {chainId,  address, signer, router, factory, provider } = props;
    const [messageApi, contextHolder] = message.useMessage();
    const [approveOneLoading, setApproveOneLoading] = useState(false);
    const [approveTwoLoading, setApproveTwoLoading] = useState(false);
    const [liquidityLoading, setLiquidityLoading] = useState(false);
    const [tokenOneAmount, setTokenOneAmount] = useState(0);
    const [tokenTwoAmount, setTokenTwoAmount] = useState(0);
    const [tokenOneSymbol, setSymbolOne] = useState("enter Token");
    const [tokenTwoSymbol, setSymbolTwo] = useState("enter token");
    const [tokenOne, setTokenOne] = useState(null);
    const [tokenTwo, setTokenTwo] = useState(null);
    const [pair, setPair] = useState(null);
    const [tokenOneBal, setTokenOneBal] = useState(0);
    const [tokenTwoBal, setTokenTwoBal] = useState(0);
    const [tokenOneDecimal, setTokenOneDecimal] = useState(null);
    const [tokenTwoDecimal, setTokenTwoDecimal] = useState(null);
    const [tokenOneApproved, setOneApproved] = useState(false);
    const [tokenTwoApproved, setTwoApproved] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [changeToken, setChangeToken] = useState(1);
    const [error, setError] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [token, setToken] = useState(false)
    const [input, setInput] = useState("Enter token address...")
    const [receive, setReceive] = useState(false);
    const [receiver, setReceiver] = useState(address);

  console.log(factory)
  console.log(router)
  console.log(address)
  console.log(receiver)


  function changeOneAmount(e) { 
    getTokenTwoAmount(e.target.value)
  }

  async function getTokenTwoAmount(input){
    setTokenOneAmount(Number(input))
    if(input != "" && pair != null){
       if(pair != null){
            const firstToken = await pair.token0();
            const reserves = await pair.getReserves();
            const reserveOne = reserves[0].toString();
            const reserveTwo = reserves[1].toString();
            if(reserveOne > 0 && reserveTwo > 0){
            var tokenPrice;
            if(firstToken === tokenOne.address){
              tokenPrice = reserveTwo/(reserveOne)
            }else{
              tokenPrice = reserveOne/(reserveTwo)
            }
            
            const twoAmount = Number((input*(10**tokenOneDecimal)*(tokenPrice))/(10**tokenTwoDecimal))
            if(tokenTwoSymbol != nativeTicker){
              const allowanceTwo = ((await tokenTwo.allowance(address, router.address)).toString())/(10**tokenTwoDecimal);
               twoAmount> allowanceTwo ?  setTwoApproved(true) : setTwoApproved(false);
            }
            setTokenTwoAmount(twoAmount.toLocaleString('fullwide', {useGrouping:false}))  
       }}
    }

    if(tokenOneSymbol != nativeTicker){
      const allowanceOne = ((await tokenOne.allowance(address, router.address)).toString())/(10**tokenOneDecimal);
      if(input > allowanceOne){
        setOneApproved(true);
      }
    }

    
  }



function changeTwoAmount(e) {
    getTokenOneAmount(e.target.value)  
}
 
async function getTokenOneAmount(input){
  setTokenTwoAmount(Number(input))
  if(input != "" && pair != null){
     if(pair != null){
          const firstToken = await pair.token0();
          
          const reserves = await pair.getReserves();
          const reserveOne = reserves[0].toString();
          const reserveTwo = reserves[1].toString();
          if(reserveOne > 0 && reserveTwo > 0){
          var tokenPrice;
          if(firstToken === tokenOne.address){
            tokenPrice = reserveOne/ reserveTwo
          }else{
            tokenPrice = reserveTwo/reserveOne
          }
          
          const twoAmount = Number((input*(10**tokenTwoDecimal)*(tokenPrice))/(10**tokenOneDecimal))
          if(tokenOneSymbol != nativeTicker){
            const allowanceTwo = ((await tokenOne.allowance(address, router.address)).toString())/(10**tokenOneDecimal);
             twoAmount> allowanceTwo ?  setOneApproved(true) : setOneApproved(false);
          }
          setTokenOneAmount(twoAmount.toLocaleString('fullwide', {useGrouping:false}))
     }}
  }

  if(tokenTwoSymbol != nativeTicker){
    const allowanceOne = ((await tokenTwo.allowance(address, router.address)).toString())/(10**tokenTwoDecimal);
    if(input > allowanceOne){
      setTwoApproved(true);
    }
  }
}

async function getTokenName(token){   
    if(changeToken === 1 ){
      if(token === null){
        setSymbolOne(" enter token")
        setTokenOneBal(0.00)
        
      }else{
      if(token === "native"){
        if(nativeTicker == tokenTwoSymbol || `W${nativeTicker}` == tokenTwoSymbol){
          setSymbolTwo("enter token")
          setTokenTwoBal(0)
        }else{
         setTokenOne({address: WNATIVE})
         setSymbolOne(nativeTicker)
         setTokenOneDecimal(18)
         const bal = (((await provider.getBalance(address)).toString())/(10**18)).toLocaleString('fullwide', {useGrouping:false});
         setTokenOneBal(bal)
        }
      }else{ 
        const symbol = await token.symbol()
        if(symbol == tokenTwoSymbol){
          setSymbolTwo("enter token")
          setTokenTwoBal(0)
        }else if( symbol == `W${nativeTicker}` && tokenTwoSymbol == nativeTicker){
          setSymbolTwo("enter token")
          setTokenTwoBal(0)
        }else{
        setSymbolOne(symbol)
        const decimal =  await token.decimals();
        setTokenOneDecimal(decimal)
        const bal = ((await token.balanceOf(address)).toString())/(10**decimal)
        setTokenOneBal(bal)
      }}
      if(tokenTwo != null){
          console.log(tokenTwo.address)
          const pairAddress = await factory.getPair(token == "native" ? WNATIVE : tokenOne.address, tokenTwo.address);
          if(pairAddress !== "0x0000000000000000000000000000000000000000"){
            const pairContract = await connection(pairABI, pairAddress)
            console.log({pairContract})
            setPair(pairContract)
            
            // .then((res)=>setPair(res)).catch((err)=>console.log(err))
        }else{
            setPair(null)
        }
        }
      } 
    }
    if(changeToken === 2){
      if(token === null){
        setSymbolTwo(" enter token")
        setTokenTwoBal(0.00)
        
      }else{
        if(token == "native"){
          if(nativeTicker == tokenOneSymbol || `W${nativeTicker}` == tokenOneSymbol){
            setSymbolOne("enter token")
            setTokenOneBal(0)
          } 
          else{
          setTokenTwo({address: WNATIVE})
          setSymbolTwo(nativeTicker)
          setTokenTwoDecimal(18)
          const bal = (((await provider.getBalance(address)).toString())/(10**18)).toLocaleString('fullwide', {useGrouping:false});
          setTokenTwoBal(bal)
       }}
       else{
        const symbol = await token.symbol()
        if(symbol == tokenOneSymbol){
          setSymbolOne("enter token")
          setTokenOneBal(0)

        }else if( symbol == `W${nativeTicker}` && tokenOneSymbol == nativeTicker){
          setSymbolOne("enter token")
          setTokenOneBal(0)
        }else{
        setSymbolTwo(symbol)
        const decimal = await token.decimals();
        setTokenTwoDecimal(decimal)
        const bal = ((await token.balanceOf(address)).toString())/(10**decimal)
        setTokenTwoBal(bal)
        }
       }
        if(tokenOne != null){
          console.log(tokenOne.address)
          const pairAddress = await factory.getPair(tokenOne.address, token == "native" ? WNATIVE : tokenTwo.address);
          if(pairAddress !== "0x0000000000000000000000000000000000000000"){
            const pairContract = await connection(pairABI, pairAddress)
            console.log({pairContract})
            setPair(pairContract)
            
            // .then((res)=>setPair(res)).catch((err)=>console.log(err))
          }else{
            setPair(null)
          }
        
      }  
      }
   }
    
 }

 

  function openModal(asset) {
    setChangeToken(asset);
    setIsOpen(true);
    setToken(false);
  }

 async function modifyToken(){
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    setIsOpen(false);
    setInput(null)
  }

  async function addLiquidity(){  
        try{
          setLiquidityLoading(true)
          var tx;
          if(tokenOneSymbol == nativeTicker){
            console.log((BigNumber.from(((tokenTwoAmount.toLocaleString('fullwide', {useGrouping:false}))*(10**tokenTwoDecimal)).toLocaleString('fullwide', {useGrouping:false}))).toString())
            console.log((utils.parseUnits(tokenOneAmount.toLocaleString('fullwide', {useGrouping:false}), "ether")).toString())
            console.log(tokenTwo.address);
            console.log(receiver)
            console.log(BigNumber.from((Math.ceil((Date.now())/1000) + 300).toLocaleString('fullwide', {useGrouping:false})).toString())
            tx = await router.addLiquidityAVAX(
              tokenTwo.address, 
              BigNumber.from(((tokenTwoAmount.toLocaleString('fullwide', {useGrouping:false}))*(10**tokenTwoDecimal)).toLocaleString('fullwide', {useGrouping:false})),
              0,
              0,
              receiver,
              BigNumber.from((Math.ceil((Date.now())/1000) + 300).toLocaleString('fullwide', {useGrouping:false})),
              { 
                gasLimit: BigNumber.from("500000"),
                value: utils.parseUnits(tokenOneAmount.toString(), "ether")
              }
            )
          }else if(tokenTwoSymbol == nativeTicker){
            tx = await router.addLiquidityAVAX(
              tokenOne.address, 
              BigNumber.from(((tokenOneAmount.toLocaleString('fullwide', {useGrouping:false}))*(10**tokenOneDecimal)).toLocaleString('fullwide', {useGrouping:false})),
              0,
              0,
              receiver,
              BigNumber.from((Math.ceil((Date.now())/1000) + 300).toLocaleString('fullwide', {useGrouping:false})),
              { 
                // gasPrice: utils.parseUnits((await provider.getGasPrice()).toString(), "gwei"),
                gasLimit: BigNumber.from("500000"),
                value: utils.parseUnits(tokenTwoAmount.toString(), "ether")
              }
            )
          }else{
        tx = await router.addLiquidity(
          tokenOne.address, 
          tokenTwo.address, 
          BigNumber.from(((tokenOneAmount.toLocaleString('fullwide', {useGrouping:false}))*(10**tokenOneDecimal)).toLocaleString('fullwide', {useGrouping:false})),
          BigNumber.from(((tokenTwoAmount.toLocaleString('fullwide', {useGrouping:false}))*(10**tokenTwoDecimal)).toLocaleString('fullwide', {useGrouping:false})),
          0,
          0,
          receiver,
          BigNumber.from((Math.ceil((Date.now())/1000) + 300).toLocaleString('fullwide', {useGrouping:false}))
          )}
          const swap = await tx.wait(1);
          if(swap){  setLiquidityLoading(false)
            setIsSuccess(true)
            setTokenOneAmount(0);
            setTokenTwoAmount(0)
            const tokenOneamount = tokenOneSymbol == nativeTicker ? (((await provider.getBalance(address)).toString())/(10**18)).toString()  :((await tokenOne.balanceOf(address)).toString())/(10**tokenOneDecimal)
            const tokenTwoamount = tokenTwoSymbol == nativeTicker ? (((await provider.getBalance(address)).toString())/(10**18)).toString()  :((await tokenTwo.balanceOf(address)).toString())/(10**tokenOneDecimal)
            setTokenOneBal(tokenOneamount)
            setTokenTwoBal(tokenTwoamount)
            console.log(swap);}
          
         
        }catch(err){
          console.log(err.message)  
          setError(err.message)
          setIsSuccess(true)
          setLiquidityLoading(false)
        }
       
        
      
  }

  async function approveToken(asset){
    asset == 1 ? setApproveOneLoading(true) : setApproveTwoLoading(true)
    setError(null)
    setIsSuccess(false)
    try {
        let Tx
        if(asset === 1){
            await tokenOne.connect(signer)
            console.log(tokenOneAmount*tokenOneDecimal)
            Tx = await tokenOne.approve(router.address, BigNumber.from((tokenOneAmount*(10**tokenOneDecimal)).toLocaleString('fullwide', {useGrouping:false})))
          
        }
        if(asset === 2){
          await tokenTwo.connect(signer)
            Tx = await tokenTwo.approve(router.address, BigNumber.from((tokenTwoAmount*(10**tokenTwoDecimal)).toLocaleString('fullwide', {useGrouping:false})))
        }
        const tx =  await Tx.wait(1)
          setIsSuccess(true)
          asset == 1 ? setOneApproved(false) : setTwoApproved(false)
          asset == 1 ? setApproveOneLoading(false) : setApproveTwoLoading(false)
          console.log(tx)
        
      }catch(err){
        if(err.data != undefined){
        setError(err.data.message)
        }else{
        console.log(err.message)
        setError(err.message)}
        setIsSuccess(true)
        asset == 1 ? setApproveOneLoading(false) : setApproveTwoLoading(false)
      } 
   
  }

  const getContract = (e)=>{
    setInput(e.target.value)
    connection(ERC20ABI, e.target.value).then((res)=>{
      console.log(changeToken)
      console.log(res)
      changeToken == 1 ? setTokenOne(res) : setTokenTwo(res)
      setToken(res.address)
    }).catch((err)=>console.log(err))
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
    setToken(false)
    setInput("Enter token address....")
  }

  async function getToken(token) {
    connection(ERC20ABI, token).then(async(res)=>{
      if(changeToken === 1){
        setTokenOne(res)
        await res.connect(signer)
      }else{
        setTokenTwo(res)
        await res.connect(signer)
      }
      setToken(true);
    }).catch((err)=>console.log(err))
    
  }

useEffect(()=>{
  changeToken == 1 ? getTokenName(tokenOne) : getTokenName(tokenTwo)
},[tokenOne, tokenTwo])
  

  

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
    const UpdateSigner = async ()=>{
      if(tokenOne != null){
        const bal1 = tokenOneSymbol == nativeTicker ? (((await provider.getBalance(address)).toString())/(10**18)).toString()  :((await tokenOne.balanceOf(address)).toString())/(10**tokenOneDecimal)
        setTokenOneBal(bal1)
        if(tokenOneSymbol != nativeTicker){
        tokenOne.connect(signer)
        }
      }
      if(tokenTwo != null){
        const bal2 = tokenTwoSymbol == nativeTicker ? (((await provider.getBalance(address)).toString())/(10**18)).toString()  :((await tokenTwo.balanceOf(address)).toString())/(10**tokenOneDecimal)
        setTokenTwoBal(bal2)
        if(tokenTwoSymbol != nativeTicker){
        tokenTwo.connect(signer)
        }
      }
    
    }
    if(tokenOne != null || tokenTwo != null){
      UpdateSigner()
    }
  },[signer])

  function handleCheck(e){
    setReceive(e.target.checked);
    setReceiver(address)
  }
  function handleReceiver(e){
    setReceiver(e.target.value)
  }

  function handleReceiver(e){
    setReceiver(e.target.value)
  }

  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div className="setting">
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
        onCancel={() => {setIsOpen(false) ; setToken(false) ; setInput("Enter token Address...")}}
        title="Select a token"
        width={1000}
      >
        <div className="modalContent">
             
        <input className="searchInput" placeholder="Enter token address..."  value={input} onClick={()=>setInput("")} onChange={getContract} />
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
       <div className = "liquiditySettings">
       <Popover
            content={settings}
            title="Settings"
            trigger="click"
            placement= "bottomLeft"
          >
            <SettingOutlined className="cog" />
          </Popover>
        </div> 
      <TabList
        defaultActiveKey={1}
        isWidthAuto
        onChange={function noRefCheck(){}}
        tabStyle="bar"
        style = {{color: "white"}}
      >
  <Tab
    lineHeight={30}
    tabKey={1}
    tabName="AddLiquidity"
    style = {{color: "black", backgroundColor: "black"}}
  >
    <div className="inputs">
          <Input
            placeholder="0"
            value={tokenOneAmount}
            onChange={changeOneAmount}
          />
          <Input placeholder="0" 
                 value={tokenTwoAmount}
                 onChange={changeTwoAmount} />
         
          <div className="assetOne" onClick={() => openModal(1)}>
            {tokenOneSymbol}
            <DownOutlined />
          </div>
          {tokenOne && signer ? <div className="assetOneBal"> {Number(tokenOneBal).toFixed(3)}</div> : null }
          <div className="assetTwo" onClick={() => openModal(2)}>
            {tokenTwoSymbol}
            <DownOutlined />
          </div>
          {tokenTwo && signer ? <div className="assetTwoBal"> {Number(tokenTwoBal).toFixed(3)}</div> : null}
          
        </div>

        { tokenOneApproved == true  && tokenOneAmount <= tokenOneBal? 
        <div className="approveButton"  onClick={()=>approveToken(1)}  disabled={approveOneLoading} > {approveOneLoading ? "Pending . . ." :  `Approve ${tokenOneSymbol}`}</div> : null}
        { tokenTwoApproved == true && tokenTwoAmount <= tokenTwoBal? 
        <div className="approveButton"  onClick={()=>approveToken(2)} disabled={approveTwoLoading} >{approveTwoLoading ? "Pending . . ." :  `Approve ${tokenTwoSymbol}`}</div> : null}
        {receive == true ? <div className="receiver"  ><input className="receiverInput" placeholder="Enter a receiver address..." onChange={handleReceiver}/></div> : null}
        <div className="swapButton" disabled={tokenOneAmount > 0 && tokenOneApproved == false && tokenTwoBal >= tokenTwoAmount && tokenOneBal >= tokenOneAmount && tokenTwoAmount > 0 && tokenTwoApproved == false && liquidityLoading == false ? false : true } onClick={addLiquidity}>{
          tokenOne && tokenTwo ? tokenOneBal < tokenOneAmount ? 
          `insufficient ${typeof tokenOneBal} ${typeof tokenOneAmount} ${tokenOneBal < tokenOneAmount} balance `  : tokenTwoBal < tokenTwoAmount ? 
          `insufficient ${tokenTwoSymbol} balance `  : liquidityLoading ? "Pending . . ." : "add Liquidity" : "add Liquidity"
        }</div>
  </Tab>
  <Tab
    lineHeight={30}
    tabKey={2}
    tabName="My Pools"
  >
  <Pools signer={signer} address={address} factory={factory} router={router} provider={provider} receive={receive} />
  </Tab>
  </TabList>
 
        </div>

        
      </div>
    </>
  );
}

