export type OrderStatus = "PENDIENTE" | "ENVIADO" | "ENTREGADO";

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
};