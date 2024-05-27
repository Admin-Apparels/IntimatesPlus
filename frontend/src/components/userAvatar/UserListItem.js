import { Avatar } from "@chakra-ui/avatar";
import { Box, Text } from "@chakra-ui/layout";
import { ChatState } from "../Context/ChatProvider";

const UserListItem = ({ user, handleFunction }) => {
  const { onlineUsersCount } = ChatState();
  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="#E8E8E8"
      _hover={{
        background: "#38B2AC",
        color: "white",
      }}
      w="100%"
      display="flex"
      alignItems="center"
      color="black"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
      position="relative"
    >
      {onlineUsersCount?.includes(user._id) && (
        <Box
          position="absolute"
          top={3}
          left={3}
          w={3}
          h={3}
          bg="green.500"
          borderRadius="50%"
          zIndex={1}
        />
      )}
      <Avatar
        mr={2}
        size="sm"
        cursor="pointer"
        name={user.name}
        src={user.pic}
        position="relative"
      />
      <Box>
        <Box fontSize="xs">
          <Text fontSize="larger" fontWeight="bold">
            {user.name}
          </Text>
          <Text>
            {user.value.length > 50
              ? user.value.substring(0, 51) + "..."
              : user.value}
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default UserListItem;
