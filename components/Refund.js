import { Input} from "web3uikit"
import {useState} from 'react'
import { contractAddresses, abi } from "../constants"
import { useMoralis,  useWeb3ExecuteFunction} from "react-moralis"

export default function RefundTab() {

    const {chainId: chainIdHex } = useMoralis()
    
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex)
    // console.log(`ChainId is ${chainId}`)
    const htlcAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    

    const [txID, setTxID] = useState('')

    const [refundSuccess, setRefundSuccess] = useState(false)

    const { data, error, fetch, isFetching, isLoading } = useWeb3ExecuteFunction()


    const handleSubmitSuccess = async (tx) => {
        setRefundSuccess(true)
    }

    const handleSubmit = async () => {
        console.log(txID)
        const options = {
            abi: abi,
            contractAddress: htlcAddress,
            functionName: "refund",
            params: {
                _txID: txID
            }
        }
        const response = await fetch({params : options,
            onSuccess: handleSubmitSuccess})
    }

    return (
        <>
        <div className="mt-6">
            <Input
                label="Transaction ID"
                openByDefault
                onChange={event => setTxID(event.target.value)}
                value="0x"              
                width={620}
            />
        </div>

        
        <div className="mt-6">
        {error &&  <div>{JSON.stringify(error.data.message)}</div>}
        <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-8"
                onClick={handleSubmit}
                disabled={isLoading || isFetching}
            >
                {isLoading || isFetching ? (
                    <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                ) : (
                    "Refund"
                )}
        </button>
        </div>

        <hr className="mt-6"/>
        {refundSuccess ? 
         
         <div className="mt-6">
             Refund Successfully ！！！
         </div>  
              : 
              <></>
         }

        </>
    )
}