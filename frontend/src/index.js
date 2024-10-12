import React from "react";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ChakraProvider } from "@chakra-ui/react";
import ChatProvider from "./components/Context/ChatProvider";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";

const domNode = document.getElementById("root");
const root = createRoot(domNode);

root.render(
  <ChakraProvider>
    <BrowserRouter>
      <ChatProvider>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <App />
        </ThemeProvider>
      </ChatProvider>
    </BrowserRouter>
  </ChakraProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
