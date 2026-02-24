import { UserModel } from "../users/model";
import { ItemModel } from "../items/model";
import { OrderModel } from "../orders/model";
import type { DashboardStatsDTO } from "./types";

type OrdersCountRow = { _id: string; count: number };

function pickCount(map: Record<string, number>, status: string): number {
    return typeof map[status] === "number" ? map[status] : 0;
}

export async function getStats(): Promise<DashboardStatsDTO> {
    const [userCount, itemCount, countsAgg, revenueAgg] = await Promise.all([
        UserModel.countDocuments({}),
        ItemModel.countDocuments({}),

        // Count orders by status in a single aggregation
        OrderModel.aggregate<OrdersCountRow>([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),

        // Total revenue from all orders
        OrderModel.aggregate([{ $group: { _id: null, totalRevenue: { $sum: "$total" } } }]),
    ]);

    const countsMap = (countsAgg || []).reduce<Record<string, number>>((acc, row) => {
        acc[String(row._id)] = Number(row.count) || 0;
        return acc;
    }, {});

    const ordersPending = pickCount(countsMap, "PENDIENTE");
    const ordersShipped = pickCount(countsMap, "ENVIADO");
    const ordersDelivered = pickCount(countsMap, "ENTREGADO");
    const ordersTotal = ordersPending + ordersShipped + ordersDelivered;

    const totalRevenue = (revenueAgg?.[0]?.totalRevenue as number | undefined) ?? 0;

    return {
        userCount,
        itemCount,

        ordersTotal,
        ordersPending,
        ordersShipped,
        ordersDelivered,

        totalRevenue,
    };
}