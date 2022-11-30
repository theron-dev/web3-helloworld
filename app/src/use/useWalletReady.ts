import { isReady, ready } from "../core/wallet";
import { Dispatch, SetStateAction, useState } from "react";

export default function useWalletReady(): [boolean, Dispatch<SetStateAction<boolean>>] {

    let r = useState<boolean>(isReady())

    if (!r[0]) {
        ready(() => {
            r[1](true)
        })
    }

    return r;
}