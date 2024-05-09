import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  IconButton,
  Text,
  Image,
  useToast,
  Input,
  FormControl,
  Box,
  Divider,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import { MdOutlineVerified } from "react-icons/md";
import { VscUnverified } from "react-icons/vsc";

const ClientModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isFocused, setIsFocused] = useState(false);
  const { user, setUser } = ChatState() || {};
  const [picLoading, setPicLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pic, setPic] = useState(undefined);
  const toast = useToast();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [email, setEmail] = useState(user?.email);

  const OverlayOne = () => (
    <ModalOverlay
      bg="blackAlpha.300"
      backdropFilter="blur(10px) hue-rotate(90deg)"
    />
  );
  const overlay = React.useState(<OverlayOne />);

  const toggleFocus = () => {
    setIsFocused((prevState) => !prevState);
  };
  const confirmHandler = async () => {
    setConfirm(true);
    const userId = user._id;
    if (!userId) {
      setConfirm(false);
      return;
    }
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/user/update/${userId}`,
        { email },
        config
      );
      setCode("");
      setUser((prev) => ({
        ...prev,
        verified: data.verified,
        email: data.email,
      }));
      setConfirm(false);
    } catch (error) {
      setConfirm(false);
      toast({
        title: "Error Occurred",
        description: error.message,
        status: "error",
        duration: 5000,
        position: "bottom",
        isClosable: true,
      });
    }
  };
  const submitHandler = async () => {
    setPicLoading(true);
    if (pic === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
    const userId = user._id;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/user/update/${userId}`,
        { pic },
        config
      );

      setUser((prev) => ({ ...prev, pic: data.pic }));
      setPic("");
      setPicLoading(false);
    } catch (error) {
      toast({
        title: "Error Occurred",
        description: error.message,
        status: "error",
        duration: 5000,
        position: "bottom",
        isClosable: true,
      });
    }
  };

  const postDetails = (pics) => {
    setPicLoading(true);
    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
    const defaultImageUrl =
      "https://res.cloudinary.com/dvc7i8g1a/image/upload/v1692259839/xqm81bw94x7h6velrwha.png";
    if (
      encodeURIComponent(user.pic) === encodeURIComponent(defaultImageUrl) &&
      (pics.type === "image/jpeg" || pics.type === "image/png")
    ) {
      let data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "RocketChat");
      fetch("https://api.cloudinary.com/v1_1/dvc7i8g1a/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());

          setPicLoading(false);
        })
        .catch((err) => {
          setPicLoading(false);
        });
    } else if (
      encodeURIComponent(user.pic) !== encodeURIComponent(defaultImageUrl) &&
      (pics.type === "image/jpeg" || pics.type === "image/png")
    ) {
      let data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "RocketChat");
      fetch("https://api.cloudinary.com/v1_1/dvc7i8g1a/image/upload", {
        method: "put",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());

          setPicLoading(false);
        })
        .catch((err) => {
          setPicLoading(false);
        });
    }
  };

  const deleteAccount = async () => {
    setDeleteLoading(true);
    const defaultImageUrl =
      "https://res.cloudinary.com/dvc7i8g1a/image/upload/v1692259839/xqm81bw94x7h6velrwha.png";
    const userId = user._id;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      if (
        encodeURIComponent(user.pic) !== encodeURIComponent(defaultImageUrl)
      ) {
        const publicId = user.pic.split("/").pop().split(".")[0];
        try {
          await axios.delete(`/api/user/delete-image/${publicId}`, config);
        } catch (error) {
          toast({
            title: "Error",
            description: "Image Not Deleted.",
            status: "error",
            duration: 5000,
            position: "bottom",
            isClosable: true,
          });
        }
      }
      await axios.delete(`api/user/deleteuser/${userId}`, config);
      localStorage.removeItem("userInfo");
      navigate("/");
      setDeleteLoading(false);
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
        status: "success",
        duration: 5000,
        position: "bottom",
        isClosable: true,
      });
    } catch (error) {
      setDeleteLoading(false);
      toast({
        title: "Error Occurred",
        description: error.message || "Failed to delete account.",
        status: "error",
        duration: 5000,
        position: "bottom",
        isClosable: true,
      });
    }
  };

  const generateAndVerify = async () => {
    setLoading(true);

    try {
      const { data } = await axios.get(`/api/user/${email}`);
      setCode(data);
      onOpen();
      setLoading(false);
      setDisabled(true);
      setTimeout(() => {
        setDisabled(false);
      }, 30000);
    } catch (error) {
      toast({
        title: "Check Your Email!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setDisabled(true);
      setTimeout(() => {
        setDisabled(false);
      }, 30000);
      onClose();
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
        <IconButton
          display={{ base: "flex" }}
          icon={<ViewIcon />}
          onClick={() => {
            onOpen();
          }}
        />
      )}
      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        {overlay}
        <ModalContent width={"calc(100% - 20px)"} p={1}>
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
            alignItems={"center"}
          >
            <Text
              bgGradient="linear(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)"
              bgClip="text"
              userSelect={"none"}
              px={"4"}
            >
              {user.name}
            </Text>

            {user.verified ? <MdOutlineVerified /> : <VscUnverified />}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
            position="relative"
            p={0}
          >
            <Image
              borderRadius={isFocused ? "50%" : "5%"}
              boxSize={isFocused ? "20rem" : "10rem"}
              height={"50vh"}
              width={"auto"}
              src={user.pic}
              alt={user.name}
              cursor="pointer"
              onClick={toggleFocus}
              transition="box-size 0.3s ease-in-out"
            />

            <Text
              fontSize={{ base: "20px", md: "22px" }}
              fontFamily="cursive"
              display={isFocused ? "none" : "flex"}
              textAlign={"center"}
            >
              Email: {user?.email}
            </Text>
            <Divider p={2} />
            {!user?.verified && !code && (
              <Box display={"flex"} width={"100%"} mb={4}>
                <Input
                  fontSize={"medium"}
                  placeholder={"Email to confirm"}
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
                <Button
                  width={"40%"}
                  onClick={() => {
                    generateAndVerify();
                  }}
                  isDisabled={disabled}
                  isLoading={loading}
                  colorScheme="green"
                  ml={1}
                >
                  {disabled ? `Sent...` : `Send Code`}{" "}
                </Button>
              </Box>
            )}
            {code && <Text fontSize={"small"}>Code sent to ~{email}~</Text>}
            {code && (
              <Box display={"flex"} width={"100%"}>
                <Input
                  fontSize={"medium"}
                  placeholder={`Enter code`}
                  type="text"
                  textColor={inputCode !== code ? "red" : "green"}
                  onChange={(e) => setInputCode(e.target.value)}
                  value={inputCode}
                  minLength={6}
                  maxLength={6}
                />
                <Button
                  width={"40%"}
                  fontSize={"small"}
                  display={"flex"}
                  flexWrap={"wrap"}
                  onClick={() => {
                    confirmHandler();
                  }}
                  ml={1}
                  isDisabled={code !== inputCode || disabled}
                  isLoading={confirm}
                  colorScheme="green"
                >
                  {inputCode !== code ? "Refresh mailbox" : "Confirm"}
                </Button>
              </Box>
            )}

            <Text
              fontSize="small"
              display={isFocused ? "none" : "flex"}
              textAlign={"center"}
              p={2}
            >
              {user?.value}
            </Text>
          </ModalBody>
          <ModalFooter
            display={isFocused ? "none" : "block"}
            justifyContent={"space-between"}
            alignItems={"center"}
            m={0}
            p={0}
          >
            {" "}
            <FormControl
              id="pic"
              marginBottom={15}
              display={"flex"}
              width={"100%"}
            >
              <Button
                width={"50%"}
                onClick={() => submitHandler()}
                isLoading={picLoading}
              >
                Change Picture{" "}
              </Button>
              <Input
                type="file"
                p={1.5}
                ml={1}
                accept="image/*"
                onChange={(e) => postDetails(e.target.files[0])}
              />
            </FormControl>
            <Box
              display={"flex"}
              justifyContent={"space-evenly"}
              p={2}
              margin={0}
            >
              <Button
                backgroundColor={"red.400"}
                onClick={() => {
                  if (
                    window.confirm(
                      `We appreciate your patience! Many users are currently registering, and we're working to find someone closer to your location. Please wait a moment for the best match. Thank you for using our service!
                      
                      Are you sure you want to delete your account?`
                    )
                  ) {
                    deleteAccount();
                  }
                }}
                isLoading={deleteLoading}
              >
                Delete Account
              </Button>
            </Box>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ClientModal;
