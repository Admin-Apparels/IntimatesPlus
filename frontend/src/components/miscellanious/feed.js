import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ChatState } from "../Context/ChatProvider";
import {
  Avatar,
  Box,
  Text,
  Button,
  IconButton,
  Textarea,
  useToast,
  FormControl,
  Input,
  Image,
} from "@chakra-ui/react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FcComments } from "react-icons/fc";
import { GoVideo } from "react-icons/go";
import { CiImageOn } from "react-icons/ci";
import ChatLoading from "../ChatLoading";
import { formatMessageTime } from "../config/ChatLogics";
import { MdAdd, MdDeleteForever } from "react-icons/md";
import { IoCloseOutline } from "react-icons/io5";
import "../styles.css";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const { user } = ChatState();
  const [content, setContent] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const author = user?._id;
  const toast = useToast();
  const [media, setMedia] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [picLoading, setPicLoading] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [image, setImage] = useState(null); //raw file, image/video
  const [file, setFile] = useState(null);

  const fetchPosts = useCallback(
    async (page) => {
      setLoading(true);
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(`api/posts?page=${page}`, config);
        setPosts((prevPosts) => [...data, ...prevPosts]); // Latest posts first
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
        toast({
          title: "An Error Occurred!",
          description: "Try again later",
          status: "error",
        });
      }
    },
    [user, toast]
  );

  useEffect(() => {
    if (user) {
      fetchPosts(page);
    }
  }, [user, page, fetchPosts]);

  const handleCommentSubmit = async (postId, commentContent) => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `/api/posts/${postId}/comments`,
        { content: commentContent, author },
        config
      );
      // Replace the old post with the updated post returned from the API
      const updatedPosts = posts.map((post) =>
        post._id === postId ? data : post
      );
      setPosts(updatedPosts);

      toast({
        title: "Posted",
        status: "info",
        position: "top",
      });
      setSelectedPost(null);
    } catch (error) {
      toast({
        title: "Oops!, not posted",
        status: "error",
        position: "top",
      });
    }
  };

  const handleCommentDelete = async (postId) => {
    if (!postId) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      // Send DELETE request to the backend
      const { data } = await axios.delete(
        `/api/posts/delete/${postId}`,
        config
      );

      // Update the state with the remaining posts
      setPosts(data);

      toast({
        title: "Post deleted!",
        status: "info",
        position: "top",
      });

      setSelectedPost(null);
    } catch (error) {
      toast({
        title: "Post not deleted!",
        status: "error",
        position: "top",
      });
    }
  };

  const handleMediaUpload = async (e) => {
    // Define maximum file size (50MB in bytes)
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const file = e.target.files[0];

    // Check if a file is selected
    if (!file) {
      toast({
        title: "Please select an image or video!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    // Determine the resource type based on file type
    const resourceType = file.type.startsWith("image")
      ? "image"
      : file.type.startsWith("video")
      ? "video"
      : null;

    if (!resourceType) {
      toast({
        title: "Invalid file type!",
        description: "Please upload a JPEG, PNG, or MP4 file.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      return;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large!",
        description: "Please upload a file smaller than 50MB.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }

    //media passed availble checks, ready for upload!
    setImage(URL.createObjectURL(file));
    setFile(file);
    setMediaType(resourceType);
  };

  const handlePostSubmit = async () => {
    setPicLoading(true);

    // Check if content or media is available
    if (!content && !file) {
      toast({
        title: "Please add some text or media!",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      let uploadedMediaUrl = media;

      // If file exists, upload the media first
      if (file && mediaType) {
        uploadedMediaUrl = await UploadContent(); // Wait for upload and get URL
      }

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      // Post submission with content and media
      const { data } = await axios.post(
        "/api/posts",
        { content, author, media: uploadedMediaUrl, mediaType },
        config
      );

      setPosts([data, ...posts]);
      setContent(""); // Clear content field
      setMedia(""); // Clear media URL
      setImage(null); // Clear image preview
      toast({
        title: "Posted successfully!",
        status: "success",
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Post failed",
        status: "error",
        position: "top",
      });
    } finally {
      setPicLoading(false);
    }
  };

  const UploadContent = async () => {
    try {
      let data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "RocketChat");

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/dvc7i8g1a/${mediaType}/upload`,
        { method: "POST", body: data }
      );

      const result = await uploadResponse.json();
      setFile(null); // Clear the file input after upload
      return result.secure_url; // Return the uploaded media URL
    } catch (error) {
      setMedia("");
      setMediaType("");
      toast({
        title: "Upload failed!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      throw error; // Ensure the error is caught in handlePostSubmit
    }
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      {isClicked && (
        <Box
          position={"sticky"}
          top={-2}
          zIndex={1}
          width={"100%"}
          backgroundColor="white"
        >
          <Textarea
            type="text"
            fontFamily={"sans-serif"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            maxLength={500}
          />

          <FormControl id="pic" isRequired>
            <Input
              type="file"
              accept="image/jpeg,image/png,video/mp4"
              display="none"
              id="fileInput"
              onChange={(e) => handleMediaUpload(e)} // Update the onChange event
              placeholder="Image/video"
            />
            {!mediaType && (
              <Button
                as="label"
                htmlFor="fileInput"
                variant="outline"
                colorScheme="teal"
                borderRadius="md"
                border={"none"}
                _hover={{ background: "transparent", cursor: "pointer" }}
              >
                <CiImageOn fontSize={"20px"} /> <GoVideo fontSize={"20px"} />
              </Button>
            )}
            {image && mediaType === "image" && (
              <Box
                mt={4}
                textAlign="center"
                position="relative"
                display="inline-block"
              >
                <Image
                  src={image}
                  alt="Selected"
                  borderRadius="md"
                  boxSize="150px"
                  objectFit="cover"
                  mb={2}
                />
                <Button
                  size="xs"
                  colorScheme="red"
                  position="absolute"
                  top="-10px"
                  right="-10px"
                  borderRadius="full"
                  onClick={() => {
                    setImage(null);
                    setMediaType("");
                  }} // Clear image on click
                >
                  ✕
                </Button>
              </Box>
            )}
            {image && mediaType === "video" && (
              <Box
                mt={4}
                textAlign="center"
                position="relative"
                display="inline-block"
              >
                <video width="150" controls>
                  <source src={image} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <Button
                  size="xs"
                  colorScheme="red"
                  position="absolute"
                  top="-10px"
                  right="-10px"
                  borderRadius="full"
                  onClick={() => {
                    setImage(null);
                    setMediaType("");
                  }} // Clear video on click
                >
                  ✕
                </Button>
              </Box>
            )}
          </FormControl>
          <Text mb={4} fontSize={"small"}>
            {content.length}/500
          </Text>
          <Button
            colorScheme="green"
            width={"100%"}
            onClick={() => {
              handlePostSubmit();
              setIsClicked(false);
            }}
            mb={4}
            isDisabled={!content && !media}
            isLoading={picLoading}
          >
            Post
          </Button>
        </Box>
      )}
      <IconButton
        position={"absolute"}
        right={"15%"}
        bottom={"20%"}
        zIndex={10}
        color={"white"}
        borderRadius={"full"}
        _hover={{ color: "black" }}
        background={"blue.400"}
        onClick={() => setIsClicked(!isClicked)}
        icon={
          isClicked ? (
            <IoCloseOutline fontSize={"2rem"} />
          ) : (
            <MdAdd fontSize={"2rem"} />
          )
        }
      />

      {!selectedPost ? (
        <Box
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          flexDir={"column"}
          width={"100%"}
        >
          <Box mt={4} overflowY="scroll" width={"100%"}>
            {loading ? (
              <ChatLoading />
            ) : (
              posts.map((post, index) => (
                <Box
                  width={"100%"}
                  key={index}
                  onClick={() => setSelectedPost(post)}
                  style={{ cursor: "pointer" }}
                >
                  <Post
                    post={post}
                    onCommentSubmit={handleCommentSubmit}
                    handleCommentDelete={handleCommentDelete}
                    user={user}
                  />
                </Box>
              ))
            )}
          </Box>
          <Button
            width={"100%"}
            colorScheme="green"
            onClick={() => setPage(page + 1)}
            mt={"auto"}
          >
            Load More
          </Button>
        </Box>
      ) : (
        <Box width="100%">
          <IconButton
            icon={<IoMdArrowRoundBack />}
            onClick={() => setSelectedPost(null)}
            mb={4}
          />
          <Post
            post={selectedPost}
            onCommentSubmit={handleCommentSubmit}
            handleCommentDelete={handleCommentDelete}
            isSinglePost
            user={user}
          />
        </Box>
      )}
    </Box>
  );
};

const Post = ({
  post,
  onCommentSubmit,
  isSinglePost,
  user,
  handleCommentDelete,
}) => {
  const [commentContent, setCommentContent] = useState("");

  const handleCommentSubmit = () => {
    onCommentSubmit(post._id, commentContent);
    setCommentContent("");
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f2f2f2",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        justifyContent: "center",
        alignItems: "center",
        borderTop: "1px solid grey",
        width: "100%",
        position: "relative",
      }}
    >
      <Box
        width={"100%"}
        display={"flex"}
        justifyContent={"start"}
        alignItems={"center"}
      >
        <Avatar
          mt="7px"
          mr={1}
          size="sm"
          cursor="pointer"
          name={post.author?._id === user?._id ? "You" : post.author?.name}
          src={post.author?._id === user?._id ? user?.pic : post.author?.pic}
        />
        <Text fontWeight={"bold"} mb={-5}>
          {post.author?._id === user?._id ? "You" : post.author?.name}
        </Text>
        <Text
          width={"100%"}
          textAlign={"end"}
          fontSize={"x-small"}
          color={"gray.500"}
          mb={-5}
        >
          {formatMessageTime(post.createdAt)}
        </Text>
        {post.author?._id === user?._id && (
          <IconButton
            background={"transparent"}
            onClick={() => {
              if (window.confirm(`Delete this post?`)) {
                handleCommentDelete(post._id);
              }
            }}
            icon={<MdDeleteForever />}
          />
        )}
      </Box>
      <p
        style={{
          backgroundColor: "#f2f2f2",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
          width: "100%",
        }}
      >
        {post.content}
      </p>
      {post.mediaType === "image" && (
        <img
          src={post.media}
          alt="Post media"
          style={{ width: "100%", height: "auto", borderRadius: "20px" }}
        />
      )}
      {post.mediaType === "video" && (
        <video
          controls
          style={{ width: "100%", height: "auto", borderRadius: "20px" }}
        >
          <source src={post.media} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      <Box
        display={"flex"}
        justifyContent={"start"}
        p={"2"}
        alignItems={"center"}
        width={"100%"}
        fontSize={"small"}
      >
        <FcComments style={{ fontSize: "24px" }} /> {post?.comments.length}{" "}
        Comments
      </Box>
      {isSinglePost && (
        <>
          <Box width={"100%"} overflow={"scroll"} maxH={"200px"}>
            {post.comments?.map((comment, index) => (
              <Box
                key={index}
                padding={"2"}
                width={"100%"}
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"start"}
                background={"white"}
                alignItems={"center"}
                mb={1}
                borderRadius={"5"}
              >
                <div style={{ display: "flex", width: "100%" }}>
                  <Avatar
                    mr={1}
                    size="sm"
                    cursor="pointer"
                    name={
                      comment.author?._id.toString() === user._id.toString()
                        ? "You"
                        : comment.author?.name
                    }
                    src={
                      comment.author?._id.toString() === user._id.toString()
                        ? user?.pic
                        : comment.author?.pic
                    }
                  />
                  <strong>
                    {comment.author?._id.toString() === user._id.toString()
                      ? "You"
                      : comment.author?.name}
                  </strong>
                  <Text
                    width={"100%"}
                    textAlign={"end"}
                    fontSize={"x-small"}
                    color={"gray.500"}
                    mb={-5}
                  >
                    {formatMessageTime(comment.createdAt)}
                  </Text>
                </div>
                <Text textAlign={"start"} width={"100%"} fontSize={"small"}>
                  {comment.content}
                </Text>
              </Box>
            ))}
          </Box>
          <Box width={"100%"} position={"sticky"} backgroundColor="whitesmoke">
            {" "}
            <Textarea
              type="text"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              maxLength={1000}
              minH={"4rem"}
              placeholder="Add a comment"
              mt={4}
              border={"1px solid purple"}
            />
            <Text fontSize={"small"}>{commentContent.length}/250</Text>
            <Button
              colorScheme="blue"
              width={"100%"}
              onClick={handleCommentSubmit}
              mt={2}
            >
              Post Comment
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Feed;
