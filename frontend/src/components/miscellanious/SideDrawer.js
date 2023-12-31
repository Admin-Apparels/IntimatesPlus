import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import { Badge, Image, useBreakpointValue } from "@chakra-ui/react";
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
import LoveIcon from "./loveIcon";

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
  } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history("/");
  };
  const displayValue = useBreakpointValue({ base: "none", md: "flex" });

  const textVisibility = useBreakpointValue({
    base: "hidden",
    md: "visible",
  });

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
        <Text
          display={displayValue}
          justifyContent={"center"}
          alignItems={"space-between"}
          fontSize="2xl"
          fontWeight={"bold"}
          userSelect={"none"}
          textColor={"red.200"}
          visibility={textVisibility}
        >
          <Image
            src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1702459043/icons8-fm-96_wl6d1g.png"
            height={9}
          />
          fuckmate.boo
        </Text>
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
        {user.gender === "male" ? (
          <MatchModal />
        ) : (
          <Button borderRadius={"50%"}>
            <Image
              src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1695818135/icons8-water-48_tlrkf4.png"
              loading="lazy"
              alt=""
              p={0}
              m={0}
              _hover={{ backgroundColor: "green.100" }}
              h={5}
            />
          </Button>
        )}

        <LoveIcon />

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
            <MenuButton
              as={Button}
              bg="white"
              _hover={{ backgroundColor: "green.100" }}
              rightIcon={<ChevronDownIcon />}
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
        <DrawerOverlay />
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
                <Text userSelect={"none"}>No chats were found.</Text>
              )
            ) : (
              <Text userSelect={"none"}>
                Start typing to search for chats...
              </Text>
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
