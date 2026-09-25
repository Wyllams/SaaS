export type MessagingUseCase =
  | "TRANSACTIONAL_OPERATIONS"
  | "CUSTOMER_SUPPORT"
  | "MARKETING";

export type WorkspaceMessagingTopology = {
  workspaceId: string;
  twilioSubaccountStrategy: "DEDICATED_PER_WORKSPACE";
  services: Array<{
    useCase: MessagingUseCase;
    serviceKey: string;
  }>;
};

export function planWorkspaceMessagingTopology(input: {
  workspaceId: string;
  useCases: MessagingUseCase[];
}): WorkspaceMessagingTopology {
  const unique = [...new Set(input.useCases)];

  return {
    workspaceId: input.workspaceId,
    twilioSubaccountStrategy: "DEDICATED_PER_WORKSPACE",
    services: unique.map((useCase) => ({
      useCase,
      serviceKey: `${input.workspaceId}:${useCase}`,
    })),
  };
}
