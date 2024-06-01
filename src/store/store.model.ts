export type StoreCallback<DataType> = (value: DataType) => void;

export type Unsubscribe = () => void;

export interface Store<DataType> {
  get(this: void): DataType;
  subscribe(this: void, callback: StoreCallback<DataType>): Unsubscribe;
}
