#!/usr/bin/env node

const path = require('path')
const fs = require('fs')

let inFile = process.argv[2]
let outDir = process.argv[3]

let jsonObject = JSON.parse(fs.readFileSync(inFile).toString())

let basename = path.basename(inFile)
let i = basename.lastIndexOf(".")
if (i >= 0) {
    basename = basename.substring(0, i)
}

let code = `
import * as ERC from "./${basename}";
import Web3 from "web3"

export default function ERC_${basename}(w3: Web3, addr: string): ERC.${basename} {
    let contract = new w3.eth.Contract(${JSON.stringify(jsonObject.abi)} as any, addr)
    return contract.methods as any as ERC.${basename};
}
`

fs.writeFileSync(path.join(outDir, basename + ".web3.ts"), code)
