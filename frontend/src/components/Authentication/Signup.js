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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [password, setPassword] = useState("");
  const [pic, setPic] = useState(undefined);
  const [picLoading, setPicLoading] = useState(false);
  const [value, setValue] = useState("");
  const [gender, setGender] = useState("");

  const [loading, setLoading] = useState("");

  const [step, setStep] = useState(1);

  const nextStep = () => {
    setStep(step + 1);
  };
  const CheckEmail = async () => {
    console.log(email);
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/user/uniqueness/${email}`, {});

      if (data === true) {
        setEmail("");
        setLoading(false);
        toast({
          title: "Chose a different email, user already exists",
          status: "warning",
        });
      } else if (data === false) {
        setLoading(false);
        nextStep();
      }
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
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
  const handleNextClick = () => {
    if (step === 2) {
      CheckEmail();
    } else {
      nextStep();
    }
  };

  return (
    <VStack spacing="3px">
      <Box
        className={`form-container step-${step}`}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"center"}
        width={"100%"}
        p={"0"}
        pt={0}
      >
        {step === 1 && (
          <Box
            style={{
              animation: step === 2 ? "slideInRight 0.5s forwards" : "",
            }}
          >
            <Text textColor="gold" mb={4} textAlign={"center"}>
              "Welcome! Here's where we all connect. Meet your charming other
              among thousands directed here from adult sites seeking lasting
              connections. Let's increase the 25% of FWBs that turn into
              long-term relationships together!"
            </Text>
            <FormControl id="first-name" isRequired>
              <FormLabel textColor={"white"}>Name</FormLabel>
              <Input
                placeholder="Enter Your Name"
                _placeholder={{ color: "#fff0f5" }}
                textColor={"white"}
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
          </Box>
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
              "Remember, your email and password will be used for future login.
              Dummy emails are prone to losing access to your account."
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
                  style={{
                    animation: "slideInFromTop 0.5s forwards",
                  }}
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
          <Box
            style={{
              animation: step === 2 ? "slideInRight 0.5s forwards" : "",
            }}
          >
            <Text textColor="gold" mb={4} textAlign={"center"}>
              "Secure your connection: Choose a strong password to protect your
              account."
            </Text>
            <FormControl id="password" isRequired>
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
            <FormControl id="password" isRequired>
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
            {password !== confirmpassword && (
              <Text
                fontSize={"small"}
                textColor={"red"}
                background={"whitesmoke"}
                m={1}
                p={"2"}
                style={{
                  animation: "slideInFromTop 0.5s forwards",
                }}
              >
                Passwords Do Not Match!
              </Text>
            )}
          </Box>
        )}

        {step === 4 && (
          <Box
            style={{
              animation: "slideInFromTop 0.5s forwards",
            }}
          >
            <Text textColor="gold" mb={4} textAlign={"center"}>
              {" "}
              "Select your gender: Choose the option that best represents you."
            </Text>
            <FormControl id="gender" isRequired>
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
          </Box>
        )}
        {step === 5 && (
          <Box
            style={{
              animation: step === 2 ? "slideInRight 0.5s forwards" : "",
            }}
          >
            {" "}
            <Text textColor="gold" mb={4} textAlign={"center"}>
              "Write something that truly represents you and catches the eye of
              your potential match."
            </Text>
            <FormControl id="description" Box textColor={"white"} isRequired>
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
                  style={{
                    animation: "slideInFromTop 0.5s forwards",
                  }}
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
                justifyContent={"space-between"}
                textAlign={"center"}
                color={value.length >= MIN_CHARACTERS ? "green.500" : "red.500"}
                background={"white"}
                m={2}
              >
                {`${value.length}/${MIN_CHARACTERS}`}
              </Text>
            </FormControl>
          </Box>
        )}

        {step === 6 && (
          <Box
            style={{
              animation: step === 6 ? "slideInRight 0.5s forwards" : "",
            }}
          >
            <Text textColor="gold" mb={4} textAlign={"center"}>
              "Upload a clear and recent photo of yourself for better matching
              results."
            </Text>
            <FormControl id="pic">
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
          </Box>
        )}

        {step === 6 && (
          <Button
            colorScheme="blue"
            width="100%"
            style={{ marginTop: 15 }}
            onClick={() => submitHandler()}
            isLoading={picLoading}
          >
            Sign Up
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
        {step < 6 && (
          <Button
            onClick={() => handleNextClick()}
            isDisabled={
              (step === 5 && !isFormValid()) ||
              (step === 1 && !name) ||
              (step === 2 && !email) ||
              (step === 3 && !password) ||
              password !== confirmpassword ||
              (step === 4 && !gender) ||
              (step === 5 && !value)
            }
            isLoading={loading}
          >
            Next
          </Button>
        )}
      </Box>
    </VStack>
  );
};

export default Signup;
