# Session-Based Order Management Implementation Guide

## Overview
Your application now has a complete session and order management system that tracks:
- QR code-based table sessions
- Customer names per order
- Full order lifecycle (pending → accepted → preparing → ready → delivered)
- Admin confirmation and order serving

## What's Been Created

### Backend API Routes

1. **POST /api/sessions** - Create a new session for a table
   ```json
   Request: { "tableNumber": 1 }
   Response: { "session": { "id": "uuid", "tableNumber": 1, "qrCode": "token", ... } }
   ```

2. **GET /api/sessions** - Retrieve session by ID, QR code, or table
   ```
   GET /api/sessions?id=<session-id>
   GET /api/sessions?qr=<qr-code>
   GET /api/sessions?table=<table-number>
   ```

3. **POST /api/orders** - Place a new order
   ```json
   Request: {
     "tableNumber": 1,
     "sessionId": "uuid",
     "customerName": "John Doe",
     "items": [{ "id": "menu-item-1", "quantity": 2 }],
     "note": "No onions"
   }
   ```

4. **GET /api/admin/orders** - Get orders (admin only)
   ```
   GET /api/admin/orders?session_id=<id>
   GET /api/admin/orders?table_number=1
   GET /api/admin/orders?status=pending
   ```

5. **PATCH /api/admin/orders** - Update order status (admin only)
   ```json
   Request: { "status": "preparing", "prepMinutes": 15 }
   Statuses: "pending" → "preparing" → "ready" → "delivered"
   ```

### Frontend Libraries

**src/lib/session-store.ts** - Session and order management
```typescript
// Create session for a table
const session = await createSession(tableNumber);

// Set customer name
setCustomerName("John Doe");

// Place an order
const order = await placeOrder([
  { id: "item-1", quantity: 2 },
  { id: "item-2", quantity: 1 }
], "No onions");

// Get all orders for current session
const orders = await getSessionOrders(sessionId);

// Update order status (admin)
await updateOrderStatus(orderId, "preparing", 15);
```

### Frontend Components

**src/components/session-initializer.tsx** - Shows name input modal
- Displays on page load if no active session
- Creates session and stores customer name
- Blocks menu access until session is initialized

## Integration Steps

### 1. Update Your Main App Page

In your app page or layout where MenuExperience is rendered:

```typescript
import { SessionInitializer } from "@/components/session-initializer";
import { MenuExperience } from "@/components/menu-experience";
import { getCurrentSession } from "@/lib/session-store";
import { useState } from "react";

export default function TablePage() {
  const tableNumber = getTableNumberFromURL(); // Your logic to get table
  const [sessionReady, setSessionReady] = useState(!!getCurrentSession());

  if (!sessionReady) {
    return <SessionInitializer tableNumber={tableNumber} onSessionReady={() => setSessionReady(true)} />;
  }

  return <MenuExperience tableNumber={tableNumber} />;
}
```

### 2. Update Menu Experience to Send Session Data

In menu-experience.tsx, when submitting an order, pass the session:

```typescript
// Around line where order is submitted:
const { getCurrentSession, placeOrder } = await import("@/lib/session-store");

async function submitOrder() {
  const session = getCurrentSession();
  
  // Create items array from cart
  const items = cart.map(item => ({
    id: item.menuItem.id,
    quantity: item.quantity
  }));

  try {
    const order = await placeOrder(items, orderNote);
    // Order now has: id, sessionId, customerName, status, etc.
    // Handle response...
  } catch (error) {
    // Handle error
  }
}
```

### 3. Create Admin Order Tracker Component

Create a new component to show admin the incoming orders:

```typescript
// src/components/admin-order-tracker.tsx
"use client";

import { useEffect, useState } from "react";
import { usePolling } from "@/hooks/use-polling"; // You may need to create this

type Order = {
  id: string;
  customer_name: string;
  table_number: number;
  status: string;
  items: any[];
  total_cents: number;
};

export function AdminOrderTracker() {
  const [orders, setOrders] = useState<Order[]>([]);

  // Poll for pending orders every 2 seconds
  usePolling(async () => {
    const response = await fetch("/api/admin/orders?status=pending", {
      headers: { "Authorization": "Bearer admin" }
    });
    const data = await response.json();
    setOrders(data.orders || []);
  }, 2000);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map(order => (
        <div key={order.id} className="bg-white border-2 border-yellow-400 rounded-lg p-4">
          <h3 className="font-bold text-lg">{order.customer_name}</h3>
          <p className="text-sm text-gray-600">Table {order.table_number}</p>
          
          <div className="mt-2 mb-4">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="text-sm">
                {item.quantity}x {item.title}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => updateStatus(order.id, "preparing")}
              className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm font-bold"
            >
              Accept & Prepare
            </button>
            <button
              onClick={() => updateStatus(order.id, "rejected")}
              className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm font-bold"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 4. Create Order Status Display for Customers

```typescript
// src/components/customer-order-status.tsx
"use client";

import { useEffect, useState } from "react";
import { getSessionOrders } from "@/lib/session-store";
import { getCurrentSession } from "@/lib/session-store";

export function CustomerOrderStatus() {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    const session = getCurrentSession();
    if (!session) return;

    const pollOrders = async () => {
      const sessionOrders = await getSessionOrders(session.id);
      setOrders(sessionOrders);
    };

    pollOrders();
    const interval = setInterval(pollOrders, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div key={order.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold">{order.customerName}'s Order</span>
            <span className="text-sm font-bold px-2 py-1 rounded bg-blue-200">
              {order.status.toUpperCase()}
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            {order.status === "pending" && "Your order has been received"}
            {order.status === "preparing" && `Preparing... (~${order.prepMinutes} min)`}
            {order.status === "ready" && "🎉 Your order is ready!"}
            {order.status === "delivered" && "✓ Order delivered"}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Database Schema

Your Supabase now has:

### restaurant_tables
- `id` (UUID) - Primary key
- `table_number` (INT) - Table number (1-10)
- `capacity` (INT) - Number of seats

### sessions
- `id` (UUID) - Session ID
- `table_id` (UUID) - Reference to table
- `table_number` (INT) - Denormalized for query speed
- `qr_code_token` (TEXT) - Unique QR code token
- `session_start` (TIMESTAMP) - When session started
- `is_active` (BOOLEAN) - Whether session is still open

### orders
- `id` (UUID) - Order ID
- `session_id` (UUID) - Which session this order belongs to
- `table_id` (UUID) - Which table
- `table_number` (INT) - Denormalized table number
- `customer_name` (TEXT) - Name of person who ordered
- `status` (TEXT) - pending, accepted, preparing, ready, delivered, rejected, cancelled
- `items` (JSONB) - Array of {id, title, category, quantity, unitPrice, lineTotal}
- `total_cents` (INT) - Order total in cents
- `prep_minutes` (INT) - Expected prep time
- `customer_note` (TEXT) - Special requests
- `accepted_at`, `rejected_at`, `delivered_at` (TIMESTAMP) - Status timestamps
- `created_at` (TIMESTAMP) - Order creation time

## Order Flow

```
Customer scans QR code
  ↓
SessionInitializer asks for name (creates session)
  ↓
Customer browses menu & adds items
  ↓
Customer submits order via /api/orders
  ├─ Creates order with sessionId and customerName
  ├─ Status: "pending"
  ↓
Admin sees order in /api/admin/orders?status=pending
  ↓
Admin clicks "Accept & Prepare" → PATCH /api/admin/orders?id=X {status: "preparing"}
  ├─ Order status → "preparing"
  ├─ accepted_at timestamp set
  ↓
Admin continues preparing order
  ↓
Admin marks ready → PATCH {status: "ready"}
  ├─ Order status → "ready"
  ↓
Admin delivers to table → PATCH {status: "delivered"}
  ├─ Order status → "delivered"
  ├─ delivered_at timestamp set
  ↓
Customer sees "Order delivered" in CustomerOrderStatus component
```

## Environment Variables (Already in Vercel)

These must be set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon key for browser
- `SUPABASE_URL` - Server URL
- `SUPABASE_SERVICE_ROLE_KEY` - Server service role key

## Key Features Implemented

✅ QR code-based sessions per table
✅ Multiple customers per table
✅ Each customer has unique orders with their name
✅ Admin can confirm, accept, prepare, and serve orders
✅ Full order status tracking with timestamps
✅ Customer sees live order status
✅ Order history in database for feedback/analytics

## Next Steps

1. **Test the API** - Use curl or Postman to test endpoints
2. **Integrate SessionInitializer** - Add to your main page
3. **Update MenuExperience** - Pass session data when creating orders
4. **Build Admin Dashboard** - Create admin order tracker component
5. **Build Customer Status Display** - Show customers their order status
6. **Add Real-time Updates** - Consider WebSockets or polling for live updates

## Troubleshooting

**"Staff access required" error on admin endpoints**
- Make sure you're authenticated as admin
- Check `/src/lib/admin-auth.ts` for admin auth logic

**Orders not showing session_id or customer_name**
- Verify MenuExperience is passing sessionId and customerName to /api/orders
- Check browser console for errors

**Database errors**
- Verify Supabase keys are correct in Vercel
- Check Supabase SQL Editor for table structure
- Run the provided SQL query again if tables are missing
