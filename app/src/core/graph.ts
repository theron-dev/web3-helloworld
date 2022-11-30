
import { send } from './http'
import { defaultNetwork, Network, NetworkSet } from './network'
import { getCurrentWallet } from './wallet'

export async function graph<T>(graphql: string, variables: { [key: string]: any }): Promise<T> {

    let w = getCurrentWallet()
    let network: Network | undefined

    if (w) {
        network = NetworkSet[w.chainId]
    }

    if (!network) {
        network = defaultNetwork;
    }

    if (!network.graph) {
        return Promise.reject(new Error('not support network ' + network.title))
    }

    return send('POST', network.graph.baseURL, JSON.stringify({ query: graphql, variables: variables }), {
        'Content-Type': 'application/json',
    })
}
