import React from "react";
import Typewriter from "typewriter-effect";
import styled from "styled-components";

const ColoredTypewriter = styled.div`
  .Typewriter__wrapper {
    fontsize: 20px;
    color: #fff; /* Change this to your desired color */
  }
  .Typewriter__cursor {
    color: #000; /* Change this to your desired color */
  }
`;

function Type() {
  return (
    <ColoredTypewriter>
      <Typewriter
        options={{
          strings: ["IntimatesPlus💑", "From Fleeting to Lasting🌟"],
          autoStart: true,
          loop: true,
          deleteSpeed: 50,
        }}
      />
    </ColoredTypewriter>
  );
}

export default Type;
