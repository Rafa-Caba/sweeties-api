export type DashboardStatsDTO = {
    userCount: number;
    itemCount: number;

    ordersTotal: number;
    ordersPending: number;
    ordersShipped: number;
    ordersDelivered: number;

    failedEmailsCount: number;

    totalRevenue: number;
};