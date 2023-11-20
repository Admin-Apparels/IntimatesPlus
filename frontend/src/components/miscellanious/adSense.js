import React, { useEffect } from "react";

const AdSenseComponent = () => {
  useEffect(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-23452425"
      data-ad-slot="24524524"
      data-ad-format="auto"
    />
  );
};

export default AdSenseComponent;
