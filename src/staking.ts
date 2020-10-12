import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  StakingContract,
  RewardAdded,
  RewardPaid,
  Staked,
  Withdrawn
} from "../generated/staking/StakingContract"
import { Account, RewardContract } from "../generated/schema"

// static values
let ZERO = BigInt.fromI32(0);

// contract definitions
let stakingContractAddress = "0xd86f33388bf0bfdf0ccb1ecb4a48a1579504dc0a";
let stakingContract = StakingContract.bind(Address.fromString(stakingContractAddress));

export function handleRewardAdded(event: RewardAdded): void {
  let rewards = getRewards();
  rewards.currentRewards = rewards.currentRewards.plus(event.params.reward);
  rewards.totalRewards = rewards.totalRewards.plus(event.params.reward);
  rewards.save();
}

export function handleRewardPaid(event: RewardPaid): void {
  let rewards = getRewards();
  rewards.currentRewards = rewards.currentRewards.minus(event.params.reward);
  rewards.save();

  let account = getOrCreateAccount(event.params.user);
  account.totalRewards = account.totalRewards.plus(event.params.reward);
  account.save();
}

export function handleStaked(event: Staked): void {
  getRewards().save();
  getOrCreateAccount(event.params.user).save();
}

export function handleWithdrawn(event: Withdrawn): void {
  getRewards().save();
  let account = getOrCreateAccount(event.params.user);
  account.totalRewards = stakingContract.earned(event.params.user).plus(account.totalRewards);
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

function getRewards(): RewardContract {
  let rewards = RewardContract.load(stakingContractAddress);

  if (rewards == null) {
    rewards = new RewardContract(stakingContractAddress);
    rewards.totalRewards = ZERO;
    rewards.currentRewards = ZERO;
  }

  rewards.stakedTokens = stakingContract.totalSupply();
  return rewards as RewardContract;
}
