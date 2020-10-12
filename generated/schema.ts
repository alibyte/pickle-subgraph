// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Account extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Account entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Account entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Account", id.toString(), this);
  }

  static load(id: string): Account | null {
    return store.get("Account", id) as Account | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get staked(): BigInt {
    let value = this.get("staked");
    return value.toBigInt();
  }

  set staked(value: BigInt) {
    this.set("staked", Value.fromBigInt(value));
  }

  get totalRewards(): BigInt {
    let value = this.get("totalRewards");
    return value.toBigInt();
  }

  set totalRewards(value: BigInt) {
    this.set("totalRewards", Value.fromBigInt(value));
  }
}

export class Rewards extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Rewards entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Rewards entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Rewards", id.toString(), this);
  }

  static load(id: string): Rewards | null {
    return store.get("Rewards", id) as Rewards | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get currentRewards(): BigInt {
    let value = this.get("currentRewards");
    return value.toBigInt();
  }

  set currentRewards(value: BigInt) {
    this.set("currentRewards", Value.fromBigInt(value));
  }

  get totalRewards(): BigInt {
    let value = this.get("totalRewards");
    return value.toBigInt();
  }

  set totalRewards(value: BigInt) {
    this.set("totalRewards", Value.fromBigInt(value));
  }
}
