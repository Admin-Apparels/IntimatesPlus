import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { useState } from "react";
import axios from "axios";
import {
  useToast,
  Link,
  useDisclosure,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Divider,
  Spinner,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleLoginButton from "./Google";
import { ChatState } from "../Context/ChatProvider";

const Login = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState(false);
  const { onOpen, isOpen, onClose } = useDisclosure();
  const [forgotEmail, setForgotEmail] = useState();
  const [searching, setSearching] = useState(false);
  const { setVerify } = ChatState();

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      toast({
        title: "Account Missing!",
        description: error.response.data.message,
        status: "info",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };
  const forgotPassword = async () => {
    setSearching(true);
    try {
      const { data } = await axios.get(
        `/api/user/accountrecoverly/${forgotEmail}`
      );
      console.log(data);
      if (data !== false) {
        navigate("/accountrecoverly");
        setVerify(data);
      } else {
        toast({
          title: "Email not found",
          status: "info",
          duration: 5000,
          position: "bottom",
        });
      }

      setSearching(false);
    } catch (error) {
      setSearching(false);
      toast({
        title: "Error Occurred!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <VStack spacing="10px">
      <FormControl id="email" isRequired>
        <FormLabel>Email Address</FormLabel>
        <Input
          value={email}
          type="email"
          placeholder="Enter Your Email Address"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup size="md">
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={show ? "text" : "password"}
            placeholder="Enter password"
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Login
      </Button>
      <GoogleOAuthProvider clientId="836402802539-eqr9obfujd1q8heagf9luptlmcid62ss.apps.googleusercontent.com">
        <GoogleLoginButton />
      </GoogleOAuthProvider>
      <Link
        onClick={() => {
          onOpen();
        }}
      >
        Forgot password?
      </Link>
      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent padding={5}>
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            <Text
              textAlign={"center"}
              justifyContent={"center"}
              fontSize={"2xl"}
            >
              Enter your Email below
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-between"
          >
            <Input
              fontSize={"2xl"}
              placeholder={`example@mymail.com`}
              type="text"
              textAlign="center"
              onChange={(e) => setForgotEmail(e.target.value)}
              value={forgotEmail}
            />
            <Divider p={2} />
            <Button
              width={"100%"}
              onClick={() => {
                forgotPassword();
              }}
              colorScheme="green"
            >
              Search for my Email
            </Button>
          </ModalBody>
          <ModalFooter display="flex">{searching && <Spinner />}</ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default Login;
