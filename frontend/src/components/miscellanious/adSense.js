import React, { useEffect } from "react";

const YourComponent = () => {
  useEffect(() => {
    // Create a script element
    const script = document.createElement("script");

    // Set the attributes for the Google AdSense script
    script.async = true;
    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5708660695345943";
    script.crossOrigin = "anonymous";

    // Append the script to the head of the document
    document.head.appendChild(script);

    // Clean up function to remove the script when the component is unmounted
    return () => {
      document.head.removeChild(script);
    };
  }, []); // The empty dependency array ensures this effect runs only once

  return (
    <Box
      className="ads-container" // Add a class for styling or targeting
      fontSize={{ base: "18px", md: "20px" }}
      fontFamily="Work sans"
      textAlign={"center"}
      userSelect={"none"}
    >
      Ads content goes here
    </Box>
  );
};

export default YourComponent;
