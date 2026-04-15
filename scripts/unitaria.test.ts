import { expect, test } from 'vitest'

const order = {
    order_number: '000045',
    customer_id: '20162000476',
    customer_name: 'Curco Bein',
    customer_phone: '+50495221031',
    status: "pending",
    total_price: -120,
    is_guest_order: false,
    reward_points_earned: 0,
}

test('El precio total deberia de ser mayor a 0', () => {
    expect(order.total_price).toBeGreaterThanOrEqual(0);
})
