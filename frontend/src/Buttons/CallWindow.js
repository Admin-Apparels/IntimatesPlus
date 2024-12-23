import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Box } from "@chakra-ui/react";
import { faPhone, faVideo } from "@fortawesome/free-solid-svg-icons";
import ActionButton from "./ActionButton";

function CallWindow({
  peerSrc,
  localSrc,
  config,
  mediaDevice,
  status,
  endCall,
}) {
  const peerVideo = useRef(null);
  const localVideo = useRef(null);
  const [video, setVideo] = useState(config.video);
  const [audio, setAudio] = useState(config.audio);

  useEffect(() => {
    if (peerVideo.current && peerSrc) peerVideo.current.srcObject = peerSrc;
    if (localVideo.current && localSrc) localVideo.current.srcObject = localSrc;
  });

  useEffect(() => {
    if (mediaDevice) {
      mediaDevice.toggle("Video", video);
      mediaDevice.toggle("Audio", audio);
    }
  });

  /**
   * Turn on/off a media device
   * @param {'Audio' | 'Video'} deviceType - Type of the device eg: Video, Audio
   */
  const toggleMediaDevice = (deviceType) => {
    if (deviceType === "Video") {
      setVideo(!video);
    }
    if (deviceType === "Audio") {
      setAudio(!audio);
    }
    mediaDevice.toggle(deviceType);
  };

  return (
    <Box className={`call-window ${status}`}>
      <video id="peerVideo" ref={peerVideo} autoPlay />
      <video id="localVideo" ref={localVideo} autoPlay muted />
      <Box className="video-control">
        <ActionButton
          icon={faVideo}
          disabled={!video}
          onClick={() => toggleMediaDevice("Video")}
        >
          Video
        </ActionButton>
        <ActionButton
          icon={faPhone}
          disabled={!audio}
          onClick={() => toggleMediaDevice("Audio")}
        >
          Audio
        </ActionButton>
        <ActionButton icon={faPhone} onClick={() => endCall(true)}>
          Hangup
        </ActionButton>
      </Box>
    </Box>
  );
}

CallWindow.propTypes = {
  status: PropTypes.string.isRequired,
  localSrc: PropTypes.object,
  peerSrc: PropTypes.object,
  config: PropTypes.shape({
    audio: PropTypes.bool.isRequired,
    video: PropTypes.bool.isRequired,
  }).isRequired,
  mediaDevice: PropTypes.object,
  endCall: PropTypes.func.isRequired,
};

export default CallWindow;
