import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import {
  Radio,
  RadioGroup,
  Textarea,
  Stack,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Divider,
  Box,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useState } from "react";
import "../styles.css";

import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [password, setPassword] = useState("");
  const [pic, setPic] = useState(undefined);
  const [picLoading, setPicLoading] = useState(false);
  const [value, setValue] = useState("");
  const [gender, setGender] = useState("");
  const [code, setCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [step, setStep] = useState(1);

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const generateAndVerify = async () => {
    setPicLoading(true);
    if (!name || !email || !password || !confirmpassword || !isFormValid()) {
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
    if (password !== confirmpassword) {
      toast({
        title: "Passwords Do Not Match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }
    try {
      const { data } = await axios.get(`/api/user/${email}`);
      setCode(data);
      onOpen();
      setPicLoading(false);
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
      setPicLoading(false);
    }
  };
  const submitHandler = async () => {
    setPicLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user",
        {
          name,
          email,
          password,
          gender,
          value,
          pic,
        },
        config
      );
      let userData = await { ...data, isNewUser: true };
      localStorage.setItem("userInfo", JSON.stringify(userData));
      setPicLoading(false);
      navigate("/chats");
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
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
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
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
    } else {
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
  };

  const MIN_CHARACTERS = 20;
  const MAX_CHARACTERS = 200;
  const isFormValid = () => {
    return value.length >= MIN_CHARACTERS;
  };

  return (
    <VStack spacing="3px">
      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent padding={5}>
          <ModalHeader
            fontSize="medium"
            fontFamily="Work sans"
            display="flex"
            flexDirection={"column"}
            justifyContent="center"
          >
            Please enter the code sent to: ~{email}~
            <Text textColor={"red"} textAlign={"center"}>
              Do not close this page
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
              fontSize={"medium"}
              placeholder={`i.e 126413`}
              _placeholder={{ color: "#fff0f5" }}
              type="text"
              textAlign="center"
              textColor={inputCode !== code ? "red" : "green"}
              onChange={(e) => setInputCode(e.target.value)}
              value={inputCode}
              minLength={6}
              maxLength={6}
            />
            <Divider p={2} />
            <Button
              width={"100%"}
              onClick={() => {
                submitHandler();
                onClose();
              }}
              isDisabled={code !== inputCode}
              colorScheme="green"
            >
              Done
            </Button>
          </ModalBody>
          <ModalFooter display="flex">
            <Text textAlign={"center"} justifyContent={"center"}>
              Please enter the exact code received, refresh your inbox.
            </Text>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Box
        className={`form-container step-${step}`}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"center"}
        width={"100%"}
        p={"6"}
      >
        {step === 1 && (
          <FormControl
            id="first-name"
            style={{
              animation: step === 1 ? "slideInRight 0.5s forwards" : "",
            }}
            isRequired
          >
            <FormLabel textColor={"white"}>Name</FormLabel>
            <Input
              placeholder="Enter Your Name"
              _placeholder={{ color: "#fff0f5" }}
              textColor={"white"}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
        )}
        {step === 2 && (
          <Box
            style={{
              animation: step === 2 ? "slideInRight 0.5s forwards" : "",
            }}
          >
            {" "}
            <Text textColor="white" fontSize="lg" mb={4} textAlign={"center"}>
              Chat Anonymously
            </Text>{" "}
            <Text textColor="gold" mb={4} textAlign={"center"}>
              Remember, your email and password will be used for future login.
              Dummy emails are prone to losing access to your account.
            </Text>
            <FormControl isRequired>
              <FormLabel textColor={"white"}>
                Email Address (Optional)
              </FormLabel>
              <Input
                type="email"
                textColor={"white"}
                placeholder="Enter Your Email Address"
                _placeholder={{ color: "#fff0f5" }}
                onChange={(e) => setEmail(e.target.value)}
              />
              {email ? (
                <FormLabel
                  fontSize={"2xs"}
                  p={0}
                  m={0}
                  color={"green.400"}
                  userSelect={"none"}
                  textColor={"white"}
                >
                  Your email is for login only. No ads
                </FormLabel>
              ) : (
                ""
              )}
            </FormControl>
          </Box>
        )}
        {step === 3 && (
          <>
            <FormControl
              id="password"
              style={{
                animation: step === 3 ? "slideInRight 0.5s forwards" : "",
              }}
              isRequired
            >
              <FormLabel textColor={"white"}>Password</FormLabel>
              <InputGroup size="md">
                <Input
                  type={show ? "text" : "password"}
                  textColor={"white"}
                  placeholder="Enter Password"
                  _placeholder={{ color: "#fff0f5" }}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleClick}>
                    {show ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
            <FormControl
              id="password"
              style={{
                animation: step === 3 ? "slideInRight 0.5s forwards" : "",
              }}
              isRequired
            >
              <FormLabel textColor={"white"}>Confirm Password</FormLabel>
              <InputGroup size="md">
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Confirm password"
                  _placeholder={{ color: "#fff0f5" }}
                  textColor={"white"}
                  onChange={(e) => setConfirmpassword(e.target.value)}
                />
                <InputRightElement width="4.5rem">
                  <Button h="1.75rem" size="sm" onClick={handleClick}>
                    {show ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </>
        )}

        {step === 4 && (
          <FormControl
            id="gender"
            style={{
              animation: step === 4 ? "slideInRight 0.5s forwards" : "",
            }}
            isRequired
          >
            <FormLabel textColor={"white"}>Gender</FormLabel>
            <RadioGroup
              onChange={setGender}
              value={gender}
              textColor={"white"}
              isRequired
            >
              <Stack direction="row">
                <Radio value="male">Male</Radio>
                <Radio value="female">Female</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>
        )}
        {step === 5 && (
          <FormControl
            id="description"
            style={{
              animation: step === 5 ? "slideInRight 0.5s forwards" : "",
            }}
            textColor={"white"}
            isRequired
          >
            <FormLabel>Description</FormLabel>
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Hi there, I'm ... from LA..."
              _placeholder={{ color: "#fff0f5" }}
              size="sm"
              minLength={MIN_CHARACTERS}
              maxLength={MAX_CHARACTERS}
            />
            {value ? (
              <FormLabel
                fontSize={"2xs"}
                p={0}
                m={0}
                color={"green.400"}
                userSelect={"none"}
                textColor={"white"}
              >
                Welcome! Please include a close location to enhance your
                matching experience. Happy matching! 🌐
              </FormLabel>
            ) : (
              ""
            )}
            <Text
              fontSize="sm"
              textColor={"white"}
              textAlign={"center"}
              color={value.length >= MIN_CHARACTERS ? "green.500" : "red.500"}
              background={"white"}
              borderRadius={20}
            >
              {`${value.length}/${MIN_CHARACTERS}`}
            </Text>
          </FormControl>
        )}

        {step === 6 && (
          <FormControl
            style={{
              animation: step === 6 ? "slideInRight 0.5s forwards" : "",
            }}
            id="pic"
          >
            <FormLabel textColor={"white"}>
              Upload your Picture(*Public)
            </FormLabel>
            <Input
              type="file"
              p={1.5}
              textColor={"white"}
              accept="image/*"
              onChange={(e) => postDetails(e.target.files[0])}
            />
          </FormControl>
        )}

        {step === 6 && (
          <Button
            colorScheme="blue"
            width="100%"
            style={{ marginTop: 15 }}
            onClick={() => generateAndVerify()}
            isLoading={picLoading}
            isDisabled={!isFormValid() || disabled}
          >
            {!isFormValid() ? (
              <Text>Not Enough characters</Text>
            ) : (
              <Text> {disabled ? `Try Again after 30sec` : `Sign Up`} </Text>
            )}
          </Button>
        )}
      </Box>
      <Box
        display={"flex"}
        justifyContent={"space-evenly"}
        alignItems={"center"}
        width={"100%"}
        p={"6"}
      >
        {" "}
        {step > 1 && <Button onClick={prevStep}>Back</Button>}
        {step < 6 && (
          <Button onClick={nextStep} isDisabled={step === 5 && !isFormValid()}>
            Next
          </Button>
        )}
      </Box>
    </VStack>
  );
};

export default Signup;
