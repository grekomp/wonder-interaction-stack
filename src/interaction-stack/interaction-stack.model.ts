import { Interaction } from "src/interaction-stack/interaction";

export enum InteractionStatus {
  Pending = "Pending",
  InProgress = "InProgress",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export type InteractionConstructor<ClassType extends Interaction<unknown>> = {
  new (
    ...props: ConstructorParameters<
      typeof Interaction<GetInteractionDataType<ClassType>>
    >
  ): ClassType;
};

export type GetInteractionDataType<ClassType extends Interaction<unknown>> =
  ClassType extends Interaction<infer InnerType> ? InnerType : never;

/**
 * Used for generic arguments where the type is not needed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyData = any;
