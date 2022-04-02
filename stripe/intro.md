# Explore Stripe

Recently,
[intelllex.com][1] start to implement online payment for the primary user and marketing overseas.
After some discussion, we decide to using [stripe][2] for the payment service.
There are so many product in [stripe][2] cause a little bit confusing,
if you have not using [stripe][2] before.
So, I put my research for our solution here,
maybe will help you quickly understand and pick solution for your business.

## Concept related to our problem

### [Payments][3]

The online payment integration, they provide both [REST API][7] and many libraries.

### [PaymentLinks][6]

For no code option.
With payment links, you can just copy and share to the customers on the fly.

Because this solution cannot received result from API directly,
much harder to integrate with custom flow.

**Zero code, for none technical business person**

### [Checkout][4]

Checkout provide payment page hosted by Stripe themself for quickly setup,

- Card validation
- Responsive
- 25 languages supports
- Custom theme and branding
- Prevent attack by Fraud

**Minimal code but without need to worry about Fraud or DDoS.**
**We are using this solution**

### [Elements][5]

Prebuilt UI components using React for building custom checkout flow.

They includes some feature like:

- Automatic input formatting
- Responsive Design
- Custom styling
  which really useful in my opinion.

They also provide mobile elements for native application.

**More customizable but take more effort.**

## How About Currencies

When focus on global marketing,
the currencies support is quite important
that provide user the easiest way to paid as much as possible.

But support every kinds of currency around the world will be a nightmare.
Fortunately, Stripe can handle for us so we don't have to doing by ourself.
They charge customers in their native currency and convert into yours.
The customer may be charged a exchange fee.
We can also see [payouts][8] for more information.

[1]: https://intelllex.com/
[2]: https://stripe.com/
[3]: https://stripe.com/payments
[4]: https://stripe.com/checkout
[5]: https://stripe.com/elements
[6]: https://stripe.com/payments/payment-links
[7]: https://stripe.com/docs/api
[8]: https://stripe.com/docs/payouts#multiple-bank-accounts
