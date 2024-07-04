import React from "react";
import Typewriter from "typewriter-effect";
import styled from "styled-components";

const ColoredTypewriter = styled.div`
  .Typewriter__wrapper {
    fontSize: 20px;
    color: #ff69b4; /* Change this to your desired color */
  }
  .Typewriter__cursor {
    color: #fff; /* Change this to your desired color */
  }
`;

function Type() {
  return (
    <ColoredTypewriter>
      <Typewriter
        options={{
          strings: [
            "IntiMates+ 💑",
            "From Fleeting to Lasting 🌟",
            "Intimacy & Connection ❤️",
            "Top Adult Connection 🔥",
            
          ],
          autoStart: true,
          loop: true,
          deleteSpeed: 50,
        }}
      />
    </ColoredTypewriter>
  );
}

export default Type;