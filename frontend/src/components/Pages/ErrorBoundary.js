import { Box, Link } from "@chakra-ui/react";
import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display={"flex"}
          alignItems="center"
          backgroundColor={"white"}
          justifyContent="center"
          width={"100%"}
        >
          <p>
            An error occurred. Please{" "}
            <Link color="teal.500" href="/chats">
              Go Back...
            </Link>
          </p>
        </Box>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
