import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  Staking,
  RewardAdded,
  RewardPaid,
  Staked,
  Withdrawn
} from "../generated/PickleStaking/Staking"
import { Account, Rewards } from "../generated/schema"

// static values
const ZERO = BigInt.fromI32(0);

// contract definitions
const stakingContractAddress = "0xD86F33388BF0bfDF0cCb1ECB4A48a1579504DC0a";
const stakingContract = Staking.bind(Address.fromString(stakingContractAddress));

export function handleRewardAdded(event: RewardAdded): void {
  let rewards = Rewards.load(stakingContractAddress);

  if (rewards == null) {
    rewards = new Rewards(stakingContractAddress);
    rewards.currentRewards = BigInt.fromI32(0);
    rewards.totalRewards = BigInt.fromI32(0);
  }

  rewards.currentRewards = rewards.currentRewards.plus(event.params.reward);
  rewards.totalRewards = rewards.totalRewards.plus(event.params.reward);
  rewards.save();
}

export function handleRewardPaid(event: RewardPaid): void {
  let rewards = Rewards.load(stakingContractAddress);
  rewards.currentRewards = rewards.currentRewards.minus(event.params.reward);
  rewards.save();

  let account = getOrCreateAccount(event.params.user);
  account.totalRewards = account.totalRewards.plus(event.params.reward);
  account.save();
}

export function handleStaked(event: Staked): void {
  getOrCreateAccount(event.params.user).save();
}

export function handleWithdrawn(event: Withdrawn): void {
  let account = getOrCreateAccount(event.params.user);
  let earned = stakingContract.earned(event.params.user);
  account.totalRewards = account.totalRewards.plus(earned);
  account.save();
}

function getOrCreateAccount(address: Address): Account {
  let account = Account.load(address.toHexString());

  if (account == null) {
    account = new Account(address.toHexString());
    account.totalRewards = ZERO;
  }

  account.staked = stakingContract.balanceOf(address);
  return account as Account;
}
