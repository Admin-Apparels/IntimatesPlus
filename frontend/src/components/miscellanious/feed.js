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
} from "@chakra-ui/react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FcApproval, FcComments } from "react-icons/fc";
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

  const handlePostSubmit = async () => {
    if (media && !content) {
      toast({
        title: "Please add some text!",
        status: "info",
        duration: 3000, // Toast will disappear after 3 seconds
        isClosable: true, // Allow the user to close the toast manually
      });
      return;
    }
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "/api/posts",
        { content, author, media, mediaType },
        config
      );
      setPosts([data, ...posts]);
      setContent("");
      setMedia("");
      toast({
        title: "Posted",
        status: "info",
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Not posted",
        description: "Try again after some time",
        status: "info",
        position: "top",
      });
    }
  };

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
        title: "Not posted",
        description: "Try again after some time",
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

  const handleMediaUpload = (file) => {
    setPicLoading(true);

    if (!file) {
      toast({
        title: "Please select an image or video!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
      return;
    }

    if (
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "video/mp4"
    ) {
      let data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "RocketChat");

      fetch("https://api.cloudinary.com/v1_1/dvc7i8g1a/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setMedia(data.url.toString());
          setMediaType(file.type.startsWith("image") ? "image" : "video");
          setPicLoading(false);
        })
        .catch((err) => {
          console.error("Error uploading media:", err);
          setPicLoading(false);
        });
    } else {
      toast({
        title: "Invalid file type!",
        description: "Please upload a JPEG, PNG, or MP4 file.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setPicLoading(false);
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
          {media ? (
            <>
              <strong>Uploaded</strong>
              <FcApproval />
            </>
          ) : (
            <>
              <label htmlFor="file-upload" class="custom-file-upload">
                📁 Choose a file
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/jpeg,image/png,video/mp4"
                onChange={(e) => handleMediaUpload(e.target.files[0])}
                class="custom-file-input"
              />
            </>
          )}
          {picLoading && <p>Uploading...</p>}
          <Text mb={4} fontSize={"small"}>
            {content.length}/500
          </Text>
          <Button
            colorScheme="green"
            width={"100%"}
            onClick={handlePostSubmit}
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
        borderRadius={"full"}
        _hover={{ background: "transparent", color: "red" }}
        background={"white"}
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
