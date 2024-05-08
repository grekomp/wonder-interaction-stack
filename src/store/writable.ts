import { StoreCallback, WritableStore } from "src/store/writable.model";

export function writable<DataType>(
  initialValue: DataType,
): WritableStore<DataType> {
  let subscribers: StoreCallback<DataType>[] = [];
  let value = initialValue;

  const unsubscribe = (callback: StoreCallback<DataType>) => {
    subscribers = subscribers.filter((sub) => sub !== callback);
  };

  return {
    subscribe: (callback: StoreCallback<DataType>) => {
      if (subscribers.includes(callback) === false) subscribers.push(callback);

      callback(value);
      return unsubscribe.bind(null, callback);
    },
    unsubscribe,
    set: (newValue: DataType) => {
      value = newValue;
      subscribers.forEach((subscriber) => subscriber(value));
    },
  };
}
