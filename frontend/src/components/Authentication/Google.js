import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { Button, Image } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { useNavigate } from "react-router-dom";

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const { email, setEmail, name, setName, setPic } = ChatState();

  const submitHandler = async () => {
    if (email && name) {
      try {
        const { data } = await axios.get(`/api/user/${email}/${name}`);

        console.log(data);
        if (data === "Unfound") {
          console.log("Data not found. Navigating to /googleinfo");
          navigate("/googleinfo");
        } else {
          console.log("Data found. Storing in localStorage.");
          localStorage.setItem("userInfo", JSON.stringify(data));
          navigate("/chats");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  const googleLogin = useGoogleLogin({
    clientId:
      "836402802539-eqr9obfujd1q8heagf9luptlmcid62ss.apps.googleusercontent.com",
    onSuccess: async (tokenResponse) => {
      const { access_token } = tokenResponse;
      console.log(access_token);

      try {
        const { data } = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );
        const parts = data.name.split(" ");
        setName(parts[0]);
        setEmail(data.email);
        setPic(data.picture);
        console.log(name, email);
        await submitHandler();
      } catch (error) {
        console.log(error);
      }
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });

  return (
    <Button
      onClick={() => googleLogin()}
      display={"flex"}
      justifyContent={"center"}
      width={"100%"}
    >
      <Image
        height={5}
        margin={1}
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google Logo"
      />
      Sign in with Google
    </Button>
  );
};

export default GoogleLoginButton;
