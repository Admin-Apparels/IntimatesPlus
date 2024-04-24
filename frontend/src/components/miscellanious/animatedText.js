import { Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const AnimatedTyping = () => {
  const [textToType] = useState("fuckmate.boo");
  const [displayedText, setDisplayedText] = useState("");
  const [textLength, setTextLength] = useState(0);

  useEffect(() => {
    let index = 0;

    const typingIntervalId = setInterval(() => {
      const nextChar = textToType[index];
      index += 1;

      if (nextChar !== undefined) {
        setDisplayedText((prevText) => prevText + nextChar);
        setTextLength((prevLength) => prevLength + 1);
      } else {
        setTimeout(() => {
          const clearIntervalId = setInterval(() => {
            setDisplayedText((prevText) => prevText.slice(0, -1));
            setTextLength((prevLength) => Math.max(prevLength - 1, 0));
          }, 100);

          setTimeout(() => {
            clearInterval(clearIntervalId);
            setDisplayedText(""); // Clear the text
            setTextLength(0);
            index = 0; // Reset index for the next cycle
          }, 3000);
        }, 100);
      }
    }, 100);

    return () => clearInterval(typingIntervalId);
  }, [textToType]);

  return (
    <>
      {displayedText.length > 1 ? (
        <Input
          value={displayedText}
          width={`${textLength}ch`}
          display="flex"
          textAlign="center"
          fontSize="3xl"
          fontWeight="bold"
          userSelect="none"
          textColor={"red.500"}
          border={"none"}
          padding="5px"
          background="transparent"
        />
      ) : (
        ""
      )}
    </>
  );
};

export default AnimatedTyping;
