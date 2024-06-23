export interface ListenerMeta {
  off: () => void;
}

export type Listener<DataType> = (value: DataType, meta: ListenerMeta) => void;

export class Emitter<DataType> {
  private listeners: Listener<DataType>[] = [];

  constructor() {
    this.on = this.on.bind(this);
    this.off = this.off.bind(this);
    this.emit = this.emit.bind(this);
    this.getPromise = this.getPromise.bind(this);
  }

  on(callback: Listener<DataType>) {
    if (this.listeners.includes(callback)) return;

    this.listeners.push(callback);

    return () => this.off(callback);
  }
  off(callback: Listener<DataType>) {
    if (this.listeners.includes(callback)) {
      this.listeners.splice(this.listeners.indexOf(callback), 1);
    }
  }

  emit(data: DataType) {
    this.listeners.forEach((callback) =>
      callback(data, { off: () => this.off(callback) }),
    );
  }

  /**
   * Creates a promise that will be resolved the next time this event emitter is updated.
   */
  getPromise() {
    return new Promise<DataType>((resolve) => {
      this.on((value, { off }) => {
        off();
        resolve(value);
      });
    });
  }
}
