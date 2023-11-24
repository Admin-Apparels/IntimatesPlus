import React from "react";
import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import {
  Radio,
  RadioGroup,
  Textarea,
  Stack,
  Text,
  Box,
  InputRightElement,
  InputGroup,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../Context/ChatProvider";

export default function Signup() {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const { email, pic, name } = ChatState();
  const toast = useToast();
  const navigate = useNavigate();

  const [picLoading, setPicLoading] = useState(false);
  const [value, setValue] = useState("");
  const [gender, setGender] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [password, setPassword] = useState("");

  if (!email || !name || !pic) {
    navigate("/");
  }

  const submitHandler = async () => {
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
      const userData = await { ...data, isNewUser: true };
      localStorage.setItem("userInfo", JSON.stringify(userData));

      setTimeout(() => {
        delete userData.isNewUser;
        localStorage.setItem("userInfo", JSON.stringify(userData));
      }, 3000);
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

  const MIN_CHARACTERS = 100;
  const MAX_CHARACTERS = 200;
  const isFormValid = () => {
    if (gender === "female") {
      return value.length >= MIN_CHARACTERS;
    } else {
      return !!name && !!email;
    }
  };

  return (
    <VStack
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      width={"100%"}
    >
      {" "}
      <Box
        display={"flex"}
        flexDir={"column"}
        width={{ base: "350px", md: "500px" }}
        padding={7}
        backgroundColor={"white"}
      >
        {" "}
        <Text fontFamily={"cursive"} textAlign={"center"}>
          Additional Information
        </Text>
        <FormControl id="given-name" isRequired>
          <FormLabel>Name</FormLabel>
          <Input isDisabled={true} placeholder={name} />
        </FormControl>
        <FormControl id="googleEmail" isRequired>
          <FormLabel>Email Address</FormLabel>
          <Input type="email" placeholder={email} isDisabled={true} />
        </FormControl>
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
        <FormControl id="genderGoogle" isRequired>
          <FormLabel>Gender</FormLabel>
          <RadioGroup onChange={setGender} value={gender} isRequired>
            <Stack direction="row">
              <Radio value="male">Male</Radio>
              <Radio value="female">Female</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
        {gender === "female" && (
          <FormControl id="description2" isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Hi Admin, I am Nina from Nairobi looking for a..."
              size="sm"
              minLength={MIN_CHARACTERS}
              maxLength={MAX_CHARACTERS}
            />
            <Text
              fontSize="sm"
              color={value.length >= MIN_CHARACTERS ? "green.500" : "red.500"}
            >
              {`${value.length}/${MIN_CHARACTERS}`}
            </Text>
          </FormControl>
        )}
        <Button
          colorScheme="blue"
          width="100%"
          style={{ marginTop: 15 }}
          onClick={() => submitHandler()}
          isLoading={picLoading}
          isDisabled={!isFormValid()}
        >
          {gender === "female" && !isFormValid() ? (
            <Text>Not Enough characters</Text>
          ) : (
            <Text>Sign Up</Text>
          )}
        </Button>
      </Box>
    </VStack>
  );
}
