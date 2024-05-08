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
