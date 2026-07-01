import type { MenuItem } from "@/lib/menu";

export type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "served"
  | "rejected"
  | "cancel_requested"
  | "cancelled";

export type CartItem = {
  menuItem: MenuItem;
  quantity: number;
};

export type OrderItem = {
  id: string;
  title: string;
  category: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type RestaurantOrder = {
  id: string;
  orderNumber: number;
  tableNumber: number;
  sessionId?: string;
  customerName?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  prepMinutes: number;
  createdAt: string;
  customerNote?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  cancelRequestedAt?: string;
  cancelledAt?: string;
  deliveredAt?: string;
};

type OrderIdPrefix = "demo" | "order";

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Order Received",
  preparing: "Preparing",
  ready: "Ready for Delivery",
  served: "Delivered",
  rejected: "Rejected",
  cancel_requested: "Cancel Requested",
  cancelled: "Cancelled",
};

export const orderStages: OrderStatus[] = ["pending", "preparing", "ready", "served"];

export function cartToOrderItems(cart: CartItem[]): OrderItem[] {
  return cart.map(({ menuItem, quantity }) => ({
    id: menuItem.id,
    title: menuItem.title,
    category: menuItem.category,
    quantity,
    unitPrice: menuItem.price,
    lineTotal: menuItem.price * quantity,
  }));
}

export function createOrderFromCart(
  tableNumber: number,
  cart: CartItem[],
  idPrefix: OrderIdPrefix = "order",
  options?: { sessionId?: string; customerName?: string },
): RestaurantOrder {
  const subtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const total = Number((subtotal * 1.1).toFixed(2));

  return {
    id: `${idPrefix}-${crypto.randomUUID()}`,
    orderNumber: Math.floor(1000 + Math.random() * 9000),
    tableNumber,
    sessionId: options?.sessionId,
    customerName: options?.customerName,
    items: cartToOrderItems(cart),
    total,
    status: "pending",
    prepMinutes: 0,
    createdAt: new Date().toISOString(),
  };
}

export function createDemoOrder(tableNumber: number, cart: CartItem[]): RestaurantOrder {
  return createOrderFromCart(tableNumber, cart, "demo");
}

export const demoOrders: RestaurantOrder[] = [
  {
    id: "demo-1008",
    orderNumber: 1008,
    tableNumber: 3,
    status: "preparing",
    prepMinutes: 18,
    total: 30.3,
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    acceptedAt: new Date(Date.now() - 1000 * 60 * 7).toISOString(),
    items: [
      {
        id: "chicken-pesto-sandwich",
        title: "Chicken Pesto Sandwich",
        category: "Main Course",
        quantity: 2,
        unitPrice: 12.9,
        lineTotal: 25.8,
      },
      {
        id: "cappuccino",
        title: "Cappuccino",
        category: "Coffee",
        quantity: 1,
        unitPrice: 4.5,
        lineTotal: 4.5,
      },
    ],
  },
  {
    id: "demo-1009",
    orderNumber: 1009,
    tableNumber: 1,
    status: "pending",
    prepMinutes: 20,
    total: 43.2,
    createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    items: [
      {
        id: "tagliatelle-ragu",
        title: "Tagliatelle al Ragu",
        category: "Pasta",
        quantity: 1,
        unitPrice: 16.9,
        lineTotal: 16.9,
      },
      {
        id: "pizza-diavola",
        title: "Pizza Diavola",
        category: "Pizza",
        quantity: 1,
        unitPrice: 15.2,
        lineTotal: 15.2,
      },
      {
        id: "negroni",
        title: "Negroni",
        category: "Cocktails",
        quantity: 1,
        unitPrice: 11.5,
        lineTotal: 11.5,
      },
    ],
  },
];
