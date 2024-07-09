// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ChatState } from '../Context/ChatProvider';
import { Avatar, Box, Text, Button, Input, IconButton, Textarea } from '@chakra-ui/react';
import { IoMdArrowRoundBack } from "react-icons/io";
import { FcComments } from "react-icons/fc";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const { user } = ChatState();
  const [content, setContent] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const author = user?._id;

  const fetchPosts = useCallback(async (page) => {
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await axios.get(`/api/posts?page=${page}`, config);
    setPosts((prevPosts) => [...prevPosts, ...data]);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPosts(page);
    }
  }, [user, page, fetchPosts]);

  const handlePostSubmit = async () => {
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await axios.post('/api/posts', { content, author }, config);
    setPosts([data, ...posts]);
    setContent('');
  };

  const handleCommentSubmit = async (postId, commentContent) => {
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await axios.post(`/api/posts/${postId}/comments`, { content: commentContent, author }, config);
    
    // Find the post that was commented on and update its comments
    const updatedPosts = posts.map((post) => {
      if (post._id === postId) {
        return { ...post, comments: [...post.comments, data.comments[data.comments.length - 1]] };
      }
      return post;
    });
    setPosts(updatedPosts);
  };

  return (
    <div style={{ display: "flex", padding: "2", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%" }}>
      {!selectedPost ? (
        <Box display={"flex"} flexDir={"column"} width={"100%"}>
          <Textarea
            type="text"
            fontFamily={"sans-serif"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            maxLength={500}
            mb={4}
          />
          <Button colorScheme="green" width={"100%"} onClick={handlePostSubmit} mb={4}>Post</Button>
          <div>
            {posts.map((post, index) => (
              <Box width={"100%"} key={index} onClick={() => setSelectedPost(post)} style={{ cursor: "pointer" }}>
                <Post post={post} onCommentSubmit={handleCommentSubmit} currentUser={user} />
              </Box>
            ))}
          </div>
          <Button onClick={() => setPage(page + 1)} mt={4}>Load More</Button>
        </Box>
      ) : (
        <Box width="100%">
          <IconButton icon={<IoMdArrowRoundBack />} onClick={() => setSelectedPost(null)} mb={4} />
          <Post post={selectedPost} onCommentSubmit={handleCommentSubmit} isSinglePost currentUser={user} />
        </Box>
      )}
    </div>
  );
};

const Post = ({ post, onCommentSubmit, isSinglePost, currentUser }) => {
  const [commentContent, setCommentContent] = useState('');

  const handleCommentSubmit = () => {
    onCommentSubmit(post._id, commentContent);
    setCommentContent('');
  };

  return (
    <Box style={{ display: "flex", flexDirection: "column", backgroundColor: "#f2f2f2", padding: "20px", fontFamily: "Arial, sans-serif", justifyContent: "center", alignItems: "center", borderTop: "1px solid grey", width: "100%" }}>
      <Box width={"100%"} padding={"2"} display={"flex"} justifyContent={"start"} alignItems={"center"}>
        <Avatar
          mt="7px"
          mr={1}
          size="sm"
          cursor="pointer"
          name={post.author?.name}
          src={post.author?.pic}
        />
        <Text textAlign={"justify"} fontWeight={"bold"} mb={-5}>{post.author?.name}</Text>
      </Box>
      <p style={{ backgroundColor: "#f2f2f2", padding: "20px", fontFamily: "Arial, sans-serif", width: "100%" }}>{post.content}</p>
      <Box display={"flex"} justifyContent={"start"} p={"2"} alignItems={"center"} width={"100%"} fontSize={"small"}>
        <FcComments style={{ fontSize: "24px" }} />  {post?.comments.length} Comments
      </Box>
      {isSinglePost && (
        <>
          <div>
            {post.comments.map((comment, index) => (
              <Box key={index} padding={"2"} width={"100%"} display={"flex"} justifyContent={"start"} alignItems={"center"}>
                <Avatar
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={comment.author?.name}
                  src={comment.author?.pic}
                />
                <strong>{comment.author?._id === currentUser._id ? "You" : comment.author?.name}</strong>: <Text>{comment.content}</Text>
              </Box>
            ))}
          </div>
          <Input
            type="text"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Add a comment"
            mt={4}
            border={"1px solid purple"}
          />
          <Button onClick={handleCommentSubmit} mt={2}>Comment</Button>
        </>
      )}
    </Box>
  );
};

export default Feed;
