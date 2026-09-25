export type LocalInvoice = {
  externalId: string;
  externalSyncToken: string;
  total: number;
  balance: number;
  status: "OPEN" | "PAID";
};

export type QboInvoice = {
  Id: string;
  SyncToken: string;
  TotalAmt: number;
  Balance: number;
};

export function reconcileInvoice(
  local: LocalInvoice,
  remote: QboInvoice,
) {
  if (local.externalId !== remote.Id) {
    throw new Error("Invoice IDs do not match");
  }

  const remoteStatus: LocalInvoice["status"] =
    remote.Balance === 0 ? "PAID" : "OPEN";

  return {
    changed:
      local.externalSyncToken !== remote.SyncToken ||
      local.total !== remote.TotalAmt ||
      local.balance !== remote.Balance ||
      local.status !== remoteStatus,
    next: {
      ...local,
      externalSyncToken: remote.SyncToken,
      total: remote.TotalAmt,
      balance: remote.Balance,
      status: remoteStatus,
    },
  };
}
