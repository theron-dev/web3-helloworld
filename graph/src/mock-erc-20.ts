
import { BigInt } from "@graphprotocol/graph-ts"
import { Approval, Transfer } from "../generated/MockERC20/MockERC20"
import { Balance } from "../generated/schema"

export function handleApproval(event: Approval): void {

}

export function handleTransfer(event: Transfer): void {
  let from = event.params.from.toHexString()
  let to = event.params.to.toHexString()
  if (from !== "0x0000000000000000000000000000000000000000") {
    let v = Balance.load(from)
    if (v) {
      v.value = v.value.minus(event.params.value)
      v.tx = event.transaction.hash
      v.block = event.block.number
      v.time = event.block.timestamp
      v.save()
    }
  }

  if (to !== "0x0000000000000000000000000000000000000000") {
    let v = Balance.load(to)
    if (!v) {
      v = new Balance(to)
      v.owner = event.params.to
      v.value = BigInt.fromI32(0)
    }
    v.value = v.value.plus(event.params.value)
    v.tx = event.transaction.hash
    v.block = event.block.number
    v.time = event.block.timestamp
    v.save()
  }
}
