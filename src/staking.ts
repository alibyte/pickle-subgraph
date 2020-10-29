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
import { User, Jar, RewardContract } from "../generated/schema"
import { getRewards, getOrCreateUser } from './loader';

export function handleRewardAdded(event: RewardAdded): void {
  let rewards = getRewards();
  rewards.currentRewards = rewards.currentRewards.plus(event.params.reward);
  rewards.totalRewards = rewards.totalRewards.plus(event.params.reward);
  rewards.timestamp = event.block.timestamp;
  rewards.save();
}

export function handleRewardPaid(event: RewardPaid): void {
  let rewards = getRewards();
  rewards.currentRewards = rewards.currentRewards.minus(event.params.reward);
  rewards.timestamp = event.block.timestamp;
  rewards.save();

  let account = getOrCreateUser(event.params.user);
  account.stakingRewards = account.stakingRewards.plus(event.params.reward);
  account.save();
}

export function handleStaked(event: Staked): void {
  let account = getOrCreateUser(event.params.user);
  account.staked = account.staked.plus(event.params.amount);
  account.save();
  let rewards = getRewards();
  rewards.timestamp = event.block.timestamp;
  rewards.save();
}

export function handleWithdrawn(event: Withdrawn): void {
  let account = getOrCreateUser(event.params.user);
  account.staked = account.staked.minus(event.params.amount);
  account.save();
  let rewards = getRewards();
  rewards.timestamp = event.block.timestamp;
  rewards.save();
}
