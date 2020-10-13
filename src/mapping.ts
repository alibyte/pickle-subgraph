import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  StakingContract,
  RewardAdded,
  RewardPaid,
  Staked,
  Withdrawn
} from "../generated/staking/StakingContract"
import { UniswapLPJar, Transfer } from "../generated/usdcethlp/UniswapLPJar"
import { Account, Jar, RewardContract } from "../generated/schema"

// static values
const NO_ADDR = "0x0000000000000000000000000000000000000000";
let ZERO = BigInt.fromI32(0);

export function handleTransfer(event: Transfer): void {
  let jar = getOrCreateJar(event.address);
  let from = getOrCreateAccount(event.params.from);
  let to = getOrCreateAccount(event.params.to);

  // deposit
  if (event.params.from.toHexString() == NO_ADDR) {
  }

  // withdrawal
  if (event.params.to.toHexString() == NO_ADDR) {
  }

  jar.save();
}

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
  account.totalRewards = account.totalRewards.plus(event.params.amount);
  account.save();
}

function getOrCreateAccount(address: Address): Account {
  let account = Account.load(address.toHexString());

  if (account == null) {
    account = new Account(address.toHexString());
    account.totalRewards = ZERO;
    account.staked = ZERO;
  }

  return account as Account;
}

function getOrCreateJar(address: Address): Jar {
  let jar = Jar.load(address.toHexString());
  let contract = UniswapLPJar.bind(address);

  if (jar == null) {
    jar = new Jar(address.toHexString());
    jar.ratio = ZERO;
    jar.jarBalance = ZERO;
    jar.totalSupply = ZERO;
    jar.available = ZERO;
  }

  jar.token = contract.token();
  jar.ratio = contract.getRatio();
  jar.jarBalance = contract.balance();
  jar.totalSupply = contract.totalSupply();
  jar.available = contract.available();

  return jar as Jar
}

function getRewards(): RewardContract {
  let rewards = RewardContract.load(NO_ADDR);

  if (rewards == null) {
    rewards = new RewardContract(NO_ADDR);
    rewards.totalRewards = ZERO;
    rewards.currentRewards = ZERO;
    rewards.stakedTokens = ZERO;
  }

  return rewards as RewardContract;
}
