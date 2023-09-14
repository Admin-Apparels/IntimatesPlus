import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import { Badge } from "@chakra-ui/react";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import { Spinner } from "@chakra-ui/spinner";
import ClientModal from "../miscellanious/Client";

import { getSenderName } from "../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../Context/ChatProvider";
import MatchModal from "./Match";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
    onlineUsersCount,
  } = ChatState();
  console.log(chats);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history("/");
  };

  const accessChat = async (userId, user) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId, user }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);

      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  function formatOnlineUsersCount(onlineUsersCount) {
    if (onlineUsersCount < 1000) {
      return onlineUsersCount.toString();
    } else if (onlineUsersCount < 10000) {
      return `${(onlineUsersCount / 1000).toFixed(1)}k`;
    } else {
      return `${(onlineUsersCount / 1000).toFixed(1)}k`;
    }
  }

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
      >
        <Tooltip
          label="Search Users to chat"
          placement="bottom-end"
          color={"green"}
          backgroundColor={"transparent"}
        >
          <Button variant="ghost" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text display={{ base: "none", md: "flex" }} px={4}>
              Search Chat
            </Text>
          </Button>
        </Tooltip>
        {user.gender === "male" && <MatchModal />}
        <Tooltip
          label="Users Online"
          placement="top"
          color={"green"}
          backgroundColor={"transparent"}
        >
          {formatOnlineUsersCount(onlineUsersCount)}
        </Tooltip>

        <div>
          <Menu>
            <MenuButton p={1} position="relative">
              <BellIcon fontSize="2xl" p={0} m={0} />
              {notification.length > 0 && (
                <Badge
                  variant="subtle"
                  position="absolute"
                  top="-3px"
                  right="-3px"
                  backgroundColor={"red"}
                  zIndex={1}
                  borderRadius={"50%"}
                  color="white"
                >
                  {notification.length}
                </Badge>
              )}
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                    const otherNotifications = notification.filter(
                      (n) => n.chat._id !== notif.chat._id
                    );
                    setNotification(otherNotifications);
                  }}
                >
                  {`New Message from ${getSenderName(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} bg="white" rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ClientModal user={user}>
                <MenuItem>My Profile</MenuItem>{" "}
              </ClientModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Chat</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Box>
            {search !== "" ? (
              chats.length > 0 ? (
                chats
                  .filter((chat) =>
                    chat.users.some(
                      (participant) =>
                        participant._id !== user._id &&
                        (participant.name
                          .toLowerCase()
                          .includes(search.toLowerCase()) ||
                          participant.email
                            .toLowerCase()
                            .includes(search.toLowerCase()))
                    )
                  )
                  .map((chat) => {
                    const otherParticipant = chat.users.find(
                      (participant) => participant._id !== user._id
                    );

                    return (
                      <UserListItem
                        key={otherParticipant._id}
                        user={otherParticipant}
                        handleFunction={() =>
                          accessChat(otherParticipant._id, user)
                        }
                      />
                    );
                  })
              ) : (
                <Text>No chats were found.</Text>
              )
            ) : (
              <Text>Start typing to search for chats...</Text>
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
