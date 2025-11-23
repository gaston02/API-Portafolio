import createMercadoPagoProvider from "./paymentProviders/mercadoPago.service.js";
import createStripeProvider from "./paymentProviders/stripe.service.js";
import createPaypalProvider from "./paymentProviders/paypal.service.js";

export default function providerFactory(name, deps = {}) {
  const key = (name || "").toLowerCase();
  switch (key) {
    case "mercadopago":
    case "mp":
      return createMercadoPagoProvider(deps.mercadopago || {});
    case "stripe":
    case "st":
      return createStripeProvider(deps.stripe || {});
    case "paypal":
    case "pp":
      return createPaypalProvider(deps.paypal || {});
    default:
      return null;
  }
}
