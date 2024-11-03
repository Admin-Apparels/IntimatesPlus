import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalBody,
  ModalContent,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useState } from "react";

export const OrderForm = ({ children, receiverEmail }) => {
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [orderID, setOrderID] = useState(null); // Store order ID for future capture

  const handleApprove = async (data) => {
    setLoading(true);
    try {
      // This would be replaced by the server capture endpoint when confirming the transaction
      const response = await fetch("/api/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID: data.orderID }),
      });

      if (!response.ok) {
        throw new Error("Failed to capture the order");
      }

      const result = await response.json();
      console.log("Payment captured successfully!", result);
    } catch (error) {
      console.log("Payment capture error:", error);
    } finally {
      setLoading(false);
      onClose(); // Close the modal after the transaction
    }
  };

  const createOrder = async (data, actions) => {
    const amount = 10; // Adjust this amount based on your needs

    return actions.order
      .create({
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount.toFixed(2),
            },
            payee: {
              email_address: receiverEmail,
            },
          },
        ],
        intent: "AUTHORIZE", // Authorize instead of capture for escrow-like flow
      })
      .then((orderID) => {
        setOrderID(orderID); // Save order ID for later capture
        return orderID;
      });
  };

  // Function to be called on order date to confirm the capture
  const confirmAndCaptureOrder = async () => {
    if (!orderID) return;
    setLoading(true);
    try {
      const response = await fetch("/api/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID }),
      });

      if (!response.ok) {
        throw new Error("Failed to capture the order");
      }

      const result = await response.json();
      toast({
        title: "Payment Released",
        description: "Funds have been successfully released to the receiver.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      console.log("Order captured successfully!", result);
    } catch (error) {
      console.log("Error capturing order:", error);
      toast({
        title: "Capture Error",
        description: "There was an issue releasing the payment.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
            <PayPalScriptProvider
              options={{
                clientId:
                  "ASgI4T_UWqJJpTSaNkqcXbQ9H8ub0f_DAMR8SJByA19N4HtPK0XRgTv4xJjj4Mpx_KxenyLzBDapnJ82",
              }}
            >
              <PayPalButtons
                createOrder={createOrder}
                onApprove={async (data, actions) => {
                  // Authorize payment initially; capture will be manual
                  await handleApprove(data);
                }}
                onCancel={() => {
                  toast({
                    title: "Payment Cancelled",
                    status: "info",
                    isClosable: true,
                    position: "bottom",
                  });
                }}
              />
            </PayPalScriptProvider>
            <button
              onClick={confirmAndCaptureOrder}
              disabled={!orderID || loading}
              style={{ marginTop: "20px" }}
            >
              {loading ? "Processing..." : "Release Payment"}
            </button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
