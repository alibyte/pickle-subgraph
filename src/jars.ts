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
    toBalance.netDeposit.plus(event.params.value);
    toBalance.grossDeposit.plus(event.params.value);
    toBalance.save();
  }

  // withdrawal
  if (event.params.to.toHexString() == NO_ADDR) {
    fromBalance.netDeposit.minus(event.params.value);
    fromBalance.grossWithdraw.plus(event.params.value);
    fromBalance.save();
  }

  to.save();
  from.save();
  jar.save();
}
