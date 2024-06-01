import { StoreCallback } from "src/store/store.model";
import { WritableStore } from "src/store/writable.model";

export function writable<DataType>(
  initialValue: DataType
): WritableStore<DataType> {
  let subscribers: StoreCallback<DataType>[] = [];
  const value = { current: initialValue };

  const unsubscribe = (callback: StoreCallback<DataType>) => {
    subscribers = subscribers.filter((sub) => sub !== callback);
  };

  return {
    get: () => value.current,
    subscribe: (callback: StoreCallback<DataType>) => {
      if (subscribers.includes(callback) === false) subscribers.push(callback);

      callback(value.current);
      return unsubscribe.bind(null, callback);
    },
    unsubscribe,
    set: (newValue: DataType) => {
      value.current = newValue;
      subscribers.forEach((subscriber) => subscriber(value.current));
    },
  };
}
