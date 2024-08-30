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
  Image,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useState } from "react";
import "../styles.css";

import { useNavigate } from "react-router-dom";
import { GiClover, GiLoveInjection } from "react-icons/gi";
import PageIndicator from "../miscellanious/PageIndicator";
import { PiGenderIntersexBold } from "react-icons/pi";
import { FcPicture } from "react-icons/fc";

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
  const [looking, setLooking] = useState("");
  const [value, setValue] = useState("");
  const [gender, setGender] = useState("");

  const [loading, setLoading] = useState("");

  const [step, setStep] = useState(1);

  const nextStep = () => {
    setStep(step + 1);
  };
  const CheckEmail = async () => {
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
          looking,
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

      let data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "RocketChat"); // Ensure this matches your Cloudinary preset
      data.append("api_key", "766123662688499"); // API key for client-side (ensure this is secure)
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

  const options = [
    "👫 Fun Buddy",
    "❤️ Friends-with-Benefits",
    "😄 Activity Partner",
    "💖 Genuine Connection",
  ];

  const getOptionDescription = (option) => {
    switch (option) {
      case "👫 Fun Buddy":
        return "Enjoy exciting times and build a fun connection.";
      case "❤️ Friends-with-Benefits":
        return "Start with playful interactions and see where it goes.";
      case "😄 Activity Partner":
        return "Join in on adventures and shared interests.";
      case "💖 Genuine Connection":
        return "Create a deep and meaningful relationship after fun times.";
      default:
        return "";
    }
  };

  const gradients = [
    "linear(to-r, pink, green.400, teal.200)",
    "linear(to-r, teal.300, blue.400, green.200)",
    "linear(to-r, purple.300, blue.400, teal.200)",
    "linear(to-r, orange.300, red.400, pink)",
    "linear(to-r, pink.300, purple.400, blue.200)",
  ];

  return (
    <VStack spacing="3px">
      <Box
        className={`form-container step-${step}`}
        display={"flex"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"center"}
        width={"100%"}
        pt={0}
      >
        {step === 1 && (
          <Box
            display={"flex"}
            flexDir={"column"}
            justifyContent={"center"}
            alignItems={"center"}
            style={{
              animation: "slideInRight 0.5s forwards",
            }}
            width={"100%"}
          >
            <GiClover style={{ fontSize: "200px", color: "#F44336" }} />
            <Box
              display={"flex"}
              flexWrap={"wrap"}
              justifyContent={"center"}
              alignItems={"center"}
              fontWeight={"bold"}
              mb={4}
              width={"100%"}
            >
              Welcome to&nbsp;
              <Text
                display={"flex"}
                textAlign={"center"}
                fontWeight={"bold"}
                textColor={"teal"}
              >
                IntimatesPlus
              </Text>
              &nbsp;
              <Text fontSize={"small"}>formerly</Text>
              &nbsp;
              <Text fontWeight={"bold"} textColor={"teal.400"}>
                Fuckmate Boo
              </Text>
              &nbsp;!
            </Box>{" "}
            <Text mb={4} textAlign={"center"}>
              Ready for fun and deeper connections?
            </Text>
            <FormControl id="first-name" isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                placeholder="Enter Your Name"
                onChange={(e) => setName(e.target.value)}
              />
            </FormControl>
          </Box>
        )}
        {step === 2 && (
          <Box
            display={"flex"}
            flexDir={"column"}
            justifyContent={"center"}
            alignItems={"center"}
            minH={"300px"}
            style={{
              animation: "slideInRight 0.5s forwards",
            }}
          >
            <Image
              src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1722070627/cutted1_1_lrjkfq.jpg"
              userSelect={"none"}
              boxSize={"250px"}
              height={"auto"}
              border={"5px solid red"}
              borderRadius={"full"}
            />
            <Text
              bgGradient="linear(to-l, #7928CA, #FF0080)"
              bgClip="text"
              fontSize="lg"
              fontWeight={"bold"}
              mb={4}
              textAlign={"center"}
            >
              Chat Anonymously
            </Text>{" "}
            <Text mb={4} textAlign={"center"}>
              Remember, your email and password will be used for future login.
              Dummy emails are prone to losing access to your account.
            </Text>
            <FormControl isRequired>
              <FormLabel>Email Address (Optional)</FormLabel>
              <Input
                type="email"
                placeholder="Enter Your Email Address"
                onChange={(e) => setEmail(e.target.value)}
              />
              {email ? (
                <FormLabel
                  fontSize={"2xs"}
                  p={0}
                  m={0}
                  color={"green.400"}
                  userSelect={"none"}
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
            display={"flex"}
            flexDir={"column"}
            justifyContent={"center"}
            alignItems={"center"}
            style={{
              animation: "slideInRight 0.5s forwards",
            }}
          >
            <GiLoveInjection style={{ fontSize: "200px", color: "#F44336" }} />

            <Text mb={4} textAlign={"center"}>
              Secure your connection: Choose a strong password to protect your
              account.
            </Text>
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup size="md">
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Enter Password"
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
              <FormLabel>Confirm Password</FormLabel>
              <InputGroup size="md">
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Confirm password"
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
            display={"flex"}
            flexDir={"column"}
            justifyContent={"center"}
            alignItems={"center"}
            style={{
              animation: "slideInRight 0.5s forwards",
            }}
          >
            <PiGenderIntersexBold
              style={{ fontSize: "200px", color: "#F44336" }}
            />
            <Text mb={4} textAlign={"center"}>
              {" "}
              Select your gender: Choose the option that best represents you.
            </Text>
            <FormControl id="gender" isRequired>
              <FormLabel>Gender</FormLabel>
              <RadioGroup onChange={setGender} value={gender} isRequired>
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
              animation: "slideInRight 0.5s forwards",
            }}
            display={"flex"}
            flexDir={"column"}
            justifyContent={"center"}
            minH={"300px"}
            alignItems={"center"}
          >
            <Image
              src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1722070626/cuttted2_htcot9.jpg"
              userSelect={"none"}
              boxSize={"200px"}
              border={"5px solid red"}
              borderRadius={"full"}
            />

            <Text
              mb={4}
              textAlign={"center"}
              fontSize={"larger"}
              fontWeight={"bold"}
            >
              How would you like to start building your connection?
            </Text>

            <Box textAlign="center" mb={4}>
              {options.map((option, index) => (
                <>
                  {" "}
                  <Button
                    key={option}
                    m={0.5}
                    bgGradient={gradients[index]}
                    onClick={() => setLooking(option)}
                    borderRadius={20}
                    mt={2}
                    style={{
                      filter:
                        looking && looking !== option ? "blur(4px)" : "none",
                      transition: "filter 0.3s ease",
                    }}
                  >
                    {option}
                  </Button>
                  <Text
                    bgGradient={gradients[index]}
                    bgClip={"text"}
                    style={{
                      filter:
                        looking && looking !== option ? "blur(4px)" : "none",
                      transition: "filter 0.3s ease",
                    }}
                  >
                    {getOptionDescription(option)}
                  </Text>
                </>
              ))}
            </Box>

            <FormControl id="description" Box isRequired>
              <FormLabel>Add a short description</FormLabel>
              <Textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Hi there, I'm ... from LA..."
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
                justifyContent={"space-between"}
                textAlign={"center"}
                color={value.length >= MIN_CHARACTERS ? "green.500" : "red.500"}
                background={"whitesmoke"}
                m={2}
              >
                {`${value.length}/${MIN_CHARACTERS}`}
              </Text>
            </FormControl>
          </Box>
        )}

        {step === 6 && (
          <Box
            display={"flex"}
            flexDir={"column"}
            justifyContent={"center"}
            alignItems={"center"}
            style={{
              animation: "slideInRight 0.5s forwards",
            }}
          >
            <FcPicture style={{ fontSize: "200px" }} />
            <Text mb={4} textAlign={"center"}>
              Upload a clear and recent photo of yourself for better matching
              results.
            </Text>
            <FormControl id="pic">
              <FormLabel>Upload your Picture(*Public & Optional)</FormLabel>
              <Input
                type="file"
                p={1.5}
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
            Join Now!
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
              (step === 5 && (!value || !looking))
            }
            isLoading={loading}
          >
            Next
          </Button>
        )}
      </Box>
      <PageIndicator
        totalPages={6}
        currentPage={step - 1}
        handleDotClick={handleNextClick}
        setStep={true}
      />
    </VStack>
  );
};

export default Signup;
