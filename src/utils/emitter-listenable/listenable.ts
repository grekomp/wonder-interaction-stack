import { Emitter } from "src/utils/emitter-listenable/emitter";

export class Listenable<DataType> {
  private emitter: Emitter<DataType>;

  on: Emitter<DataType>["on"];
  off: Emitter<DataType>["off"];
  getPromise: Emitter<DataType>["getPromise"];

  constructor(emitter: Emitter<DataType>) {
    this.emitter = emitter;

    // The methods are bound in Emitter's constructor, so we can safely use them here.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { on, off, getPromise } = this.emitter;

    this.on = on;
    this.off = off;
    this.getPromise = getPromise;
  }
}
