import type { Interaction } from "src/interaction-stack/interaction";
import { InteractionConstructor } from "src/interaction-stack/interaction-stack.model";
import { writable } from "src/store";

export class InteractionStack {
  private __store = writable<InteractionStack>(this);
  private __stack: Interaction<unknown>[] = [];

  getAll(): readonly Interaction<unknown>[] {
    return this.__stack;
  }

  subscribe = this.__store.subscribe;

  top(): Interaction<unknown> | null {
    return this.__stack.at(-1) ?? null;
  }
  isTop(interaction: Interaction<unknown>): boolean {
    return this.top() === interaction;
  }
  getIndexOf(interaction: Interaction<unknown>): number {
    return this.__stack.indexOf(interaction);
  }
  isInStack(interaction: Interaction<unknown>): boolean {
    return this.getIndexOf(interaction) >= 0;
  }
  assertIsInStack(interaction: Interaction<unknown>): void {
    if (this.isInStack(interaction) === false)
      throw new RangeError("Interaction not found in stack");
  }
  getByType<ClassType extends Interaction<unknown>>(
    interactionClass: InteractionConstructor<ClassType>,
  ): ClassType | null {
    return (this.__stack.findLast(
      (interaction) => interaction instanceof interactionClass,
    ) ?? null) as ClassType | null;
  }
  getChildrenOf(interaction: Interaction<unknown>) {
    this.assertIsInStack(interaction);
    const index = this.getIndexOf(interaction);
    return this.__stack.slice(index + 1);
  }

  put(interaction: Interaction<unknown>) {
    this.__stack.push(interaction);
    this.updateStore();
  }

  pop({ updateStore = true } = {}) {
    const interaction = this.__stack.pop();
    if (!interaction) return null;

    interaction._onStackPop();
    if (updateStore) this.updateStore();
    return interaction;
  }
  remove(interaction: Interaction<unknown>, { popChildren = true } = {}) {
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
    this.updateStore();
  }

  update(interaction: Interaction<unknown>) {
    this.assertIsInStack(interaction);
    this.updateStore();
  }

  clear() {
    while (this.__stack.length > 0) {
      this.pop();
    }
  }

  private updateStore() {
    this.__store.set(this);
  }
}
