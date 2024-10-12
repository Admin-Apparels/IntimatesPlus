import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalBody,
  ModalContent,
  useDisclosure,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";

export const OrderForm = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const loadScript = async () => {
      await loadPayPalScript();
    };

    loadScript();
  }, []);

  const handleApprove = async (data) => {
    setLoading(true);
    try {
      // Capture the order on the server
      const response = await fetch("/api/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID: data.orderID }),
      });

      if (!response.ok) {
        throw new Error("Failed to capture the order");
      }

      const result = await response.json();
      console.log("Payment successful!", result);
    } catch (error) {
      console.log("Payment error:", error);
    } finally {
      setLoading(false);
      onClose(); // Close the modal after the transaction
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      // Create the order on the server
      const response = await fetch("/api/create-payment-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 100, currency: "usd" }), // Replace with dynamic amount
      });

      const { orderID } = await response.json();

      // Render the PayPal button
      window.paypal
        .Buttons({
          createOrder: () => orderID,
          onApprove: (data) => handleApprove(data),
          onError: (err) => console.error("PayPal Checkout onError:", err),
        })
        .render("#paypal-button-container");
    } catch (error) {
      console.log("Error creating order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <ViewIcon display={{ base: "flex" }} onClick={onOpen} />
      )}
      <Modal size={"lg"} onClose={onClose} isOpen={isOpen} isCentered>
        <ModalContent>
          <ModalBody>
            <form onSubmit={handleSubmit}>
              <div id="paypal-button-container"></div>
              <button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Place Order"}
              </button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

const loadPayPalScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.PAYPAL_CLIENT_ID}`;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
};
