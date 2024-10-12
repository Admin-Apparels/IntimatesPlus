import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalBody,
  ModalContent,
  useDisclosure,
} from "@chakra-ui/react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useState } from "react";

export const OrderForm = ({ children }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Create PaymentIntent on the server
    const { clientSecret } = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 100, currency: "usd" }), // Replace with dynamic amount
    }).then((res) => res.json());

    const cardElement = elements.getElement(CardElement);
    const paymentResult = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (paymentResult.error) {
      console.log(paymentResult.error.message);
      setLoading(false);
    } else {
      console.log("Payment successful!");
      // Update backend order status
      setLoading(false);
    }
  };

  return (
    <>
      {children ? (
        <span
          onClick={() => {
            onOpen();
          }}
        >
          {children}
        </span>
      ) : (
        <ViewIcon
          display={{ base: "flex" }}
          onClick={() => {
            onOpen();
          }}
        />
      )}
      <Modal size={"lg"} onClose={onClose} isOpen={isOpen} isCentered>
        <ModalContent>
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <CardElement />
              <button type="submit" disabled={!stripe || loading}>
                {loading ? "Processing..." : "Place Order"}
              </button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
