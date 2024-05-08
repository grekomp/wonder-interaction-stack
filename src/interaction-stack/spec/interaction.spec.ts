import { describe, expect, it, mock } from "bun:test";
import { Interaction } from "src/interaction-stack/interaction";
import { InteractionStack } from "src/interaction-stack/interaction-stack";
import { InteractionStatus } from "src/interaction-stack/interaction-stack.model";

describe("Interaction", () => {
  it("updates the status after starting, completing, and cancelling", () => {
    const stack = new InteractionStack();

    const interaction = new Interaction({
      stack,
      initialData: {},
    });

    expect(interaction.status).toBe(InteractionStatus.Pending);
    interaction.start();
    expect(interaction.status).toBe(InteractionStatus.InProgress);
    interaction.complete();
    expect(interaction.status).toBe(InteractionStatus.Completed);

    const interaction2 = new Interaction({
      stack,
      initialData: {},
    });

    expect(interaction2.status).toBe(InteractionStatus.Pending);
    interaction2.start();
    expect(interaction2.status).toBe(InteractionStatus.InProgress);
    interaction2.cancel();
    expect(interaction2.status).toBe(InteractionStatus.Cancelled);
  });

  it("adds itself to the stack when started", () => {
    const stack = new InteractionStack();
    const interaction = new Interaction({
      stack,
      initialData: {},
    });

    expect(stack.isInStack(interaction)).toBe(false);

    interaction.start();

    expect(stack.isInStack(interaction)).toBe(true);
  });
  it("removes itself from the stack when completed or cancelled", () => {
    const stack = new InteractionStack();
    const interaction = new Interaction({
      stack,
      initialData: {},
    });
    interaction.start();
    expect(stack.isInStack(interaction)).toBe(true);
    interaction.complete();
    expect(stack.isInStack(interaction)).toBe(false);

    const interaction2 = new Interaction({
      stack,
      initialData: {},
    });
    interaction2.start();
    expect(stack.isInStack(interaction2)).toBe(true);
    interaction2.cancel();
    expect(stack.isInStack(interaction2)).toBe(false);
  });

  it("calls subscribers when interactions are started, updated, and completed", () => {
    const stack = new InteractionStack();
    const interaction = new Interaction({
      stack,
      initialData: {},
    });

    const subscriber = mock();
    expect(subscriber).not.toHaveBeenCalled();

    stack.subscribe(subscriber);
    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber).toHaveBeenLastCalledWith(stack);

    interaction.start();
    expect(subscriber).toHaveBeenCalledTimes(2);
    expect(subscriber).toHaveBeenLastCalledWith(stack);

    interaction.data = { test: "data" };
    expect(subscriber).toHaveBeenCalledTimes(3);
    expect(subscriber).toHaveBeenLastCalledWith(stack);

    interaction.complete();
    expect(subscriber).toHaveBeenCalledTimes(4);
    expect(subscriber).toHaveBeenLastCalledWith(stack);
  });

  it("calls `_onStart` when started", () => {
    class TestInteraction extends Interaction<object> {
      _onStart = mock();
    }

    const stack = new InteractionStack();
    const interaction = new TestInteraction({ stack, initialData: {} });

    expect(interaction._onStart).not.toHaveBeenCalled();
    interaction.start();
    expect(interaction._onStart).toHaveBeenCalledTimes(1);
  });
  it("calls `_onComplete` when completed", () => {
    class TestInteraction extends Interaction<object> {
      _onComplete = mock();
      _onCancel = mock();
    }

    const stack = new InteractionStack();
    const interaction = new TestInteraction({ stack, initialData: {} });

    interaction.start();
    interaction.data = { test: "data" };

    expect(interaction._onComplete).not.toHaveBeenCalled();
    interaction.complete();
    expect(interaction._onComplete).toHaveBeenCalledTimes(1);
    expect(interaction._onCancel).not.toHaveBeenCalled();
  });
  it("calls `_onCancel` when cancelled", () => {
    class TestInteraction extends Interaction<object> {
      _onCancel = mock();
      _onComplete = mock();
    }

    const stack = new InteractionStack();
    const interaction = new TestInteraction({ stack, initialData: {} });

    interaction.start();
    interaction.data = { test: "data" };

    expect(interaction._onCancel).not.toHaveBeenCalled();
    interaction.cancel();
    expect(interaction._onCancel).toHaveBeenCalledTimes(1);
    expect(interaction._onComplete).not.toHaveBeenCalled();
  });

  // TODO: Move this test to the Interaction stack tests instead
  it("calls `_onStackPop` when removed from the stack", () => {
    class TestInteraction extends Interaction<object> {
      _onStackPop = mock();
    }

    const stack = new InteractionStack();
    const interaction = new TestInteraction({ stack, initialData: {} });

    interaction.start();

    expect(interaction._onStackPop).not.toHaveBeenCalled();
    stack.remove(interaction);

    expect(interaction._onStackPop).toHaveBeenCalledTimes(1);

    const interaction2 = new TestInteraction({ stack, initialData: {} });
    interaction2.start();

    expect(interaction2._onStackPop).not.toHaveBeenCalled();
    interaction2.complete();
    expect(interaction2._onStackPop).toHaveBeenCalledTimes(1);
  });

  it("calls `_onDispose` after either completing or cancelling", () => {
    class TestInteraction extends Interaction<object> {
      _onCancel = mock();
      _onComplete = mock();
      _onDispose = mock();
    }

    const stack = new InteractionStack();
    const interaction = new TestInteraction({ stack, initialData: {} });

    interaction.start();

    expect(interaction._onDispose).not.toHaveBeenCalled();
    interaction.cancel();
    expect(interaction._onDispose).toHaveBeenCalledTimes(1);

    // Ensure _onDispose is called after _onCancel
    expect(interaction._onDispose.mock.invocationCallOrder[0]).toBeGreaterThan(
      interaction._onCancel.mock.invocationCallOrder[0] as number,
    );

    const interaction2 = new TestInteraction({ stack, initialData: {} });
    interaction2.start();

    expect(interaction2._onDispose).not.toHaveBeenCalled();
    interaction2.complete();
    expect(interaction2._onDispose).toHaveBeenCalledTimes(1);

    // Ensure _onDispose is called after _onComplete
    expect(interaction2._onDispose.mock.invocationCallOrder[0]).toBeGreaterThan(
      interaction2._onComplete.mock.invocationCallOrder[0] as number,
    );
  });
});
