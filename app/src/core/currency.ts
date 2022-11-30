import Web3 from "web3"
import ERC_20 from '../contracts/MockERC20.web3';
import { BigNumber } from 'bignumber.js';
import { Wallet } from "./wallet";
import { Network, NetworkSet } from "./network";

export interface Currency {
    addr: string
    decimals: number
    symbol: string
    name: string
}

export async function getCurrency(w3: Web3, addr: string): Promise<Currency> {

    let _ERC_20 = ERC_20(w3, addr)

    let name = await _ERC_20.name().call()
    let symbol = await _ERC_20.symbol().call()
    let decimals = await _ERC_20.decimals().call()

    return {
        addr: addr,
        decimals: parseInt(decimals),
        symbol: symbol,
        name: name,
    }
}

export interface CurrencyValue {
    /**
     * 原始金额
     */
    rawValue: BigNumber
    /**
     * 货币
     */
    currency: Currency
    /**
     * 显示金额
     */
    value: string
}

/**
 * 新建货币金额
 * @param value 显示金额
 * @param currency 货币
 * @returns 
 */
export function newValue(value: string, currency: Currency): CurrencyValue {
    return {
        rawValue: BigNumber(value).multipliedBy(BigNumber(10).pow(currency.decimals)),
        currency: currency,
        value: value
    }
}

/**
 * 新建货币金额
 * @param rawValue 原始金额
 * @param currency 货币
 * @returns 
 */
export function newRawValue(rawValue: BigNumber, currency: Currency): CurrencyValue {
    return {
        rawValue: rawValue,
        currency: currency,
        value: optimizeRawValue(rawValue.div(BigNumber(10).pow(currency.decimals)))
    }
}


export function getCurrencyByWallet(w: Wallet, symbol: string): Currency | undefined {
    let network = NetworkSet[w.chainId]
    if (network) {
        return getCurrencyByNetwork(network, symbol)
    }
}


export function getCurrencyByNetwork(network: Network, symbol: string): Currency | undefined {
    for (let c of network.currencys) {
        if (c.symbol === symbol) {
            return c;
        }
    }
}

export function getCurrencyByAddress(chainId: string, addr: string): Currency | undefined {
    let network = NetworkSet[chainId]
    if (network) {
        for (let c of network.currencys) {
            if (c.addr.toLocaleLowerCase() === addr.toLocaleLowerCase()) {
                return c;
            }
        }
    }
}

export function optimizeRawValue(rawValue: BigNumber): string {
    return rawValue.toFormat(4).replace(/0+$/i, '').replace(/\.$/i, '')
}