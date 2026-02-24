export type OrderStatus = "PENDIENTE" | "ENVIADO" | "ENTREGADO";

export type EmailStatus = "PENDING" | "SENT" | "FAILED";

export type OrderItemDTO = {
    productId: string;
    name: string;
    price: number;
    quantity: number;
};

export type OrderDTO = {
    id: string;
    name: string;
    email: string;
    phone: string;
    note: string | null;
    items: OrderItemDTO[];
    total: number;
    status: OrderStatus;
    createdAt: string | null;
    updatedAt: string | null;

    // Email tracking (admin visibility)
    emailStatus: EmailStatus;
    emailAttempts: number;
    emailLastAttemptAt: string | null;
    emailSentAt: string | null;
    emailLastError: string | null;
};