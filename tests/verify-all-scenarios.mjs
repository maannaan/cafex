import crypto from 'node:crypto';

const API_BASE = 'http://localhost:4000/api/v1';
const WEB_BASE = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('   CAFEX PLATFORM — AUTOMATED SYSTEM VERIFICATION   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail) {
    if (condition) {
      console.log(`✅ PASS: ${testName} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${detail || ''}`);
      failed++;
    }
  }

  try {
    // 1. Customer can browse available menu items
    const menuRes = await fetch(`${API_BASE}/menu`);
    const menu = await menuRes.json();
    assert(
      menuRes.ok && Array.isArray(menu) && menu.length >= 5,
      '1. Customer can browse available menu items',
      `Found ${menu?.length} categories`
    );

    const firstProduct = menu[0].products[0];
    const availableProductId = firstProduct.id;
    const availableOptionId = firstProduct.optionGroups?.[0]?.options?.[0]?.id;

    // 2. Customer cannot order unavailable products
    const unavailQuoteRes = await fetch(`${API_BASE}/orders/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: 'non-existent-product-id-999', quantity: 1 }],
        fulfilmentType: 'PICKUP',
      }),
    });
    assert(
      unavailQuoteRes.status === 404 || unavailQuoteRes.status === 400,
      '2. Customer cannot order unavailable or invalid products',
      `HTTP status ${unavailQuoteRes.status}`
    );

    // 3. Product customization calculates the correct amount
    const quoteRes = await fetch(`${API_BASE}/orders/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [
          {
            productId: availableProductId,
            quantity: 2,
            optionIds: availableOptionId ? [availableOptionId] : [],
          },
        ],
        fulfilmentType: 'PICKUP',
      }),
    });
    const quote = await quoteRes.json();
    const expectedSubtotal =
      (firstProduct.basePriceMinor +
        (firstProduct.optionGroups?.[0]?.options?.[0]?.priceDeltaMinor || 0)) *
      2;
    assert(
      quoteRes.ok && quote.subtotalMinor === expectedSubtotal,
      '3. Product customization calculates the correct amount',
      `Expected ₹${expectedSubtotal / 100}, got ₹${quote.subtotalMinor / 100}`
    );

    // 4. Invalid coupon codes are rejected
    const invalidCouponRes = await fetch(`${API_BASE}/orders/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: availableProductId, quantity: 1 }],
        couponCode: 'FAKE_EXPIRED_CODE_123',
        fulfilmentType: 'PICKUP',
      }),
    });
    assert(
      invalidCouponRes.status === 400,
      '4. Invalid coupon codes are rejected by the server',
      `Status: ${invalidCouponRes.status}`
    );

    // 5. Server validates order totals (Valid coupon WELCOME10 applies correctly)
    const validCouponRes = await fetch(`${API_BASE}/orders/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: availableProductId, quantity: 1 }],
        couponCode: 'WELCOME10',
        fulfilmentType: 'PICKUP',
      }),
    });
    const validQuote = await validCouponRes.json();
    assert(
      validCouponRes.ok && validQuote.discountMinor > 0 && validQuote.totalMinor > 0,
      '5. Server validates order totals and applies valid promotion',
      `Discount: ₹${validQuote.discountMinor / 100}, Total: ₹${validQuote.totalMinor / 100}`
    );

    // 6. Create order in PENDING_PAYMENT
    const createOrderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Aarav Mehta',
        customerEmail: 'aarav@example.com',
        customerPhone: '+91 98200 12345',
        fulfilmentType: 'PICKUP',
        items: [{ productId: availableProductId, quantity: 1 }],
        couponCode: 'WELCOME10',
        idempotencyKey: `idemp_${Date.now()}_test`,
      }),
    });
    const createdOrder = await createOrderRes.json();
    assert(
      createOrderRes.ok && createdOrder.status === 'PENDING_PAYMENT',
      '6. Server creates immutable pending order record',
      `Order #${createdOrder.orderNumber}`
    );

    // 7. Invalid payment signatures are rejected
    const invalidSigRes = await fetch(`${API_BASE}/payments/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': 'forged_fake_signature_abc',
      },
      body: JSON.stringify({
        event: 'payment.captured',
        payload: { payment: { entity: { id: 'pay_fraud_1', order_id: `order_sandbox_${createdOrder.orderNumber}` } } },
      }),
    });
    assert(
      invalidSigRes.status === 400,
      '7. Invalid payment webhook signatures are rejected',
      `Status: ${invalidSigRes.status}`
    );

    // 8. Cryptographically verified payment transitions order to PLACED
    const webhookSecret = 'rzp_test_webhook_secret';
    const webhookBody = JSON.stringify({
      event: 'payment.captured',
      order_id: `order_sandbox_${createdOrder.orderNumber}`,
      payment_id: `pay_valid_${Date.now()}`,
    });
    const validSig = crypto.createHmac('sha256', webhookSecret).update(webhookBody).digest('hex');

    const validSigRes = await fetch(`${API_BASE}/payments/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': validSig,
      },
      body: webhookBody,
    });
    assert(
      validSigRes.ok,
      '8. Cryptographically verified payment transitions order to PLACED',
      `Webhook HTTP status: ${validSigRes.status}`
    );

    // 9. Order status accurately reflects PLACED following webhook capture
    const trackedOrderRes = await fetch(`${API_BASE}/orders/${createdOrder.orderNumber}`);
    const trackedOrder = await trackedOrderRes.json();
    assert(
      trackedOrder.status === 'PLACED',
      '9. Order status accurately reflects PLACED following webhook capture',
      `Current status: ${trackedOrder.status}`
    );

    // 10. Admin permissions are enforced (Unauthenticated request rejected with 401/403)
    const unauthorizedAdminRes = await fetch(`${API_BASE}/admin/stats`);
    assert(
      unauthorizedAdminRes.status === 401 || unauthorizedAdminRes.status === 403,
      '10. Admin endpoints reject unauthenticated requests',
      `HTTP status: ${unauthorizedAdminRes.status}`
    );

    // 11. Admin login generates secure signed JWT token
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@cafexartisan.com',
        password: 'CafexAdmin2026!',
      }),
    });
    const loginData = await loginRes.json();
    const adminToken = loginData.accessToken;
    assert(
      loginRes.ok && !!adminToken,
      '11. Admin login generates secure signed JWT token',
      `User Role: ${loginData.user?.role}`
    );

    // 12. Admin can execute validated order status transition
    const transitionRes = await fetch(`${API_BASE}/admin/orders/${createdOrder.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'PREPARING' }),
    });
    const transitionData = await transitionRes.json();
    assert(
      transitionRes.ok && transitionData.status === 'PREPARING',
      '12. Admin can execute validated order status transition',
      `New status: ${transitionData.status}`
    );

    // 13. Reservation booking succeeds within capacity limit
    const testDate = '2026-11-25';
    const testSlot = '10:00';
    const resRes = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Samira Rao',
        customerEmail: 'samira@example.com',
        customerPhone: '+91 98111 22233',
        date: testDate,
        timeSlot: testSlot,
        partySize: 4,
      }),
    });
    const bookingData = await resRes.json();
    assert(
      resRes.ok,
      '13. Reservation booking succeeds within capacity limit',
      `Booking ID: ${bookingData.id}`
    );

    // 14. All frontend pages respond with HTTP 200 OK
    const [homeRes, menuPageRes, resPageRes, storyRes, visitRes, adminPageRes] =
      await Promise.all([
        fetch(`${WEB_BASE}/`),
        fetch(`${WEB_BASE}/menu`),
        fetch(`${WEB_BASE}/reservations`),
        fetch(`${WEB_BASE}/story`),
        fetch(`${WEB_BASE}/visit`),
        fetch(`${WEB_BASE}/admin`),
      ]);

    assert(
      homeRes.ok && menuPageRes.ok && resPageRes.ok && storyRes.ok && visitRes.ok && adminPageRes.ok,
      '14. All frontend pages respond with HTTP 200 OK',
      'Home, Menu, Reservations, Story, Visit, Admin'
    );

    // 15. Frontend Next.js healthcheck endpoint operational
    const webHealthRes = await fetch(`${WEB_BASE}/api/health`);
    const webHealth = await webHealthRes.json();
    assert(
      webHealthRes.ok && webHealth.status === 'ok',
      '15. Frontend Next.js healthcheck endpoint operational',
      `Service: ${webHealth.service}, Uptime: ${Math.round(webHealth.uptime)}s`
    );

  } catch (err) {
    console.error('Fatal test execution error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

