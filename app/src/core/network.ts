import { Currency } from "./currency"

export interface Network {
    currency: Currency
    title: string
    chainId: string
    rpcUrls: string[]
    blockExplorerUrls: string[]
    currencys: Currency[]
    graph?: {
        baseURL: string
    }
}

export var Networks: Network[] = [
    {
        chainId: "0x1",
        title: 'Ethereum',
        rpcUrls: ["https://rpc.ankr.com/eth", "https://eth-mainnet.public.blastapi.io", "https://cloudflare-eth.com"],
        blockExplorerUrls: ["https://etherscan.io/"],
        currency: {
            symbol: 'ETH',
            decimals: 18,
            name: 'ETH',
            addr: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
        },
        currencys: [
            {
                addr: "0xdac17f958d2ee523a2206206994597c13d831ec7",
                decimals: 6,
                symbol: "USDT",
                name: "USDT"
            }
        ],
    },
    {
        chainId: "0x5",
        title: 'Goerli',
        rpcUrls: ["https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
        blockExplorerUrls: ["https://goerli.etherscan.io/"],
        currency: {
            symbol: 'GoerliETH',
            decimals: 18,
            name: 'GoerliETH',
            addr: '0x0000000000000000000000000000000000000000'
        },
        currencys: [
            {
                addr: "0x048c02D503fD024d2fF07B7BF0d64E7A5C02961D",
                decimals: 18,
                symbol: "WHD",
                name: "Hello World"
            }
        ],
        graph: {
            baseURL: "https://api.studio.thegraph.com/query/32938/0x50fc-web3-helloworld/v0.0.3"
        }
    },
]

export var NetworkSet: {
    [chainId: string]: Network
} = {};

(function () {

    for (let v of Networks) {
        NetworkSet[v.chainId] = v
    }

})();

export var defaultNetwork = NetworkSet["0x5"]!


