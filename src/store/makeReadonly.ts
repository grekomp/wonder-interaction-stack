import { Store } from "src/store/store.model";
import { WritableStore } from "src/store/writable.model";

export function makeReadonly<DataType>(
  store: WritableStore<DataType>
): Store<DataType> {
  return {
    get: store.get,
    subscribe: store.subscribe,
  };
}
