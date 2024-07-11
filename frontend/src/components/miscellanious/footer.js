import React from 'react'
import { Grid, GridItem, Image } from '@chakra-ui/react'

const Footer = () => {
  return (
    <Grid
      templateAreas={{
        base: `"header"
               "nav"
               "main"
               "footer"`,
        md: `"header header"
             "nav main"
             "nav footer"`
      }}
      gridTemplateRows={{
        base: 'repeat(4, auto)',
        md: '50px 1fr 30px'
      }}
      gridTemplateColumns={{
        base: '1fr',
        md: '150px 1fr'
      }}
      h='20%'
      gap='1'
      fontWeight='bold'
      textAlign={"center"}
      color={"wheat"}
      fontSize={"small"}
      background={"grey"}
      overflow={"scroll"}
    >
      <GridItem p='6' area={'header'}>
      Mission Statement:
      Our mission is to help users find genuine
      intimacy and companionship, reducing feelings of isolation and improving overall well-being.
      </GridItem>
      <GridItem pl='2' area={'nav'} display={"flex"} justifyContent={"center"} alignItems={"center"}>
      <Image
          src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1701779357/icons8-sex-64_a1hki1.png"
          height={{ base: 6, md: 10 }}
        />IntiMates+
      </GridItem>
      <GridItem p='6' area={'footer'} >
      Join our community discussions on our forums and social media channels. Your insights and feedback help us improve and grow.
      Have questions or suggestions? <a href="/contact">Contact us here.</a>
      </GridItem>
    </Grid>
  )
}

export default Footer
