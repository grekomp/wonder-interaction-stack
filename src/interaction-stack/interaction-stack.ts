import type { Interaction } from "src/interaction-stack/interaction";
import {
  AnyData,
  InteractionConstructor,
} from "src/interaction-stack/interaction-stack.model";
import { Emitter } from "src/utils/emitter-listenable/emitter";
import { Listenable } from "src/utils/emitter-listenable/listenable";

export class InteractionStack {
  private __stack: Interaction<unknown>[] = [];
  private __onChange = new Emitter<InteractionStack>();
  readonly onChange = new Listenable<InteractionStack>(this.__onChange);

  getAll(): readonly Interaction<unknown>[] {
    return this.__stack;
  }

  top(): Interaction<unknown> | null {
    return this.__stack.at(-1) ?? null;
  }
  isTop<DataType>(interaction: Interaction<DataType>): boolean {
    return this.top() === interaction;
  }
  getIndexOf(interaction: Interaction<AnyData>): number {
    return this.__stack.indexOf(interaction);
  }
  isInStack(interaction: Interaction<AnyData>): boolean {
    return this.getIndexOf(interaction) >= 0;
  }
  assertIsInStack(interaction: Interaction<AnyData>): void {
    if (this.isInStack(interaction) === false)
      throw new RangeError("Interaction not found in stack");
  }
  getByType<ClassType extends Interaction<AnyData>>(
    interactionClass: InteractionConstructor<ClassType>,
  ): ClassType | null {
    return (this.__stack.findLast(
      (interaction) => interaction instanceof interactionClass,
    ) ?? null) as ClassType | null;
  }
  getChildrenOf(interaction: Interaction<AnyData>) {
    this.assertIsInStack(interaction);
    const index = this.getIndexOf(interaction);
    return this.__stack.slice(index + 1);
  }

  put(interaction: Interaction<AnyData>) {
    this.__stack.push(interaction);
    this.__triggerOnChange();
  }

  pop({ updateStore = true } = {}) {
    const interaction = this.__stack.pop();
    if (!interaction) return null;

    interaction._onStackPop();
    if (updateStore) this.__triggerOnChange();
    return interaction;
  }
  remove(interaction: Interaction<AnyData>, { popChildren = true } = {}) {
    this.assertIsInStack(interaction);

    if (popChildren) {
      while (this.isTop(interaction) === false) {
        this.pop({ updateStore: false });
      }

      return this.pop();
    }

    const index = this.getIndexOf(interaction);
    this.__stack.splice(index, 1);
    interaction._onStackPop();
    this.__triggerOnChange();
  }

  update(interaction: Interaction<AnyData>) {
    this.assertIsInStack(interaction);
    this.__triggerOnChange();
  }

  clear() {
    while (this.__stack.length > 0) {
      this.pop();
    }
  }

  private __triggerOnChange() {
    this.__onChange.emit(this);
  }
}
