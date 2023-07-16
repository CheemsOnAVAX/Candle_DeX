import React, { useState, useEffect } from "react";
import {TabList, Tab, Skeleton} from "@web3uikit/core";
import { Input,  Popover, Radio, Modal, message, Slider, Row, Col, InputNumber} from "antd";
import {Contract, ethers, BigNumber} from 'ethers';
import Position from "./Liquidity";

export default function PoolCard(props){
    const {pair, address,signer, tickerOne, tickerTwo, router, tokenOne, tokenTwo}  = props;
    const [messageApi, contextHolder] = message.useMessage();
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null)
    const [balance, setBalance] = useState(null)
    const [decimal, setDecimal] = useState(null)
    const [approve, setApprove] = useState(false)
    const [isApprovePendeing, setApprovePending] = useState(false)
    const [liquidityPending, setLiquidityPending] = useState(false)
    const [liquidity, setLiquidity] = useState(null)
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState(25)
    async function getUpdate(){
        console.log(pair)
        setBalance((await pair.balanceOf(address)).toString());
        setDecimal(await pair.decimals());
    }

    async function removeLiquidity(){
      setLiquidityPending(true)
      setIsSuccess(false)
      console.log(tokenOne)
      console.log(tokenTwo)
      try{
         const tx = await router.removeLiquidity(
          tokenOne,
          tokenTwo,
          BigNumber.from(liquidity),
          0,
          0,
          address,
          (Math.ceil((Date.now())/1000) + 300).toLocaleString('fullwide', {useGrouping:false})
         )

         const Tx = await tx.wait(1);
         console.log(Tx)
         setLiquidityPending(false)
         setIsSuccess(true)
      }catch(err){
        console.log(err)
        setLiquidityPending(false)
        setError(err)
        setIsSuccess(true)

      }
    }

    async function getApprove(){
           setIsSuccess(false);
           setError(null)
           setApprovePending(true)
           try{
            await pair.connect(signer)
             const tx = await pair.approve(router.address, liquidity);
             const Tx = await tx.wait(1);
             setIsSuccess(true)
             setApprove(false)
             setApprovePending(false) 
           }catch(err){
            console.log(err.data.message)
            setIsSuccess(true)
            setApprovePending(false)
            setError(err.data.message)
           }
    }

    async function getPercentage(e){
        console.log(e)
         setInputValue(e)
         const allownce = await pair.allowance(address, router.address);
         console.log((allownce.toString()/(10**decimal)).toLocaleString('fullwide', {useGrouping:false}))
         const value = Math.ceil((balance*e)/100).toLocaleString('fullwide', {useGrouping:false});
         console.log(value)
         if(value > (allownce.toString()/(10**decimal)).toLocaleString('fullwide', {useGrouping:false})){
          setApprove(true)
         }
         setLiquidity(value);
    }
    useEffect(()=>{
        getUpdate()
     }, [signer])

    useEffect(()=>{
       getUpdate()
    }, [])

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
    
    return(
        <>
        {contextHolder}
         <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="remove Liquidity"
        width={1000}
      >
        <div className="modalContent">
            {
                balance > 0 ? 
                <>
                <Row>
            <Col span={17} >
            <Slider
          min={1}
          max={100}
          onChange={getPercentage}
          value={typeof inputValue === 'number' ? inputValue : 0}
        />
            </Col>
            <Col span={2}>
            <InputNumber
          min={1}
          max={100}
          style={{
            margin: '0 16px',
          }}
          value={inputValue}
          onChange={getPercentage}
        />
            </Col>

        </Row> 
        
        <div className="removeButtons">
          {approve == true ? <div className="approveButton" onClick={getApprove} disabled={isApprovePendeing}>sign</div> : null}
          <div className="swapButton" disabled={approve == true && liquidity <= 0 && balance < liquidity && balance == 0 && liquidityPending} onClick={removeLiquidity}>remove Liquidity</div>
        </div>
        </>

        : <div> You have no liquidity in this pair </div>
            }  
        </div>
      </Modal>
        <div className="pairCard" onClick={()=>setIsOpen(true)}>
            <div className="content">{`${tickerOne}-${tickerTwo}`}</div>
            <div className="content">{balance}</div>
        </div>
        </>
    )
}