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
  LinkOverlay,
  LinkBox,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import { MdOutlineVerified } from "react-icons/md";
import { VscUnverified } from "react-icons/vsc";
import { CiCircleInfo } from "react-icons/ci";

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
      toast({
        title: "Verified!",
        status: "success",
        duration: 5000,
        position: "bottom",
        isClosable: true,
      });
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

  const postDetails = async (pics) => {
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

    if (pics.type !== "image/jpeg" && pics.type !== "image/png") {
      toast({
        title: "Invalid file type!",
        description: "Please upload a JPEG or PNG image.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }

    try {
      // Request to your backend to get the signed URL and parameters
      const response = await fetch(`/generate-upload-url?resource_type=image`);
      const { uploadUrl, signature, timestamp } = await response.json();

      console.log(uploadUrl, signature, timestamp);

      let data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "RocketChat"); // Ensure this matches your Cloudinary preset
      data.append("api_key", "766123662688499"); // API key for client-side
      data.append("timestamp", timestamp);
      data.append("signature", signature);

      // Perform the upload to Cloudinary
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        body: data,
      });

      const result = await uploadResponse.json();
      setPic(result.url.toString());
    } catch (error) {
      console.error("Error uploading media:", error);
      toast({
        title: "Upload failed!",
        description: "There was an error uploading your file.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setPicLoading(false);
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
      const { data } = await axios.get(`/api/user?email=${email}`);
      setCode(data);
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
        <ModalOverlay
          bg="blackAlpha.300"
          backdropFilter="blur(10px) hue-rotate(90deg)"
        />
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
          <ModalCloseButton color={"white"} />
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
            position="relative"
            p={"4"}
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
              fontFamily="Arial, sans-serif"
              display={isFocused ? "none" : "flex"}
              textAlign={"center"}
            >
              Email: {user?.email}
            </Text>
            <Divider p={2} />
            {!user?.verified && !code && (
              <Box display={"flex"} width={"100%"} p={"4"}>
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
            {code && (
              <Text p={"4"} fontSize={"small"}>
                Code sent to ~{email}~
              </Text>
            )}
            {code && (
              <Box display={"flex"} width={"100%"} p={"4"}>
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
                  isDisabled={code !== inputCode}
                  isLoading={confirm}
                  colorScheme="green"
                >
                  {inputCode !== code ? "Refresh mailbox" : "Confirm"}
                </Button>
              </Box>
            )}
            <Button
              m={0.5}
              bgGradient="linear(to-r, gray.300, yellow.400, pink.200)"
              borderRadius={20}
              isDisabled
            >
              {user?.looking}
            </Button>
            <Text
              fontSize="small"
              display={isFocused ? "none" : "flex"}
              textAlign={"center"}
              p={2}
            >
              {user?.value}
            </Text>
            {!user?.verified && (
              <Text
                p="6"
                fontSize={"small"}
                width={"100%"}
                textAlign={"center"}
              >
                <CiCircleInfo />
                Once verified, you will receive more replies and gain increased
                trust from others. You'll also be able to access the latest
                posts and will be preferred over unverified accounts.
              </Text>
            )}
          </ModalBody>
          <ModalFooter
            display={isFocused ? "none" : "block"}
            justifyContent={"space-between"}
            alignItems={"center"}
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
                Change Pic{" "}
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
              flexDir={"column"}
              width={"100%"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <LinkBox
                as="article"
                maxW="sm"
                p="2"
                mb={"4"}
                borderWidth="1px"
                rounded="md"
                textColor={"white"}
                background={"#FFA500"}
                width={"100%"}
              >
                <LinkOverlay
                  userSelect={"none"}
                  href="https://www.paypal.com/donate/?hosted_button_id=2L8HHGURQTED2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Donate
                </LinkOverlay>
              </LinkBox>
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
                width={"100%"}
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
