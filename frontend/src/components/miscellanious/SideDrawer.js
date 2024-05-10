import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import { Badge, Image } from "@chakra-ui/react";
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
  DrawerCloseButton,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import { Spinner } from "@chakra-ui/spinner";
import ClientModal from "../miscellanious/Client";

import { getSenderName } from "../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../Context/ChatProvider";
import MatchModal from "./Match";
import LoveIcon from "./loveIcon";
import Notifier from "./Notifier";

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
  } = ChatState() || {};

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modal, setModal] = useState(false);
  const history = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history("/");
  };
  // const displayValue = useBreakpointValue({ base: "none", md: "flex" });

  // const textVisibility = useBreakpointValue({
  //   base: "hidden",
  //   md: "visible",
  // });
  const OverlayOne = () => (
    <DrawerOverlay
      bg="blackAlpha.300"
      backdropFilter="blur(10px) hue-rotate(90deg)"
    />
  );
  const overlay = React.useState(<OverlayOne />);

  const accessChat = async (userId, user) => {
    const existingChat = chats.find(
      (chat) => chat.users[0]._id === userId || chat.users[1]._id === userId
    );

    if (existingChat) {
      setSelectedChat(existingChat);
      onClose();
      return;
    }
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

  return (
    <>
      <Box
        display={"flex"}
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
      >
        <Image
          src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1715350528/Black_Logo_1_s8etxi.png"
          height={12}
        />

        <Tooltip
          label="Search Users to chat"
          placement="bottom-end"
          color={"green"}
          backgroundColor={"transparent"}
          _hover={{ backgroundColor: "green.100" }}
        >
          <Button
            variant="ghost"
            onClick={onOpen}
            _hover={{ backgroundColor: "green.100" }}
          >
            <i className="fas fa-search"></i>
            <Text
              display={{ base: "none", md: "flex" }}
              px={4}
              userSelect={"none"}
            >
              Search Chat
            </Text>
          </Button>
        </Tooltip>

        <MatchModal />

        <LoveIcon />
        {modal && <Notifier isOpen={modal} onClose={() => setModal(false)} />}

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
            <MenuList pl={{ base: 0, md: 2 }}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    const isFlagged = notif.chat.flagged.includes(user?._id);
                    if (isFlagged) {
                      setModal(true); // Show the modal
                    } else {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n) => n !== notif));
                      const otherNotifications = notification.filter(
                        (n) => n.chat._id !== notif.chat._id
                      );
                      setNotification(otherNotifications);
                    }
                  }}
                >
                  {`New Message from ${getSenderName(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              as={Button}
              bg="white"
              _hover={{ backgroundColor: "green.100" }}
              rightIcon={<ChevronDownIcon />}
              p={0}
            >
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
        <DrawerCloseButton />
        {overlay}
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Chat</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name "
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Box>
            {search !== "" ? (
              chats.length > 0 ? (
                // Check if any chats match the search criteria
                chats.some((chat) =>
                  chat.users.some(
                    (participant) =>
                      participant._id !== user._id &&
                      participant.name
                        .toLowerCase()
                        .includes(search.toLowerCase())
                  )
                ) ? (
                  // Render filtered chats
                  chats
                    .filter((chat) =>
                      chat.users.some(
                        (participant) =>
                          participant._id !== user._id &&
                          participant.name
                            .toLowerCase()
                            .includes(search.toLowerCase())
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
                  // Render "No chats were found" message
                  <Text userSelect="none" textColor="red">
                    No chats were found.
                  </Text>
                )
              ) : (
                // Render a message indicating to start typing to search for chats
                <Text userSelect="none">
                  Start typing to search for chats...
                </Text>
              )
            ) : null}

            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
