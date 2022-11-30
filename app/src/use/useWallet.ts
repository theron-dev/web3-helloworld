import { getCurrentWallet, Wallet, WalletEvent, on, off } from "../core/wallet";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function useWallet(): [Wallet | undefined, Dispatch<SetStateAction<Wallet | undefined>>] {

    let r = useState<Wallet | undefined>(getCurrentWallet())

    useEffect(() => {
        let fn = () => {
            r[1](getCurrentWallet())
        };
        on(WalletEvent.CURRENT_CHANGED, fn)
        return () => {
            off(WalletEvent.CURRENT_CHANGED, fn)
        }
    })

    return r;
}