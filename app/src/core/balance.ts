import { Currency, CurrencyValue, newRawValue } from "./currency";
import { getWeb3, Wallet } from "./wallet";
import ERC_20 from '../contracts/MockERC20.web3';
import BigNumber from "bignumber.js";

export async function getBalance(w: Wallet, addr: string, currency: Currency): Promise<CurrencyValue> {

    let w3 = await getWeb3(w.type)

    let erc20 = ERC_20(w3, currency.addr)

    let v = await erc20.balanceOf(addr).call()

    return newRawValue(BigNumber(v), currency)
}

export function getBalances(w: Wallet, addr: string, currencys: Currency[]): Promise<CurrencyValue[]> {
    let vs: Promise<CurrencyValue>[] = []
    for (let currency of currencys) {
        vs.push(getBalance(w, addr, currency))
    }
    return Promise.all(vs)
}

