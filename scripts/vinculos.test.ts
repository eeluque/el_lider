import { expect, test } from 'vitest'

const orders = [
    {
        order_number: '000001',
        customer_id: '20162000476',
        customer_name: 'Curco Bein',
        customer_phone: '+50495221031',
        status: 'completed',
        total_price: 120,
        is_guest_order: false,
        reward_points_earned: 12,
        created_at: '2026-04-14 09:15:23.294779+00'
    },
    {
        order_number: '000002',
        customer_id: '20162000477',
        customer_name: 'Maria Lopez',
        customer_phone: '+50498765432',
        status: 'pending',
        total_price: 250,
        is_guest_order: true,
        reward_points_earned: 0,
        created_at: '2026-04-14 10:05:11.294779+00'
    },
    {
        order_number: '000003',
        customer_id: '20162000478',
        customer_name: 'Jose Martinez',
        customer_phone: '+50492345678',
        status: 'preparing',
        total_price: 180,
        is_guest_order: false,
        reward_points_earned: 18,
        created_at: '2026-04-14 11:22:47.294779+00'
    },
    {
        order_number: '000004',
        customer_id: '20162000479',
        customer_name: 'Ana Rivera',
        customer_phone: '+50491234567',
        status: 'delivered',
        total_price: 95,
        is_guest_order: false,
        reward_points_earned: 9,
        created_at: '2026-04-14 12:40:30.294779+00'
    },
    {
        order_number: '000005',
        customer_id: '20162000480',
        customer_name: 'Luis Hernandez',
        customer_phone: '+50499887766',
        status: 'cancelled',
        total_price: 140,
        is_guest_order: true,
        reward_points_earned: 0,
        created_at: '2026-04-14 13:55:02.294779+00'
    }
];



test('Deberia de haber una orden cancelada hoy para reportar en las ventas diarias', () => {
    const getDailySalesSummary = (orders: any[]) => {
        return orders.reduce(
            (summary, order) => {
                if (order.status === 'cancelled') {
                    summary.cancelledOrdersCount += 1;
                    summary.totalSales -= order.total_price;
                } else {
                    summary.totalSales += order.total_price;
                }

                return summary;
            },
            {
                totalSales: 0,
                cancelledOrdersCount: 0
            }
        );
    }

    expect(getDailySalesSummary(orders).cancelledOrdersCount).toBe(1);
})
