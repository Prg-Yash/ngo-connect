import Razorpay from 'razorpay';

export async function POST(req) {
  try {
    const { amount, userId, ngoId, rzpKeyId, rzpKeySecret } = await req.json();
    const parsedAmount = Number(amount);

    if (!userId || !ngoId || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid donation payload' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const keyId = rzpKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = rzpKeySecret || process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return new Response(
        JSON.stringify({ error: 'Razorpay credentials are not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Razorpay order
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(parsedAmount * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: `receipt_order_${Math.random()}`,
      notes: {
        userId,
      },
    });

    return new Response(JSON.stringify({ orderId: order.id, amount: order.amount }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Optionally, you can export other methods if needed