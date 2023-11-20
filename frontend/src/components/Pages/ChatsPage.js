import { Box } from "@chakra-ui/layout";
import { useEffect, useState } from "react";
import Chatbox from "../Chatbox";
import MyChats from "../MyChats";
import SideDrawer from "../miscellanious/SideDrawer";
import ErrorBoundary from "./ErrorBoundary";
import { ChatState } from "../Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import Ads from "../miscellanious/ads";

const Chatpage = () => {
  const navigate = useNavigate();
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user, setUser } = ChatState();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) {
      navigate("/");
    }
    const handleStorageChange = (e) => {
      if (e.key === "userInfo") {
        const updatedUserInfo = JSON.parse(e.newValue);
        setUser(updatedUserInfo);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate, setUser]);

  return (
    <Box width="100%">
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        {user && <SideDrawer />}{" "}
        {user && user.accountType !== "Gold" && <Ads />}
        <Box
          display="flex"
          justifyContent="space-between"
          w="100%"
          h="91.5vh"
          p="0.2rem"
        >
          {" "}
          {user && <MyChats fetchAgain={fetchAgain} />}
          {user && (
            <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          )}
        </Box>
      </ErrorBoundary>
    </Box>
  );
};

export default Chatpage;
