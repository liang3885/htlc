import { contractAddresses, abi } from "../constants"
// dont export from moralis when using react
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { useNotification } from "web3uikit"
// import { ethers } from "ethers"
import { TabList, Tab} from "web3uikit"

import NewTransactionTab from "./NewTransaction"
import WithdrawTab from "./Withdraw"
import RefundTab from "./Refund"
import QueryTab from "./Query"

export default function HTLC() {
    const {chainId: chainIdHex } = useMoralis()

    // These get re-rendered every time due to our connect button!
    const chainId = parseInt(chainIdHex)
    // console.log(`ChainId is ${chainId}`)
    const htlcAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    // State hooks
    // https://stackoverflow.com/questions/58252454/react-hooks-using-usestate-vs-just-variables

    return (
        <div className="p-5">
            {htlcAddress ? (
                <>
                <TabList
                defaultActiveKey={1}
                onChange={function noRefCheck(){}}
                tabStyle="bar"
                >
                <Tab
                    tabKey={1}
                    tabName={<div style={{display: 'flex'}}>{' '}<span style={{paddingLeft: '4px'}}>NewTransaction{' '}</span></div>}
                >
                    <NewTransactionTab/>
                </Tab>
                <Tab
                    tabKey={2}
                    tabName={<div style={{display: 'flex'}}><span style={{paddingLeft: '4px'}}>Withdraw{' '}</span></div>}
                >
                    <WithdrawTab></WithdrawTab>
                </Tab>
                <Tab
                    tabKey={3}
                    tabName={<div style={{display: 'flex'}}><span style={{paddingLeft: '4px'}}>Refund{' '}</span></div>}
                >
                    <RefundTab></RefundTab>
                </Tab>
                <Tab
                    tabKey={4}
                    tabName={<div style={{display: 'flex'}}><span style={{paddingLeft: '4px'}}>Query Transaction{' '}</span></div>}
                >
                    <QueryTab></QueryTab>
                </Tab>

                </TabList>
                </>
            ) : (
                <div>Please connect to a supported chain </div>
            )}
        </div>
    )
}
