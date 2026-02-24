import mongoose, { type InferSchemaType } from "mongoose";
import type { EmailStatus, OrderDTO, OrderStatus } from "./types";

const OrderItemSchema = new mongoose.Schema(
    {
        productId: { type: String, required: true, trim: true },
        name: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
    },
    { _id: false }
);

const OrderSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        phone: { type: String, required: true, trim: true },
        note: { type: String, default: null },

        items: { type: [OrderItemSchema], default: [] },

        total: { type: Number, required: true, min: 0 },

        status: {
            type: String,
            enum: ["PENDIENTE", "ENVIADO", "ENTREGADO"],
            default: "PENDIENTE",
            required: true,
        },

        // Email tracking
        emailStatus: {
            type: String,
            enum: ["PENDING", "SENT", "FAILED"],
            default: "PENDING",
            required: true,
        },
        emailAttempts: { type: Number, default: 0, required: true },
        emailLastAttemptAt: { type: Date, default: null },
        emailSentAt: { type: Date, default: null },
        emailLastError: { type: String, default: null },
    },
    { timestamps: true }
);

OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ email: 1, createdAt: -1 });
OrderSchema.index({ phone: 1, createdAt: -1 });
OrderSchema.index({ total: 1, createdAt: -1 });

// Helpful for admin retry view
OrderSchema.index({ emailStatus: 1, emailLastAttemptAt: -1 });

export type OrderDoc = InferSchemaType<typeof OrderSchema> & {
    _id: mongoose.Types.ObjectId;
    status: OrderStatus;
    emailStatus: EmailStatus;
};

export const OrderModel =
    (mongoose.models.Order as mongoose.Model<OrderDoc>) ||
    mongoose.model<OrderDoc>("Order", OrderSchema);

export function toOrderDTO(o: OrderDoc): OrderDTO {
    return {
        id: o._id.toString(),
        name: o.name,
        email: o.email,
        phone: o.phone,
        note: o.note ?? null,
        items: Array.isArray(o.items) ? o.items : [],
        total: o.total,
        status: o.status,
        createdAt: o.createdAt ? o.createdAt.toISOString() : null,
        updatedAt: o.updatedAt ? o.updatedAt.toISOString() : null,

        emailStatus: o.emailStatus ?? "PENDING",
        emailAttempts: typeof o.emailAttempts === "number" ? o.emailAttempts : 0,
        emailLastAttemptAt: o.emailLastAttemptAt ? o.emailLastAttemptAt.toISOString() : null,
        emailSentAt: o.emailSentAt ? o.emailSentAt.toISOString() : null,
        emailLastError: o.emailLastError ?? null,
    };
}