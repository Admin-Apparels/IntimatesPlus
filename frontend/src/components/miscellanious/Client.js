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
  FormLabel,
  Box,
} from "@chakra-ui/react";
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import { useNavigate } from "react-router-dom";

const ClientModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isFocused, setIsFocused] = useState(false);
  const { user, setUser } = ChatState() || {};
  const [picLoading, setPicLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pic, setPic] = useState(undefined);
  const [verified, setVerified] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const toggleFocus = () => {
    setIsFocused((prevState) => !prevState);
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
          const { data } = await axios.delete(
            `/api/user/delete-image/${publicId}`,
            config
          );
          console.log(data);
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
  const setVerifieding = () => {
    if (user.accountType === "Bronze") {
      setVerified(
        "https://res.cloudinary.com/dvc7i8g1a/image/upload/v1699185606/icons8-gold-medal-80_ceco9h.png"
      );
    } else if (user.accountType === "Platnum") {
      setVerified(
        "https://res.cloudinary.com/dvc7i8g1a/image/upload/v1699185606/icons8-silver-medal-80_kplixh.png"
      );
    } else if (user.accountType === "Gold") {
      setVerified(
        "https://res.cloudinary.com/dvc7i8g1a/image/upload/v1699185606/icons8-bronze-medal-80_xvl7po.png"
      );
    }
  };

  return (
    <>
      {children ? (
        <span
          onClick={() => {
            onOpen();
            setVerifieding();
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
        <ModalOverlay />
        <ModalContent width={"calc(100% - 20px)"} p={1}>
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
            p={0}
            m={0}
          >
            {user.name}
            <Image src={verified} alt="" height={7} />
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
              Email: {user.email}
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
            <FormControl id="pic" marginBottom={15} p={0} m={0}>
              <FormLabel>Change Picture</FormLabel>
              <Input
                type="file"
                p={1.5}
                accept="image/*"
                onChange={(e) => postDetails(e.target.files[0])}
              />
            </FormControl>
            <Box
              display={"flex"}
              justifyContent={"space-between"}
              p={0}
              margin={0}
            >
              <Button
                colorScheme="green"
                width="8rem"
                onClick={() => submitHandler()}
                isLoading={picLoading}
              >
                Edit Picture{" "}
              </Button>

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
