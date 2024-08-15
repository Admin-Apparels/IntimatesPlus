import React from 'react';
import { Grid, GridItem, Box, Text, Link } from '@chakra-ui/react';

const FooterAchieves = () => {
  return (
    <Grid 
      templateColumns={{ base: '1fr', md: 'repeat(6, 1fr)' }} 
      gap={2} 
      m={2} 
      mt={0}
      userSelect={"none"}
    >
      <GridItem colSpan={{ base: 6, md: 2 }} h='auto' bg='grey' p={4} borderRadius={4}>
        <Box fontSize={"small"}>
          <Text fontSize="xl" fontWeight="bold" mb={2}>Disturbing Research Highlights:</Text>
          <Text mb={"3"}>
          <strong style={{padding: 2}}>Trends in Relationships:</strong>
          Research suggests that by 2030, a significant percentage of women aged 30-40 may
           be single and childless due
           to changing social dynamics and higher standards set by social media,
            read the research <Link p={1} color="blue.100" href="https://www.quora.com/With-the-news-50-of-women-being-single-and-childless-by-2030-why-are-men-rejecting-most-women-and-what-can-lonely-women-do-to-improve" target="_blank" rel="noopener noreferrer">here.</Link>
          </Text>
          <Text> 
          <strong style={{padding: 2}}>Impact of Porn on Mental Health:</strong>
          Studies indicate that excessive consumption of porn can lead to feelings of isolation, depression, and anxiety.
          read the research <Link p={1} color="blue.100" href="https://www.psychologytoday.com/intl/blog/why-bad-looks-good/202109/the-link-between-pornography-and-loneliness" target="_blank" rel="noopener noreferrer">here.</Link>
          </Text>
        </Box>
      </GridItem>
      
      <GridItem colSpan={{ base: 6, md: 2 }} h='auto' bg='grey' p={4} borderRadius={4}>
      <Box fontSize={"small"}>
          <Text fontSize="xl" fontWeight="bold" mb={2}>IntiMates+ Achievements:</Text>
          <Text mb={"3"}>
          <strong style={{padding: 2}}>Benefits of Genuine Connections:</strong>
          Data shows that individuals who form intimate, long-term relationships
           report higher levels of happiness and life satisfaction.
          </Text>
          <Text>
          <strong style={{padding: 2}}>Openness and Bonding:</strong>
          The app has created an open realm for discussing intimacy, helping to defeat the menace of isolation
           and fleeting pleasures as people form bonds with openness and honesty.
          </Text>
        </Box>
      </GridItem>

      <GridItem colSpan={{ base: 6, md: 2 }} h='auto' bg='grey' p={4} borderRadius={4}>
      <Box fontSize={"small"}>
      <Text fontSize="xl" fontWeight="bold" mb={2}>Future Goals:</Text>
      <Text>
      <strong style={{ padding: 2 }}>Increase User Engagement:</strong>
      We aim to grow the user base and enhance features to foster more meaningful connections.
      </Text>
      <Text fontSize="xl" fontWeight="bold" m={2}>More Information:</Text>
      <Text>
      For more information, join our <Link p={1} color="blue.100" href="https://x.com/IntiMates_Plus">X forum</Link> 
      or email: <strong>intimates_plus@fuckmate.boo</strong>. Support us with donations <Link color="blue.100" href="https://www.paypal.com/donate/?hosted_button_id=2L8HHGURQTED2">here</Link>. Stay 
      connected with our latest updates and community events.
      </Text>
      </Box>
      </GridItem>
    </Grid>
  );
};

export default FooterAchieves;

