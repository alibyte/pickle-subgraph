import {
  RewardAdded,
  RewardPaid,
  Staked,
  Withdrawn
} from "../generated/staking/StakingContract"
import { getRewards, getOrCreateUser } from './loader';

export function handleRewardAdded(event: RewardAdded): void {
  let rewards = getRewards(event.address);
  rewards.currentRewards = rewards.currentRewards.plus(event.params.reward);
  rewards.totalRewards = rewards.totalRewards.plus(event.params.reward);
  rewards.save();
}

export function handleRewardPaid(event: RewardPaid): void {
  let rewards = getRewards(event.address);
  rewards.currentRewards = rewards.currentRewards.minus(event.params.reward);
  rewards.save();

  let account = getOrCreateUser(event.params.user);
  account.stakingRewards = account.stakingRewards.plus(event.params.reward);
  account.save();
}

export function handleStaked(event: Staked): void {
  let account = getOrCreateUser(event.params.user);
  account.staked = account.staked.plus(event.params.amount);
  account.save();
  getRewards(event.address).save();
}

export function handleWithdrawn(event: Withdrawn): void {
  let account = getOrCreateUser(event.params.user);
  account.staked = account.staked.minus(event.params.amount);
  account.save();
  getRewards(event.address).save();
}
