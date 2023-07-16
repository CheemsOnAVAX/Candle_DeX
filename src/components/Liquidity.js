import React, { useState, useEffect } from "react";
import { Input,  Popover, Radio, Modal, message} from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {TabList, Tab, Skeleton} from "@web3uikit/core";
import axios from "axios";
import connection from "ethereactjs/menu";
import {Contract, ethers, BigNumber} from 'ethers';
import { ERC20ABI,  pairABI} from "../contracts/ERC20";
import Pools from "../components/pools"




export default  function Position(props) {
    const {chainId,  address, signer, router, factory } = props;
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

  console.log(factory)



  async function changeOneAmount(e) { 
    setTokenOneAmount(e.target.value)
    const input = e.target.value
    if(e.target.value && pair != null){
      console.log(pair)
       if(pair != null){
            const firstToken = await pair.token0();
            const allowanceOne = ((await tokenOne.allowance(address, router.address)).toLocaleString('fullwide', {useGrouping:false}))/tokenOneDecimal;
            if(e.target.value > allowanceOne){
              setOneApproved(true);
            }
            
            const reserves = await pair.getReserves();
            const reserveOne = reserves[0].toLocaleString('fullwide', {useGrouping:false});
            const reserveTwo = reserves[1].toLocaleString('fullwide', {useGrouping:false});
            var tokenPrice;
            if(firstToken === tokenOne.address){
              tokenPrice = reserveTwo/(reserveOne)
            }else{
              tokenPrice = reserveOne/(reserveTwo)
            }
            const allowanceTwo = ((await tokenTwo.allowance(address, router.address)).toLocaleString('fullwide', {useGrouping:false}))/tokenTwoDecimal;
            const _tokenDecimal = await tokenTwo.decimals();
            const twoAmount = ((input*tokenOneDecimal*(tokenPrice))/tokenTwoDecimal).toFixed(_tokenDecimal)
            if(twoAmount > allowanceTwo){
              setTwoApproved(true);
            }
            setTokenTwoAmount(twoAmount.toLocaleString('fullwide', {useGrouping:false}))  
       }
    }
  }

  async function changeTwoAmount(e) {
 
    setTokenTwoAmount(e.target.value)
    if(e.target.value && pair != null){
       if(pair != null){
            const firstToken = await pair.token0();
            const allowanceTwo = ((await tokenOne.allowance(address, router.address)).toLocaleString('fullwide', {useGrouping:false}))/tokenTwoDecimal;
            if(e.target.value > allowanceTwo){
              setTwoApproved(true);
            }
            
            const reserves = await pair.getReserves();
            const reserveOne = reserves[0].toLocaleString('fullwide', {useGrouping:false});
            const reserveTwo = reserves[1].toLocaleString('fullwide', {useGrouping:false});
            var tokenPrice;
            if(firstToken === tokenTwo.address){
              tokenPrice = reserveTwo/(reserveOne)
            }else{
              tokenPrice = reserveOne/(reserveTwo)
            }
            const allowanceOne = ((await tokenOne.allowance(address, router.address)).toLocaleString('fullwide', {useGrouping:false}))/tokenOneDecimal;
            const _tokenDecimal = await tokenOne.decimals();
            const OneAmount = (((e.target.value)*tokenTwoDecimal*(tokenPrice))/tokenOneDecimal).toFixed(_tokenDecimal)
            if(OneAmount > allowanceOne){
              setOneApproved(true);
            }
            setTokenOneAmount(OneAmount.toLocaleString('fullwide', {useGrouping:false}))  
       }
    }
    }

 async function getTokenName(token){   
    console.log(token)
    if(changeToken === 1 ){
      if(token === null){
        setSymbolOne(" enter token")
        setTokenOneBal(0.00)
        
      }else{
        setTokenOne(token)
        console.log(token)
        const symbol = await token.symbol()
        setSymbolOne(symbol)
        
        const decimal = 10**(await token.decimals());
        setTokenOneDecimal(decimal)
        const bal = ((await token.balanceOf(address)).toString())/decimal
        setTokenOneBal(bal)
        if(tokenTwo != null){
          console.log(tokenTwo.address)
          const pairAddress = await factory.getPair(token.address, tokenTwo.address);
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
        setTokenTwo(token)
        setSymbolTwo(await token.symbol())
        const decimal = 10**(await token.decimals());
        setTokenTwoDecimal(decimal)
        const bal = ((await token.balanceOf(address)).toString())/decimal
        console.log(bal)
        setTokenTwoBal(bal)
        if(tokenOne != null){
          console.log(tokenOne.address)
          const pairAddress = await factory.getPair(tokenOne.address, token.address);
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
  }

 async function modifyToken(){
    setTokenOneAmount(null);
    setTokenTwoAmount(null);
    if (changeToken === 1) {
     await tokenOne.connect(signer);
    } 
    if(changeToken === 2){
        await tokenTwo.connect(signer);
    }
    setIsOpen(false);
  }

  async function addLiquidity(){  
        try{
            setLiquidityLoading(true)
        console.log(tokenOneAmount*tokenOneDecimal)
        console.log(tokenTwoAmount*tokenTwoDecimal)
        console.log((BigNumber.from((tokenTwoAmount*tokenTwoDecimal).toString())).toString())
        const tx = await router.addLiquidity(
            tokenOne.address, 
            tokenTwo.address, 
          BigNumber.from((tokenOneAmount*tokenOneDecimal).toLocaleString('fullwide', {useGrouping:false})),
          BigNumber.from((tokenTwoAmount*tokenTwoDecimal).toLocaleString('fullwide', {useGrouping:false})),
          0,
          0,
          address,
          BigNumber.from((Math.ceil((Date.now())/1000) + 300).toLocaleString('fullwide', {useGrouping:false}))
          )
          const swap = await tx.wait(1);
            setLiquidityLoading(false)
            setIsSuccess(true)
            setTokenOneAmount(0);
            setTokenTwoAmount(0)
            const tokenOneamount = (await tokenOne.balanceOf(address)).toString()/tokenOneDecimal
            const tokenTwoamount = (await tokenTwo.balanceOf(address)).toString()/tokenTwoDecimal
            setTokenOneBal(tokenOneamount)
            setTokenTwoBal(tokenTwoamount)
            console.log(swap);
          
         
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
            console.log(tokenOneAmount*tokenOneDecimal)
            Tx = await tokenOne.approve(router.address, BigNumber.from((tokenOneAmount*tokenOneDecimal).toLocaleString('fullwide', {useGrouping:false})))
          
        }
        if(asset === 2){
            Tx = await tokenOne.approve(router.address, BigNumber.from((tokenOneAmount*tokenOneDecimal).toLocaleString('fullwide', {useGrouping:false})))
        }
        const tx =  await Tx.wait(1)
          setIsSuccess(true)
          asset == 1 ? setOneApproved(false) : setTwoApproved(false)
          asset == 1 ? setApproveOneLoading(false) : setApproveTwoLoading(false)
          console.log(tx)
        
      }catch(err){
        console.log(err.message)
        setError(err.message)
        setIsSuccess(true)
        asset == 1 ? setApproveOneLoading(false) : setApproveTwoLoading(false)
      } 
   
  }

  const getContract = (e)=>{
    connection(ERC20ABI, e.target.value).then((res)=>{
      console.log(changeToken)
      console.log(res)
      changeToken == 1 ? setTokenOne(res) : setTokenTwo(res)
      getTokenName(res)
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
        const bal1 = ((await tokenOne.balanceOf(address)).toString())/tokenOneDecimal
        setTokenOneBal(bal1)
        tokenOne.connect(signer)
      }
      if(tokenTwo != null){
        const bal2 = ((await tokenTwo.balanceOf(address)).toString())/tokenTwoDecimal
        setTokenTwoBal(bal2)
        tokenTwo.connect(signer)
      }
    
    }
    if(tokenOne != null || tokenTwo != null){
      UpdateSigner()
    }
  },[signer])




  

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
                onClick={()=>modifyToken()}
              >
                <div className="tokenChoiceNames">
                  <div className="tokenName">{changeToken === 1 ? tokenOneSymbol : tokenTwoSymbol}</div>
                </div>
              </div>
           
        </div>
      </Modal>
      <div className="tradeBox">
        <div className="tradeBoxHeader">
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
          {tokenOne && signer ? <div className="assetOneBal"> {tokenOneBal.toFixed(6)}</div> : null }
          <div className="assetTwo" onClick={() => openModal(2)}>
            {tokenTwoSymbol}
            <DownOutlined />
          </div>
          {tokenTwo && signer ? <div className="assetTwoBal"> {tokenTwoBal.toFixed(6)}</div> : null}
          
        </div>

        { tokenOneApproved == true  && tokenOneAmount <= tokenOneBal? 
        <div className="approveButton"  onClick={()=>approveToken(1)}  disabled={approveOneLoading} > {approveOneLoading ? "Pending . . ." :  `Approve ${tokenOneSymbol}`}</div> : null}
        { tokenTwoApproved == true && tokenTwoAmount <= tokenTwoBal? 
        <div className="approveButton"  onClick={()=>approveToken(2)} disabled={approveTwoLoading} >{approveTwoLoading ? "Pending . . ." :  `Approve ${tokenTwoSymbol}`}</div> : null}
        <div className="swapButton" disabled={tokenOneAmount > 0 && tokenOneApproved == false && tokenTwoBal >= tokenTwoAmount && tokenOneBal >= tokenOneAmount && tokenTwoAmount > 0 && tokenTwoApproved == false && liquidityLoading == false ? false : true } onClick={addLiquidity}>{
          tokenOne && tokenTwo ? tokenOneBal < tokenOneAmount ? 
          `insufficient ${tokenOneSymbol} balance `  : tokenTwoBal < tokenTwoAmount ? 
          `insufficient ${tokenTwoSymbol} balance `  : liquidityLoading ? "Pending . . ." : "add Liquidity" : "add Liquidity"
        }</div>
  </Tab>
  <Tab
    lineHeight={30}
    tabKey={2}
    tabName="My Pools"
  >
  <Pools signer={signer} address={address} factory={factory} router={router} />
  </Tab>
  </TabList>
        </div>
       
        
      </div>
    </>
  );
}

