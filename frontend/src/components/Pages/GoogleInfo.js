import React from "react";
import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import { Radio, RadioGroup, Textarea, Stack, Text } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChatState } from "../Context/ChatProvider";

export default function Signup() {
  const { email, pic, name } = ChatState();

  const toast = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState("googleAccount");

  const [picLoading, setPicLoading] = useState(false);
  const [value, setValue] = useState("");
  const [gender, setGender] = useState("");

  const submitHandler = async () => {
    setPicLoading(true);
    if (!name || !email || !isFormValid()) {
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
        userData.isNewUser = false;
        localStorage.setItem("userInfo", JSON.stringify(userData));
      }, 2500);
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
  const MAX_CHARACTERS = 150;
  const isFormValid = () => {
    if (gender === "female") {
      return value.length >= MIN_CHARACTERS;
    } else {
      return !!name && !!email && !!password;
    }
  };

  return (
    <VStack spacing="5px">
      <FormControl id="given-name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input isDisabled={true} placeholder={name} />
      </FormControl>
      <FormControl id="googleEmail" isRequired>
        <FormLabel>Email Address</FormLabel>
        <Input type="email" placeholder={email} isDisabled={true} />
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
            placeholder="Here is a sample placeholder"
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
    </VStack>
  );
}
