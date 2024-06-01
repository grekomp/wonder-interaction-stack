import { Store, StoreCallback } from "src/store/store.model";

export interface WritableStore<DataType> extends Store<DataType> {
  unsubscribe(this: void, callback: StoreCallback<DataType>): void;
  set(this: void, newValue: DataType): void;
}
