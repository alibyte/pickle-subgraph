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

// static values
const NO_ADDR = "0x0000000000000000000000000000000000000000";
const STAKING_CONTRACT = '0xd86f33388bf0bfdf0ccb1ecb4a48a1579504dc0a';
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

function getOrCreateAccount(address: Address): Account {
  let account = Account.load(address.toHexString());

  if (account == null) {
    account = new Account(address.toHexString());
    account.balance = ZERO;
    account.staked = ZERO;
    account.stakingRewards = ZERO;
  }

  return account as Account;
}

function getOrCreateJar(address: Address): Jar {
  let jar = Jar.load(address.toHexString());
  let contract = PickleJar.bind(address);

  if (jar == null) {
    jar = new Jar(address.toHexString());
    jar.token = Address.fromString(NO_ADDR);
    jar.balance = ZERO;
    jar.totalSupply = ZERO;
  }

  let token = contract.try_token();
  let balance = contract.try_balance();
  let totalSupply = contract.try_totalSupply();
  jar.token = !token.reverted ? token.value : jar.token;
  jar.balance = !balance.reverted ? balance.value : jar.balance;
  jar.totalSupply = !totalSupply.reverted ? totalSupply.value : jar.totalSupply;

  return jar as Jar
}

function getRewards(): RewardContract {
  let rewards = RewardContract.load(STAKING_CONTRACT);
  let contract = StakingContract.bind(Address.fromString(STAKING_CONTRACT));

  if (rewards == null) {
    rewards = new RewardContract(STAKING_CONTRACT);
    rewards.totalRewards = ZERO;
    rewards.currentRewards = ZERO;
    rewards.stakedTokens = ZERO;
    rewards.stakingToken = Address.fromString(NO_ADDR);
    rewards.stakingTokenTotalSupply = ZERO;
  }

  let stakingToken = contract.try_stakingToken();
  let stakedTokens = contract.try_totalSupply();
  rewards.stakingToken = !stakingToken.reverted ? stakingToken.value : rewards.stakingToken;
  rewards.stakedTokens = !stakedTokens.reverted ? stakedTokens.value : rewards.stakedTokens;

  let tokenContract = ERC20.bind(Address.fromString(rewards.stakingToken.toHexString()));
  let totalSuppy = tokenContract.try_totalSupply();
  rewards.stakingTokenTotalSupply = !totalSuppy.reverted ? totalSuppy.value : rewards.stakingTokenTotalSupply;

  return rewards as RewardContract;
}
