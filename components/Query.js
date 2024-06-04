import {useState} from 'react'
import { Input, Table, Credentials} from "web3uikit"
import { useMoralis, useWeb3Contract} from "react-moralis"
import { contractAddresses, abi } from "../constants"
import { convertTimeStamp } from './utils'

export default function QueryTab() {
    const [txID, setTxID] = useState('')
    const [hasQuery, setHasQuery] = useState(false)
    const [data, setData] = useState(null)

    const { runContractFunction } = useWeb3Contract()

    const {chainId: chainIdHex } = useMoralis()
    
    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex)
    // console.log(`ChainId is ${chainId}`)
    const htlcAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    

    const query = async () => {
        console.log(txID)
        setHasQuery(true)
        const options = {
            abi : abi,
            contractAddress: htlcAddress,
            functionName: "getTransaction",
            params: {
                _txID: txID
            }
        }
        const txInfo = (await runContractFunction({params : options}))

        let d = []
        d.push(['sender', txInfo[0]])
        d.push(['receiver', txInfo[1]])
        d.push(['transfer amount (wei)', txInfo[2].toString()])
        d.push(['hashlock', txInfo[3]])
        d.push(['expiredTime', convertTimeStamp(txInfo[4].toString())])
        d.push(['status', txInfo[5] ? 'withdraw' : txInfo[6] ? 'refunded' : 'waiting'])
        d.push([
            'secret key', 
            txInfo[7] ? 
            <Credentials
                customize={{
                    backgroundColor: 'darkblue',
                    color: 'black',
                    fontSize: '12px',
                    margin: '10px',
                    padding: '1px 1px'
                }}
                // onCopy={function noRefCheck(){}}
                // onReveal={function noRefCheck(){}}
                text={txInfo[7]}
                textColor="black"
                />
                : ''
        ])
        setData(d)
    }

    return (
        <>
        <div className="mt-6">

        <div style={{display:'inline-block'}}>
        <Input
            label="Transaction ID"
            openByDefault
            value={txID}
            onChange={event => setTxID(event.target.value)}
            width={620}
        />
        </div>
            
        <div style={{display:'inline-block'}}>
            <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-10"
            onClick={query}
            >query</button>
        </div>

        </div>

        <hr className="mt-6"/> 
        
        {hasQuery ? 
        <Table className='mt-6'
        columnsConfig="250px 1000px"
        noPagination
        data={data}
      //   sender receiver amount(wei) hashLock secretKey createdAt expiredTime status
        header={[]}
        />
                : 
                <></>

                }
        
        </>
    )
}