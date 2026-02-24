import * as OrdersService from "../orders/service";
import type { TrackOrderBody } from "./trackOrder.schemas";

export async function trackOrder(body: TrackOrderBody) {
    return OrdersService.trackOrder(body.orderId, body.email);
}