/**
 * https://github.com/WalletConnect/web3modal/
 */

import Web3 from "web3"
import { getCurrencyByNetwork } from "./currency"
import { Event } from "./event"
import { Network, Networks, NetworkSet } from "./network"
import WalletConnectProvider from "@walletconnect/web3-provider";

let _event = new Event()

export enum WalletType {
    METAMASK = 0,
    WALLETCONNECT = 1,
}

export var WalletTypeNames = ['MetaMask']

export interface WalletConnect {
    type: WalletType
    title: string
    icon: string
    url: string
}

export var WalletConnects: WalletConnect[] = [
    {
        type: WalletType.METAMASK,
        title: "MetaMask",
        icon: "metamask",
        url: "https://metamask.io"
    },
    {
        type: WalletType.WALLETCONNECT,
        title: "WalletConnect",
        icon: "walletconnect",
        url: "https://walletconnect.com"
    }
];

export enum WalletEvent {
    CHANGED = "change",
    DISCONNECTED = "disconnected",
    CONNECTED = "connected",
    CHAIN_CHANGED = "chainChanged",
    CURRENT_CHANGED = "currentChanged",
    READY = "ready",
}

export function on(name: WalletEvent, fn: (name: string, type: WalletType) => void) {
    _event.on(name, fn)
}

export function off(name?: WalletEvent, fn?: (name: string, type: WalletType) => void) {
    _event.off(name, fn)
}

export interface Wallet {
    /**
     * 钱包类型
     */
    type: WalletType,
    /**
     * 钱包地址
     */
    addr: string
    /**
     * 网络
     */
    chainId: string
}

/**
 * 检查钱包是否可用
 * @param type 
 * @returns 
 */
export function isAvailable(type: WalletType): boolean {
    switch (type) {
        case WalletType.METAMASK:
            return (window as any).ethereum !== undefined
        case WalletType.WALLETCONNECT:
            return true
    }
    return false
}

interface _Web3 extends Web3 {
    chainId: string
}

let _web3Set: {
    [key: number]: _Web3
} = {}

let _walletSet: {
    [key: number]: Wallet
} = {}


let _currentWallet: Wallet | undefined

export function setCurrentWallet(wallet: Wallet | undefined) {
    if (_currentWallet !== wallet) {
        _currentWallet = wallet
        if (wallet) {
            localStorage.setItem("wallet", JSON.stringify(wallet))
        } else {
            localStorage.removeItem("wallet")
        }
        _event.emit(WalletEvent.CURRENT_CHANGED)
    }
}

export function getCurrentWallet(): Wallet | undefined {
    return _currentWallet
}

export async function getWeb3(type: WalletType): Promise<Web3> {
    let v = _web3Set[type]
    if (v === undefined) {
        if (type === WalletType.METAMASK && (window as any).ethereum) {
            let eth = (window as any).ethereum
            v = (new Web3(eth)) as _Web3;
            let chainId = await eth.request({ method: 'eth_chainId' })
            v.chainId = typeof chainId == 'number' ? '0x' + chainId.toString(16) : chainId
            _web3Set[type] = v
            eth.on('accountsChanged', (accounts: string[]) => {
                (async function () {
                    let accounts = await v.eth.getAccounts();
                    let w = _walletSet[type]
                    if (w && accounts.length > 0) {
                        if (w.addr === accounts[0]) {
                            return
                        }
                        if (_currentWallet === w) {
                            w = _walletSet[type] = { addr: accounts[0], type: type, chainId: w.chainId }
                            setCurrentWallet(w)
                        } else {
                            w.addr = accounts[0]
                        }
                    } else {
                        delete _walletSet[type]
                        if (_currentWallet === w) {
                            setCurrentWallet(undefined)
                        }
                    }
                    _event.emit(WalletEvent.CHANGED, type)

                })().then(() => { }, () => { })
            })
            eth.on('disconnect', () => {
                _event.emit(WalletEvent.DISCONNECTED, type)
            })
            eth.on('connect', (info: any) => {
                _event.emit(WalletEvent.CONNECTED, type)
            })
            eth.on('chainChanged', (chainId: string) => {
                if (v.chainId !== chainId) {
                    v.chainId = chainId
                    let w = _walletSet[type]
                    if (w) {
                        w.chainId = chainId
                        if (_currentWallet === w) {
                            _event.emit(WalletEvent.CURRENT_CHANGED)
                        }
                    }
                    _event.emit(WalletEvent.CHAIN_CHANGED, type)
                }
            })
        } else if (type === WalletType.WALLETCONNECT) {
            let rpc: any = {}
            for (let i of Networks) {
                rpc[parseInt(i.chainId)] = i.rpcUrls[0]
            }
            let eth = new WalletConnectProvider({ rpc: rpc })
            await eth.enable()
            v = (new Web3(eth as any)) as _Web3;
            let chainId = await eth.request({ method: 'eth_chainId' })
            v.chainId = typeof chainId == 'number' ? '0x' + chainId.toString(16) : chainId
            _web3Set[type] = v
            eth.on('accountsChanged', (accounts: string[]) => {
                (async function () {
                    let accounts = await v.eth.getAccounts();
                    let w = _walletSet[type]
                    if (w && accounts.length > 0) {
                        if (w.addr === accounts[0]) {
                            return
                        }
                        w.addr = accounts[0]
                        if (_currentWallet === w) {
                            _event.emit(WalletEvent.CURRENT_CHANGED)
                        }
                    } else {
                        delete _walletSet[type]
                        if (_currentWallet === w) {
                            setCurrentWallet(undefined)
                        }
                    }
                    _event.emit(WalletEvent.CHANGED, type)

                })().then(() => { }, () => { })
            })
            eth.on('disconnect', () => {
                _event.emit(WalletEvent.DISCONNECTED, type)
            })
            eth.on('connect', (info: any) => {
                _event.emit(WalletEvent.CONNECTED, type)
            })
            eth.on('chainChanged', (chainId: string | number) => {
                if (typeof chainId === 'number') {
                    chainId = '0x' + chainId.toString(16)
                }
                if (v.chainId !== chainId) {
                    v.chainId = chainId
                    let w = _walletSet[type]
                    if (w) {
                        w.chainId = chainId
                        if (_currentWallet === w) {
                            _event.emit(WalletEvent.CURRENT_CHANGED)
                        }
                    }
                    _event.emit(WalletEvent.CHAIN_CHANGED, type)
                }
            })
        }
    }
    if (v === undefined) {
        return Promise.reject(new Error('No wallet available'))
    }
    return v
}



/**
 * 链接钱包
 * @returns 
 */
export async function connect(type: WalletType): Promise<Wallet> {
    let v = _walletSet[type]
    if (v === undefined) {
        let w3 = await getWeb3(type)
        let rs: string[]
        if (type === WalletType.METAMASK) {
            rs = await w3.eth.requestAccounts()
        } else {
            rs = await w3.eth.getAccounts();
        }
        if (rs.length > 0) {
            v = { addr: rs[0], type: type, chainId: (w3 as _Web3).chainId }
            _walletSet[type] = v
        }
    }
    if (v === undefined) {
        setCurrentWallet(v)
        return Promise.reject(new Error('No wallet available'))
    }
    setCurrentWallet(v)
    return v
}

/**
 * 断开钱包
 * @param w 
 */
export async function disconnect(w: Wallet): Promise<any> {
    let w3 = await getWeb3(w.type)
    let eth = w3.currentProvider as any
    if (eth.disconnect) {
        await eth.disconnect()
    }
    if (w === getCurrentWallet()) {
        setCurrentWallet(undefined)
    }
}

let readyed = false;
let readyItems: (() => void)[] = [];

(async function () {
    let text = localStorage.getItem("wallet");
    if (text && /^\{.*\}$/i.test(text)) {
        try {
            let wallet = JSON.parse(text)
            let w3 = await getWeb3(wallet.type)
            let rs = await w3.eth.getAccounts()
            if (rs.length > 0) {
                if (_currentWallet === undefined) {
                    let v = { addr: rs[0], type: wallet.type, chainId: (w3 as _Web3).chainId }
                    _walletSet[wallet.type] = v
                    setCurrentWallet(v)
                }
            }
        } catch (e) { }
    }
    readyed = true
    while (readyItems.length > 0) {
        let fn = readyItems.shift()!;
        fn();
    }
    _event.emit(WalletEvent.READY)
})().then(() => { }, () => { });

export function ready(fn?: () => void): Promise<any> {
    if (readyed) {
        if (fn) {
            fn();
        }
        return Promise.resolve({})
    } else {
        return new Promise<any>((resolve) => {
            readyItems.push(() => {
                if (fn) {
                    fn();
                }
                resolve({})
            })
        })
    }
}

export function isReady() {
    return readyed
}

export function getWallet(type: WalletType): Wallet | undefined {
    return _walletSet[type]
}


export async function switchNetwork(wallet: Wallet, network: Network): Promise<Network> {

    let w3 = await getWeb3(wallet.type)
    let eth: any = w3.currentProvider

    try {
        await eth.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: network.chainId }],
        });
    } catch (e: any) {
        if (e.code === 4902) {
            try {
                await eth.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: network.chainId,
                            chainName: network.title,
                            nativeCurrency: network.currency,
                            rpcUrls: network.rpcUrls,
                            blockExplorerUrls: network.blockExplorerUrls,
                        },
                    ],
                });
            } catch (e: any) {
                return Promise.reject(e)
            }
        }
        return Promise.reject(e)
    }

    return network

}

export async function sign(wallet: Wallet, data: string): Promise<string> {
    let w3 = await getWeb3(wallet.type)
    return w3.eth.personal.sign(data, wallet.addr, '')
}

/**
 * 添加HTG代币到钱包
 * @param wallet 
 */
export async function addHTGToWallet(wallet: Wallet): Promise<Wallet> {

    let network = NetworkSet[wallet.chainId]

    if (!network) {
        return Promise.reject(new Error('wallet network not support'))
    }

    let currency = getCurrencyByNetwork(network, "HTG")

    if (!currency) {
        return Promise.reject(new Error('wallet network not support'))
    }

    let w3 = await getWeb3(wallet.type)
    let eth: any = w3.currentProvider

    await eth.request({
        method: 'wallet_watchAsset',
        params:
        {
            type: 'ERC20',
            options: {
                address: currency.addr,
                symbol: currency.symbol,
                decimals: currency.decimals
            }
        }
    });

    return wallet

}



(function () {

    for (let v of Networks) {
        NetworkSet[v.chainId] = v
    }

    on(WalletEvent.CURRENT_CHANGED, () => {
        let w = getCurrentWallet()
        if (w && !NetworkSet[w.chainId]) {
            switchNetwork(w, Networks[0])
        }
    })
})();

