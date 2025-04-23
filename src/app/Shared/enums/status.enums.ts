import { RefList } from "../Models/Ref-list.model";

export enum Status {
        pending= "pending",
        confirmed= "confirmed",
        picked_up= "picked-up",
        delivered= "delivered",
        canceled= "canceled",
        returned= "returned"
}
// order-status.config.ts (or in your component)
export const OrderStatus = {
    pending: {
      label: 'Pending',
      color: 'bg-yellow-500',
      icon: 'hourglass_empty', // Material icon
    },
    confirmed: {
      label: 'Confirmed',
      color: 'bg-blue-500',
      icon: 'check_circle',
    },
    picked_up: {
      label: 'Picked-up',
      color: 'bg-indigo-500',
      icon: 'local_shipping',
    },
    delivered: {
      label: 'Delivered',
      color: 'bg-green-600',
      icon: 'inventory_2',
    },
    canceled: {
      label: 'Canceled',
      color: 'bg-red-500',
      icon: 'cancel',
    },
    returned: {
      label: 'Returned',
      color: 'bg-orange-500',
      icon: 'undo',
    },
  };

  export const listOrderStatus: RefList<Status>[] = [
    { key: Status.canceled, value: 'canceled' },
    { key: Status.confirmed, value: 'confirmed' },
    { key: Status.returned, value: 'returned' },
    { key: Status.picked_up, value: 'picked-up' },
    { key: Status.delivered, value: 'delivered' },
    { key: Status.pending, value: 'pending' },
  ];
  