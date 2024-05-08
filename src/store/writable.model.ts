export type StoreCallback<DataType> = (value: DataType) => void;

export type Unsubscribe = () => void;

export interface WritableStore<DataType> {
  subscribe(this: void, callback: StoreCallback<DataType>): Unsubscribe;
  unsubscribe(this: void, callback: StoreCallback<DataType>): void;
  set(this: void, newValue: DataType): void;
}
