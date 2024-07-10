// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ChatState } from '../Context/ChatProvider';
import { Avatar, Box, Text, Button, Input, IconButton, Textarea, useToast } from '@chakra-ui/react';
import { IoMdArrowRoundBack } from "react-icons/io";
import { FcComments } from "react-icons/fc";
import ChatLoading from '../ChatLoading';
import { formatMessageTime } from '../config/ChatLogics';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const { user } = ChatState();
  const [content, setContent] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const author = user?._id;
  const toast = useToast();

  const fetchPosts = useCallback(async (page) => {
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
        })
    }
  
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchPosts(page);
    }
  }, [user, page, fetchPosts]);

  const handlePostSubmit = async () => {
    try {
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await axios.post('/api/posts', { content, author }, config);
    setPosts([data, ...posts]);
    setContent('');
    toast({
        title: "Posted",
        status: "info",
        position: 'top'
    })

    } catch (error) {
        toast({
            title: "Not posted",
            description: "Try again after some time",
            status: "info",
            position: 'top'
            
        })
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
    const { data } = await axios.post(`/api/posts/${postId}/comments`, { content: commentContent, author }, config);
    const updatedPosts = posts.map((post) => (post._id === postId ? data : post));
    setPosts(updatedPosts);

    toast({
        title: "Posted",
        status: "info",
        position: 'top'
    })
    } catch (error) {
        toast({
            title: "Not posted",
            description: "Try again after some time",
            status: "info",
            position: 'top'
            
        })
    }
    
  };
  return (
    <Box style={{ display: "flex", padding: "2", flexDirection: "column", justifyContent: "center", alignItems: "center", width: "100%" }}>
      {!selectedPost ? (
        <Box display={"flex"} justifyContent={"center"} alignItems={"center"} flexDir={"column"} width={"100%"}>
          <Box position={"sticky"} top={-2} zIndex={1} width={"100%"} backgroundColor="white">
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
          </Box>
          
          <Box mt={4}  overflowY ="scroll" width={"100%"}>
            {loading? <ChatLoading /> : posts.map((post, index) => (
              <Box width={"100%"} key={index} onClick={() => setSelectedPost(post)} style={{ cursor: "pointer" }}>
                <Post post={post} onCommentSubmit={handleCommentSubmit} currentUser={user} />
              </Box>
            ))}
          </Box>
          <Button onClick={() => setPage(page + 1)} mt={4}>Load More</Button>
        </Box>
      ) : (
        <Box width="100%">
          <IconButton icon={<IoMdArrowRoundBack />} onClick={() => setSelectedPost(null)} mb={4} />
          <Post post={selectedPost} onCommentSubmit={handleCommentSubmit} isSinglePost user={user} />
        </Box>
      )}
    </Box>
  );
}
const Post = ({ post, onCommentSubmit, isSinglePost, user }) => {
  const [commentContent, setCommentContent] = useState('');

  const handleCommentSubmit = () => {
    onCommentSubmit(post._id, commentContent);
    setCommentContent('');
  };

  return (
    <Box style={{ display: "flex", flexDirection: "column", backgroundColor: "#f2f2f2", padding: "20px", fontFamily: "Arial, sans-serif", justifyContent: "center", alignItems: "center", borderTop: "1px solid grey", width: "100%"}}>
      <Box width={"100%"} padding={"2"} display={"flex"} justifyContent={"start"} alignItems={"center"}>
        <Avatar
          mt="7px"
          mr={1}
          size="sm"
          cursor="pointer"
          name={post.author?._id === user?._id ? "You" : post.author?.name}
          src={post.author?._id === user?._id ? user?.pic : post.author?.pic}
        />
        <Text fontWeight={"bold"} mb={-5}>{post.author?._id === user?._id ? "You" : post.author?.name}</Text>
        <Text width={"100%"} textAlign={"end"} fontSize={"sm"} color={"gray.500"} mb={-5}>{formatMessageTime(post.createdAt)}</Text>
      </Box>
      <p style={{ backgroundColor: "#f2f2f2", padding: "20px", fontFamily: "Arial, sans-serif", width: "100%" }}>{post.content}</p>
      <Box display={"flex"} justifyContent={"start"} p={"2"} alignItems={"center"} width={"100%"} fontSize={"small"}>
        <FcComments style={{ fontSize: "24px" }} />  {post?.comments.length} Comments
      </Box>
      {isSinglePost && (
        <>
          <Box width={"100%"} maxH={"200px"}>
            {post.comments?.map((comment, index) => (
              <Box key={index} padding={"2"} width={"100%"} display={"flex"} flexDirection={"column"} justifyContent={"start"} background={"white"} alignItems={"center"} mb={1} borderRadius={"5"}>
                 <Box display={"flex"} width={"100%"}>
                  <Avatar
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={comment.author?._id === user?._id ? "You" : comment.author?.name}
                  src={comment.author?._id === user?._id ? user?.pic : comment.author?.pic}
                />
                <strong>{comment.author?._id === user?._id ? "You" : comment.author?.name}</strong>
                <Text width={"100%"} textAlign={"end"} fontSize={"sm"} color={"gray.500"} mb={-5}>{formatMessageTime(comment.createdAt)}</Text>
                 </Box>
                
                <Text textAlign={"start"} width={"100%"}>{comment.content}</Text>
              </Box>
            ))}
          </Box>
          <Input
            type="text"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Add a comment"
            mt={4}
            border={"1px solid purple"}
          />
          <Button colorScheme='blue' width={"100%"} onClick={handleCommentSubmit} mt={2}>Post Comment</Button>
        </>
      )}
    </Box>
  );
};

export default Feed;
