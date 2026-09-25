export type AddressInput = {
  line1: string;
  city: string;
  region: string;
  postalCode: string;
  country?: string;
};

export function buildCustomer(input: {
  displayName: string;
  email?: string;
  phone?: string;
  address?: AddressInput;
}) {
  if (!input.displayName.trim()) throw new Error("DisplayName is required");

  return {
    DisplayName: input.displayName,
    ...(input.email
      ? { PrimaryEmailAddr: { Address: input.email } }
      : {}),
    ...(input.phone
      ? { PrimaryPhone: { FreeFormNumber: input.phone } }
      : {}),
    ...(input.address
      ? {
          BillAddr: {
            Line1: input.address.line1,
            City: input.address.city,
            CountrySubDivisionCode: input.address.region,
            PostalCode: input.address.postalCode,
            ...(input.address.country
              ? { Country: input.address.country }
              : {}),
          },
        }
      : {}),
  };
}

export function buildInvoice(input: {
  customerId: string;
  itemId: string;
  amount: number;
  description: string;
  crewCommandInvoiceId: string;
}) {
  if (input.amount <= 0) throw new Error("Invoice amount must be positive");

  return {
    CustomerRef: { value: input.customerId },
    PrivateNote: `CrewCommand Invoice ${input.crewCommandInvoiceId}`,
    Line: [
      {
        Amount: input.amount,
        Description: input.description,
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          ItemRef: { value: input.itemId },
        },
      },
    ],
  };
}

export function buildPayment(input: {
  customerId: string;
  invoiceId: string;
  amount: number;
  crewCommandPaymentId: string;
}) {
  if (input.amount <= 0) throw new Error("Payment amount must be positive");

  return {
    CustomerRef: { value: input.customerId },
    TotalAmt: input.amount,
    PrivateNote: `CrewCommand Payment ${input.crewCommandPaymentId}`,
    Line: [
      {
        Amount: input.amount,
        LinkedTxn: [
          {
            TxnId: input.invoiceId,
            TxnType: "Invoice",
          },
        ],
      },
    ],
  };
}

export function buildSparseInvoiceUpdate(input: {
  id: string;
  syncToken: string;
  dueDate: string;
}) {
  return {
    Id: input.id,
    SyncToken: input.syncToken,
    sparse: true,
    DueDate: input.dueDate,
  };
}
