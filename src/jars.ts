import { Transfer } from '../generated/sCRVv1/PickleJar'
import { getOrCreateJar, getOrCreateUser, getOrCreateUserJarBalance } from './loader';
import { NO_ADDR } from './constants';

export function handleTransfer(event: Transfer): void {
  let jar = getOrCreateJar(event.address);
  let from = getOrCreateUser(event.params.from);
  let to = getOrCreateUser(event.params.to);

  let fromBalance = getOrCreateUserJarBalance(from, jar);
  let toBalance = getOrCreateUserJarBalance(to, jar);

  // deposit
  if (event.params.from.toHexString() == NO_ADDR) {
    toBalance.netDeposit = toBalance.netDeposit.plus(event.params.value);
    toBalance.grossDeposit = toBalance.grossDeposit.plus(event.params.value);
    toBalance.save();

    jar.netDeposit = jar.netDeposit.plus(event.params.value);
    jar.grossDeposit = jar.grossDeposit.plus(event.params.value);
  }

  // withdrawal
  if (event.params.to.toHexString() == NO_ADDR) {
    fromBalance.netDeposit = fromBalance.netDeposit.minus(event.params.value);
    fromBalance.grossWithdraw = fromBalance.grossWithdraw.plus(event.params.value);
    fromBalance.save();

    jar.netDeposit = jar.netDeposit.minus(event.params.value);
    jar.grossWithdraw = jar.grossWithdraw.plus(event.params.value);
  }

  to.save();
  from.save();

  jar.timestamp = event.block.timestamp;
  jar.save();
}
