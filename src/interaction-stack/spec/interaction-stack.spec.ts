import { describe, expect, it, mock } from "bun:test";
import { Interaction } from "src/interaction-stack/interaction";
import { InteractionStack } from "src/interaction-stack/interaction-stack";

describe("InteractionStack", () => {
  describe("getAll", () => {
    it("returns all interactions in the stack", () => {
      const stack = new InteractionStack();
      const interaction1 = new Interaction<unknown>({ stack, initialData: {} });
      const interaction2 = new Interaction<unknown>({ stack, initialData: {} });

      interaction1.start();
      interaction2.start();

      expect(stack.getAll()).toEqual([interaction1, interaction2]);
    });
  });

  describe("top", () => {
    it("returns the top interaction", () => {
      const stack = new InteractionStack();
      const interaction1 = new Interaction<unknown>({ stack, initialData: {} });
      const interaction2 = new Interaction<unknown>({ stack, initialData: {} });

      interaction1.start();
      interaction2.start();

      expect(stack.top()).toBe(interaction2);
    });

    it("returns null if there are no interactions", () => {
      const stack = new InteractionStack();
      expect(stack.top()).toBe(null);
    });
  });

  describe("isTop", () => {
    it("returns true if the passed interaction is the top interaction", () => {
      const stack = new InteractionStack();
      const interaction1 = new Interaction({ stack, initialData: {} });
      const interaction2 = new Interaction({ stack, initialData: {} });

      interaction1.start();
      interaction2.start();

      expect(stack.isTop(interaction2)).toBe(true);
    });

    it("returns false if the passed interaction is not the top interaction", () => {
      const stack = new InteractionStack();
      const interaction1 = new Interaction({ stack, initialData: {} });
      const interaction2 = new Interaction({ stack, initialData: {} });

      interaction1.start();
      interaction2.start();

      expect(stack.isTop(interaction1)).toBe(false);
    });
  });

  describe("getIndexOf", () => {
    it("returns the index of the passed interaction in the stack", () => {
      const stack = new InteractionStack();
      const interaction1 = new Interaction({ stack, initialData: {} });
      const interaction2 = new Interaction({ stack, initialData: {} });

      interaction1.start();
      interaction2.start();

      expect(stack.getIndexOf(interaction1)).toBe(0);
      expect(stack.getIndexOf(interaction2)).toBe(1);
    });

    it("returns -1 if the passed interaction is not in the stack", () => {
      const stack = new InteractionStack();
      const interaction = new Interaction({ stack, initialData: {} });

      expect(stack.getIndexOf(interaction)).toBe(-1);
    });
  });

  describe("isInStack", () => {
    it("returns true if the passed interaction is in the stack", () => {
      const stack = new InteractionStack();
      const interaction = new Interaction({ stack, initialData: {} });

      interaction.start();

      expect(stack.isInStack(interaction)).toBe(true);
    });

    it("returns false if the passed interaction is not in the stack", () => {
      const stack = new InteractionStack();
      const interaction = new Interaction({ stack, initialData: {} });

      expect(stack.isInStack(interaction)).toBe(false);
    });
  });

  describe("assertIsInStack", () => {
    it("throws a RangeError if the passed interaction is not in the stack", () => {
      const stack = new InteractionStack();
      const interaction = new Interaction({ stack, initialData: {} });

      expect(() => stack.assertIsInStack(interaction)).toThrow(RangeError);
    });

    it("does not throw an error if the passed interaction is in the stack", () => {
      const stack = new InteractionStack();
      const interaction = new Interaction({ stack, initialData: {} });

      interaction.start();

      expect(() => stack.assertIsInStack(interaction)).not.toThrow();
    });
  });

  describe("getByType", () => {
    it("returns the last interaction of the specified type in the stack", () => {
      class TestInteraction extends Interaction<object> {}
      const stack = new InteractionStack();
      const otherTypeInteraction = new Interaction({ stack, initialData: {} });
      const interaction1 = new TestInteraction({ stack, initialData: {} });
      const interaction2 = new TestInteraction({ stack, initialData: {} });

      interaction1.start();
      interaction2.start();
      otherTypeInteraction.start();

      expect(stack.getByType(TestInteraction)).toBe(interaction2);
    });

    it("returns undefined if there are no interactions of the specified type in the stack", () => {
      class TestInteraction extends Interaction<object> {}
      const stack = new InteractionStack();
      const interaction = new Interaction({ stack, initialData: {} });

      interaction.start();

      expect<TestInteraction | null>(stack.getByType(TestInteraction)).toBe(
        null,
      );
    });
  });

  describe("getChildrenOf", () => {
    it("returns all interactions after the passed interaction in the stack", () => {
      const stack = new InteractionStack();
      const interaction1 = new Interaction({ stack, initialData: {} });
      const interaction2 = new Interaction({ stack, initialData: {} });
      const interaction3 = new Interaction({ stack, initialData: {} });
      const interaction4 = new Interaction({ stack, initialData: {} });

      interaction1.start();
      interaction2.start();
      interaction3.start();
      interaction4.start();

      expect(stack.getChildrenOf(interaction2)).toEqual([
        interaction3,
        interaction4,
      ] as Interaction<unknown>[]);
    });

    it("returns an empty array if the passed interaction is the top interaction", () => {
      const stack = new InteractionStack();
      const interaction = new Interaction({ stack, initialData: {} });

      interaction.start();

      expect(stack.getChildrenOf(interaction)).toEqual([]);
    });

    it("throws a RangeError if the passed interaction is not in the stack", () => {
      const stack = new InteractionStack();
      const interaction = new Interaction({ stack, initialData: {} });

      expect(() => stack.getChildrenOf(interaction)).toThrow(RangeError);
    });
  });

  describe("put", () => {
    it("adds the passed interaction to the stack", () => {
      const stack = new InteractionStack();
      const interaction = new Interaction({ stack, initialData: {} });

      stack.put(interaction);

      expect(stack.getAll()).toEqual([interaction] as Interaction<unknown>[]);
    });
  });

  describe("pop", () => {
    it("removes the top interaction from the stack and returns it", () => {
      const stack = new InteractionStack();
      const interaction = new Interaction<unknown>({ stack, initialData: {} });

      interaction.start();
      expect(stack.pop()).toBe(interaction);

      expect(stack.getAll()).toEqual([]);
    });

    it("returns null if there are no interactions in the stack", () => {
      const stack = new InteractionStack();

      expect(stack.pop()).toBe(null);
    });

    it("calls the _onStackPop method of the interaction", () => {
      class TestInteraction extends Interaction<object> {
        _onStackPop = mock();
      }

      const stack = new InteractionStack();
      const interaction = new TestInteraction({ stack, initialData: {} });

      interaction.start();
      stack.pop();

      expect(interaction._onStackPop).toHaveBeenCalledTimes(1);
    });
  });

  describe("remove", () => {
    it("removes the passed interaction from the stack", () => {
      const stack = new InteractionStack();
      const interaction = new Interaction({ stack, initialData: {} });

      interaction.start();
      stack.remove(interaction);

      expect(stack.getAll()).toEqual([]);
    });

    it("removes the passed interaction and all interactions after the passed interaction if popChildren is true", () => {
      const stack = new InteractionStack();
      const interaction1 = new Interaction({ stack, initialData: {} });
      const interaction2 = new Interaction({ stack, initialData: {} });

      interaction1.start();
      interaction2.start();
      stack.remove(interaction1, { popChildren: true });

      expect(stack.getAll()).toEqual([]);
    });

    it("does not remove all interactions after the passed interaction if popChildren is false", () => {
      const stack = new InteractionStack();
      const interaction1 = new Interaction<unknown>({ stack, initialData: {} });
      const interaction2 = new Interaction<unknown>({ stack, initialData: {} });

      interaction1.start();
      interaction2.start();
      stack.remove(interaction1, { popChildren: false });

      expect(stack.getAll()).toEqual([interaction2]);
    });

    it("throws a RangeError if the passed interaction is not in the stack", () => {
      const stack = new InteractionStack();
      const interaction = new Interaction({ stack, initialData: {} });

      expect(() => stack.remove(interaction)).toThrow(RangeError);
    });
  });

  describe("update", () => {
    it("calls subscribers", () => {
      const stack = new InteractionStack();
      const interaction = new Interaction({ stack, initialData: {} });

      const subscriber = mock();

      stack.onChange.on(subscriber);
      expect(subscriber).toHaveBeenCalledTimes(0);

      interaction.start();
      expect(subscriber).toHaveBeenCalledTimes(1);

      stack.update(interaction);
      expect(subscriber).toHaveBeenCalledTimes(2);
    });

    it("throws a RangeError if the passed interaction is not in the stack", () => {
      const stack = new InteractionStack();
      const interaction = new Interaction({ stack, initialData: {} });

      expect(() => stack.update(interaction)).toThrow(RangeError);
    });
  });

  describe("clear", () => {
    it("removes all interactions from the stack", () => {
      const stack = new InteractionStack();
      const interaction1 = new Interaction({ stack, initialData: {} });
      const interaction2 = new Interaction({ stack, initialData: {} });

      interaction1.start();
      interaction2.start();
      stack.clear();

      expect(stack.getAll()).toEqual([]);
    });

    it("calls the _onStackPop method of all interactions in the stack", () => {
      class TestInteraction extends Interaction<object> {
        _onStackPop = mock();
      }

      const stack = new InteractionStack();
      const interaction1 = new TestInteraction({ stack, initialData: {} });
      const interaction2 = new TestInteraction({ stack, initialData: {} });

      interaction1.start();
      interaction2.start();
      stack.clear();

      expect(interaction1._onStackPop).toHaveBeenCalledTimes(1);
      expect(interaction2._onStackPop).toHaveBeenCalledTimes(1);
    });
  });
});
