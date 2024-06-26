import { ConnectButton } from "web3uikit"

import update from "./NewTransaction"

function ConnectWallet() {
    return <ConnectButton moralisAuth={false}></ConnectButton>;
  }
  

export default function Header() {

    return (
        <nav className="p-5 border-b-2 flex flex-row">
            <h1 className="py-4 px-4 font-bold text-3xl"> Atomic Swap</h1>
            <div className="ml-auto py-2 px-4">
            {/* <ConnectButton moralisAuth={false} update = {update} ></ConnectButton> */}
           <ConnectWallet update={update} ></ConnectWallet>

            </div>
        </nav>
    )
}

