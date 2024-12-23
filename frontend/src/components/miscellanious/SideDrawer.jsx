import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  DrawerCloseButton,
  useToast,
  Spinner,
  Avatar,
  Tooltip,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Badge,
  Image,
  SkeletonCircle,
  SkeletonText,
  Box,
  Text,
  Input,
  useDisclosure,
  Button,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import ClientModal from "./Client";

import { getSenderName, handleCreateChat } from "../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../Context/ChatProvider";
import MatchModal from "./Match";
import LoveIcon from "./loveIcon";
import Notifier from "./Notifier";
import { CiBellOn, CiGift } from "react-icons/ci";
import { FaSignOutAlt } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import logo from "../../assets/images/IntimatesPlus_logo.png";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const {
    setSelectedChat,
    user,
    setChats,
    notification,
    setNotification,
    chats,
  } = ChatState() || {};

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modal, setModal] = useState(false);
  const history = useNavigate();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history("/");
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      await handleCreateChat(
        userId,
        user,
        setChats,
        chats,
        setSelectedChat,
        toast
      );

      setLoadingChat(false);
      onClose();
    } catch (error) {
      setLoadingChat(false);
      onClose();
      toast({
        title: "Error creating your chat, try again later",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const fetchUsers = useCallback(
    async (searchTerm) => {
      setLoading(true);
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(
          `/api/user/allUsers?search=${searchTerm}`,
          config
        );
        setSearchResults(data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Failed to fetch users", error);
      }
    },
    [user.token]
  );

  useEffect(() => {
    if (search !== "") {
      fetchUsers(search);
    }
  }, [search, fetchUsers]);

  return (
    <>
      <Box
        display={"flex"}
        justifyContent="space-between"
        alignItems="center"
        bg="whitesmoke"
        w="100%"
        p="5px 10px 10px 10px"
        height="60px"
      >
        <Image src={logo} height={{ base: 6, md: 10 }} />
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
            _hover={{ backgroundColor: "transparent" }}
          >
            <i className="fas fa-search"></i>
            <Text
              display={{ base: "none", md: "flex" }}
              px={4}
              userSelect={"none"}
            >
              Search User
            </Text>
          </Button>
        </Tooltip>
        <MatchModal />
        <LoveIcon />
        {modal && <Notifier isOpen={modal} onClose={() => setModal(false)} />}
        <div>
          <Menu>
            <MenuButton p={1} position="relative">
              <CiBellOn fontSize="2xl" />
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
            <MenuList pl={{ base: 0, md: 2 }} fontSize={"small"} p={"1"}>
              {!notification.length && "No new messages..."}
              {notification.map((notif, index) => (
                <MenuItem
                  key={index}
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
                  {`New message from ${getSenderName(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              as={Button}
              background={"whitesmoke"}
              _hover={{ background: "whitesmoke" }}
            >
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ClientModal>
                <MenuItem>
                  <CgProfile /> &nbsp; My Profile
                </MenuItem>{" "}
              </ClientModal>

              <MenuItem onClick={() => history("/orders")}>
                {" "}
                <CiGift /> &nbsp; Ordates
              </MenuItem>

              <MenuItem onClick={logoutHandler}>
                {" "}
                <FaSignOutAlt />
                &nbsp;Sign out
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay
          bg="blackAlpha.300"
          backdropFilter="blur(10px) hue-rotate(90deg)"
        />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search User</DrawerHeader>
          <DrawerCloseButton textColor={"white"} />
          <DrawerBody>
            {loadingChat && <Spinner ml="auto" display="flex" />}
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Box>
            {search !== "" ? (
              <>
                {chats.length > 0 ? (
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
                      .filter((chat, index) =>
                        chat.users.some(
                          (participant) =>
                            participant._id !== user._id &&
                            participant.name
                              .toLowerCase()
                              .includes(search.toLowerCase())
                        )
                      )
                      .map((chat, index) => {
                        const otherParticipant = chat.users.find(
                          (participant) => participant._id !== user._id
                        );

                        return (
                          <UserListItem
                            key={index}
                            user={otherParticipant}
                            handleFunction={() =>
                              accessChat(otherParticipant._id)
                            }
                          />
                        );
                      })
                  ) : (
                    <Text userSelect="none" textColor="red">
                      No chats were found.
                    </Text>
                  )
                ) : (
                  <Text userSelect="none">
                    Start typing to search for chats...
                  </Text>
                )}
                <Box>
                  <Text
                    textAlign={"center"}
                    bgGradient="linear(to-l, #7928CA, #FF0080)"
                    bgClip="text"
                    fontWeight="extrabold"
                  >
                    Get to know more
                  </Text>
                  {loading && (
                    <Box padding="6" boxShadow="lg" bg="white" width={"100%"}>
                      <SkeletonCircle size="10" />
                      <SkeletonText
                        mt="4"
                        noOfLines={4}
                        spacing="4"
                        skeletonHeight="2"
                      />
                    </Box>
                  )}
                  {searchResults.length > 0 ? (
                    searchResults.map((search) => (
                      <UserListItem
                        key={search._id}
                        user={search}
                        handleFunction={() => accessChat(search._id)}
                      />
                    ))
                  ) : (
                    <Text userSelect="none" textColor="red">
                      No new users found.
                    </Text>
                  )}
                </Box>
              </>
            ) : null}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
