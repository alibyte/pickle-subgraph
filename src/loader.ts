import { Address, BigInt } from '@graphprotocol/graph-ts';
import { User, Jar, RewardContract, UserJarBalance } from '../generated/schema';
import { StakingContract } from '../generated/staking/StakingContract'
import { PickleJar } from '../generated/sCRVv1/PickleJar'
import { ERC20 } from '../generated/staking/ERC20'
import { ZERO, NO_ADDR, STAKING_CONTRACT } from './constants';

export function getOrCreateUser(address: Address): User {
  let user = User.load(address.toHexString());

  if (user == null) {
    user = new User(address.toHexString());
    user.balance = ZERO;
    user.staked = ZERO;
    user.stakingRewards = ZERO;
  }

  return user as User;
}

export const getOrCreateUserJarBalance = (user: User, jar: Jar): UserJarBalance => {
  let jarBalanceId = user.id.concat('-').concat(jar.id);
  let jarBalance = UserJarBalance.load(jarBalanceId);

  if (jarBalance == null) {
    jarBalance = new UserJarBalance(jarBalanceId);
    jarBalance.jar = jar.id;
    jarBalance.user = user.id;
    jarBalance.netDeposit = ZERO;
    jarBalance.grossDeposit = ZERO;
    jarBalance.grossWithdraw = ZERO;
  }
  
  return jarBalance as UserJarBalance;
}

export function getOrCreateJar(address: Address): Jar {
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

  return jar as Jar;
}

export function getRewards(): RewardContract {
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
