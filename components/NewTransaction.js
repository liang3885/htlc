import { Input, Credentials, ErrorMessage} from "web3uikit"
import { contractAddresses, abi } from "../constants"
import { useMoralis, useWeb3Contract, useWeb3ExecuteFunction} from "react-moralis"
import {useState} from 'react';

import React from 'react';
import {newSecretHashPair} from "./utils"

import setUpdate from "./Header"

export default function NewTransactionTab() {

    const [update, setUpdate] = useState('')

    module.exports = {
        update
    }

    const { runContractFunction } = useWeb3Contract()

    const {chainId: chainIdHex } = useMoralis()
    
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex)
    // console.log(`ChainId is ${chainId}`)
    const htlcAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    // let receiverAddress

    // newTransaction
    const [receiverAddress, setReceiverAddress] = useState('')
    const [hashLock, setHashLock] = useState('0x...')
    const [amount, setAmount] = useState('')
    const [lockTime, setLockTime] = useState('')

    //privateKey
    const [showPrivateKey, setShowPrivateKey] = useState(false)
    const [preImage, setPreImage] = useState('')


    const [newTxSuccess, setNewTxSuccess] = useState(false)
    const [txId, setTxId] = useState('')

    /* View Functions */
    const { runContractFunction: getLastTxId } = useWeb3Contract({
        abi: abi,
        contractAddress: htlcAddress, // specify the networkId
        functionName: "getLastTxId",
        params: {},
    })

    const { runContractFunction: getTransactionInfo } = useWeb3Contract({
        abi: abi,
        contractAddress: htlcAddress, // specify the networkId
        functionName: "getTransaction",
        params: {_txId : "0xa380ca87aaa32bd10915597c655413b5964fde5a231f8a416b84dfb8c64430c9"},
    })


    const handleSubmitSuccess = async (tx) => {
        await tx.wait(1)
        const lastTxId = (await getLastTxId()).toString()
        console.log(lastTxId)
        setNewTxSuccess(true)
        setTxId(lastTxId)
        setUpdate("update")
    }

    const getTransaction = async () => {
        const txId = "0xa380ca87aaa32bd10915597c655413b5964fde5a231f8a416b84dfb8c64430c9"
        console.log(txId)
        
    }

    const { data, error, fetch, isFetching, isLoading } = useWeb3ExecuteFunction()


    
    

    const handleSubmit = async () => {
        const currentTimeStamp = parseInt(new Date().getTime() / 1000 )

        const options = {
            abi: abi,
            contractAddress: htlcAddress,
            functionName: "newTransactionByHashLock",
            params: {
                _receiver: receiverAddress,
                _hashlock : hashLock,
                _timelock : currentTimeStamp + parseInt(lockTime)
            },
            msgValue: amount,
        }
        const response = await fetch({params : options,
            onSuccess: handleSubmitSuccess})
    }

    const generateHashLock = async () => {
        const hashPair = newSecretHashPair()
        console.log(hashPair)
        setHashLock(hashPair.hash)
        setShowPrivateKey(true)
        setPreImage(hashPair.secret)
    }

    
    const handleChange = event => {
        setReceiverAddress(event.target.value);
    };

    return (
        <>
            <div className="mt-6">
                <Input
                    label="Receiver Address"
                    openByDefault
                    onChange={event => setReceiverAddress(event.target.value)}
                    value="0x...."              
                    width={620}
                />
            </div>

            <div className="mt-6">

                <div style={{display:'inline-block'}}>
                <Input
                    label="Hashlock"
                    openByDefault
                    value={hashLock}
                    onChange={event => setHashLock(event.target.value)}
                    width={620}
                />
                </div>
                    
                <div style={{display:'inline-block'}}>
                    <button
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-10"
                    onClick={generateHashLock}
                    >generateHashLock</button>
                </div>

            </div>

            

            <div  className="mt-6">

                <Input
                    label="Transfer Amount (wei)"

                    openByDefault
                    value={0}
                    type="number"
                    onChange={event => setAmount(event.target.value)}
                />
            </div>

            <div className='mt-6'>
            <Input
                        label="Lock Time (seconds)"
                        placeholder="0"
                        value={0}
                        type="number"
                        onChange={event => setLockTime(event.target.value)}
                        />
            </div>

            <div className="mt-6">
            {error &&  <div>{JSON.stringify(error.data.message)}</div>}
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-8 ml-20"
                onClick={handleSubmit}
                disabled={isLoading || isFetching}
            >

                {isLoading || isFetching ? (
                    <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                ) : (
                    "Create New Transaction"
                )}
            </button>
            </div>
            

            <hr className="mt-6"/> 
            {showPrivateKey ? 
         
            <div className="mt-6">
                Secret Key, Must Save ！！！
                <Credentials
                customize={{
                    backgroundColor: 'darkblue',
                    color: 'black',
                    fontSize: '12px',
                    margin: '20px',
                    padding: '8px 12px'
                }}
                onCopy={function noRefCheck(){}}
                onReveal={function noRefCheck(){}}
                text={preImage}
                textColor="black"
                />
            </div>  
                    : 
                    <></>

                   }

            {newTxSuccess ? 
         
            <div className="mt-6">
                Create HTL Transaction Successfully, Must Remember TxID to retrieve money ！！！
                <Credentials
                customize={{
                    backgroundColor: 'darkblue',
                    color: 'black',
                    fontSize: '12px',
                    margin: '20px',
                    padding: '8px 12px'
                }}
                onCopy={function noRefCheck(){}}
                onReveal={function noRefCheck(){}}
                text={txId}
                textColor="black"
                />
            </div>  
                 : 
                 <></>

            }

        </>  
    )
}