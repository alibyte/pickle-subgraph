import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  RewardAdded,
  RewardPaid,
  Staked,
  Withdrawn,
  StakingContract
} from "../generated/staking/StakingContract"
import { ERC20 } from "../generated/staking/ERC20"
import { PickleJar, Transfer } from "../generated/sCRVv1/PickleJar"
import { Account, Jar, RewardContract } from "../generated/schema"
import { getRewards, getOrCreateAccount } from './loader';

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
  account.stakingRewards = account.stakingRewards.plus(event.params.reward);
  account.save();
}

export function handleStaked(event: Staked): void {
  let account = getOrCreateAccount(event.params.user);
  account.staked = account.staked.plus(event.params.amount);
  account.save();
  getRewards().save();
}

export function handleWithdrawn(event: Withdrawn): void {
  let account = getOrCreateAccount(event.params.user);
  account.staked = account.staked.minus(event.params.amount);
  account.save();
  getRewards().save();
}
