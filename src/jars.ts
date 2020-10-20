import { Transfer } from '../generated/sCRVv1/PickleJar'
import { getOrCreateJar, getOrCreateAccount } from './loader';
import { NO_ADDR } from './constants';

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
