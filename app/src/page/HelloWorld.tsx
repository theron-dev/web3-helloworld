import { Button, Select, Textarea } from "flowbite-react";
import { useState } from "react";
import { getBalances } from "../core/balance";
import { CurrencyValue } from "../core/currency";
import { getErrmsg } from "../core/error";
import { graph } from "../core/graph";
import { Network, Networks } from "../core/network";
import { connect, disconnect, switchNetwork, WalletType } from "../core/wallet";
import useNetwork from "../use/useNetwork";
import useWallet from "../use/useWallet";
import useWalletReady from "../use/useWalletReady";


function HelloWorld() {
  let [network,] = useNetwork()
  let [ready,] = useWalletReady()
  let [wallet,] = useWallet()
  let [balances, setBalances] = useState<CurrencyValue[]>()
  let [currNetwork, setCurrNetwork] = useState<Network>()
  let [graphql, setGraphql] = useState(`{
  balances(first: 5) {
    value
    owner
    tx
    block
    time
  }
}`)

  let [variables, setVariables] = useState(`{}`)
  let [graphResult, setGraphResult] = useState('')

  if (!ready) {
    return <></>
  }

  if (!wallet || !network) {
    return <div className="container mx-auto px-2 sm:max-w-7xl sm:p-4">
      <Button onClick={() => {
        connect(WalletType.METAMASK).then(() => { }, (reason) => {
          alert(getErrmsg(reason))
        })
      }}>MetaMask</Button>
      <Button onClick={() => {
        connect(WalletType.WALLETCONNECT).then(() => { }, (reason) => {
          alert(getErrmsg(reason))
        })
      }}>Wallet Connect</Button>
    </div>
  }

  if (currNetwork !== network) {
    setCurrNetwork(network)
    getBalances(wallet, wallet.addr, network.currencys).then((rs) => {
      setBalances(rs)
    }, (reason) => {
      alert(getErrmsg(reason))
    })
  }


  return <div className="container mx-auto max-w-xl p-4">

    <p>WALLET: {wallet.addr}</p>
    <p>NETWORK:
      <Select value={network.chainId} onChange={
        (e) => {
          for (let network of Networks) {
            if (network.chainId === e.currentTarget.value) {
              switchNetwork(wallet!, network)
              break
            }
          }
        }
      }>
        {
          Networks.map((item) => (
            <option value={item.chainId}>{item.title}</option>
          ))
        }
      </Select>
    </p>

    <p>BALANCE:</p>
    {
      (balances || []).map((item) => (
        <span>{item.value} {item.currency.symbol}</span>
      ))
    }


    <Button onClick={() => {
      disconnect(wallet!)
    }}>Disconnect</Button>

    <p>graphql:
      <Textarea value={graphql} onChange={(e) => setGraphql(e.currentTarget.value)}></Textarea>
    </p>
    <p>variables:
      <Textarea value={variables} onChange={(e) => setVariables(e.currentTarget.value)}></Textarea>
    </p>
    <pre>{graphResult}
    </pre>
    <Button onClick={() => {
      setGraphResult('...')
      graph(graphql, JSON.parse(variables)).then((rs) => {
        setGraphResult(JSON.stringify(rs, undefined, 2))
      }, (reason) => {
        setGraphResult(getErrmsg(reason))
      });
    }}>Graph Query</Button>

  </div>
}

export default HelloWorld;
