import type { InteractionStack } from "src/interaction-stack/interaction-stack";
import { InteractionStatus } from "src/interaction-stack/interaction-stack.model";
import { writable } from "src/store";

export class Interaction<DataType> {
  private __id: string;
  private __data: DataType;
  private __stack: InteractionStack;
  private __status: InteractionStatus = InteractionStatus.Pending;

  private __store = writable<unknown>(this);
  name?: string;

  get id(): string {
    return this.__id;
  }
  get data() {
    return this.__data;
  }
  set data(value: DataType) {
    this.__data = value;
    this.__stack.update(this);
    this.updateStore();
  }
  get status() {
    return this.__status;
  }
  get stack() {
    return this.__stack;
  }

  readonly subscribe = this.__store.subscribe;
  readonly unsubscribe = this.__store.unsubscribe;

  constructor({
    stack,
    initialData,
  }: {
    stack: InteractionStack;
    initialData: DataType;
  }) {
    this.__stack = stack;
    this.__data = initialData;
    this.__id = crypto.randomUUID();

    this._onStart = this._onStart.bind(this);
    this._onComplete = this._onComplete.bind(this);
    this._onCancel = this._onCancel.bind(this);
    this._onStackPop = this._onStackPop.bind(this);
    this._onDispose = this._onDispose.bind(this);
  }

  start(data?: DataType) {
    this.__data = data ?? this.__data;
    this.__status = InteractionStatus.InProgress;
    this.__stack.put(this);
    this._onStart();
    this.updateStore();
  }
  complete() {
    if (this.__status !== InteractionStatus.InProgress) return;

    this.__status = InteractionStatus.Completed;
    this._onComplete();
    this.__stack.remove(this);
    this.updateStore();
    this._onDispose();
  }
  cancel() {
    this.__status = InteractionStatus.Cancelled;
    this._onCancel();
    this.__stack.remove(this);
    this.updateStore();
    this._onDispose();
  }

  _onStart() {}
  _onComplete() {}
  _onCancel() {}
  _onStackPop() {}
  _onDispose() {}

  updateStore() {
    this.__store.set(this);
  }
}
