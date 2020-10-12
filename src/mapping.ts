import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Staking,
  RewardAdded,
  RewardPaid,
  Staked,
  Withdrawn
} from "../generated/PickleStaking/Staking"
import { Account, Rewards } from "../generated/schema"

const stakingContract = "0xD86F33388BF0bfDF0cCb1ECB4A48a1579504DC0a"

export function handleRewardAdded(event: RewardAdded): void {
  let rewards = Rewards.load(stakingContract)

  if (rewards == null) {
    rewards = new Rewards(stakingContract)
    rewards.currentRewards = BigInt.fromI32(0)
    rewards.totalRewards = BigInt.fromI32(0)
  }

  rewards.currentRewards = rewards.currentRewards.plus(event.params.reward)
  rewards.totalRewards = rewards.totalRewards.plus(event.params.reward)
  rewards.save()
}

export function handleRewardPaid(event: RewardPaid): void {
  let rewards = Rewards.load(stakingContract)
  rewards.currentRewards = rewards.currentRewards.minus(event.params.reward)
  rewards.save()

  let account = Account.load(event.params.user.toHexString())
  account.totalRewards = account.totalRewards.plus(event.params.reward)
  account.save()
}

export function handleStaked(event: Staked): void {
  let contract = Staking.bind(Address.fromString(stakingContract))
  let address = event.params.user.toHexString()
  let account = Account.load(address)

  if (account == null) {
    account = new Account(address)
    account.totalRewards = BigInt.fromI32(0)
  }

  let earned = contract.earned(Address.fromString(address))
  account.totalRewards = account.totalRewards.plus(earned)
  account.staked = contract.balanceOf(Address.fromString(address))
  account.save()
}

export function handleWithdrawn(event: Withdrawn): void {
  let contract = Staking.bind(Address.fromString(stakingContract))
  let address = event.params.user.toHexString()
  let account = Account.load(address)
  let earned = contract.earned(Address.fromString(address))
  account.staked = contract.balanceOf(Address.fromString(address))
  account.totalRewards = account.totalRewards.plus(earned)
  account.save()
}
