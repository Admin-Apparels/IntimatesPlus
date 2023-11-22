import axios from "axios";
import React, { useEffect, useState } from "react";
import { ChatState } from "../Context/ChatProvider";

const DisplayAdsComponent = () => {
  const [ads, setAds] = useState([]);
  const { user } = ChatState();

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.get(
          "/api/user/getadsninfo/advertisement",
          config
        );

        setAds(data);
      } catch (error) {
        console.error("Error fetching/displaying ads:", error);
      }
    };

    fetchAds();
  }, [user.token]);

  const getRandomAd = () => {
    const randomIndex = Math.floor(Math.random() * ads.length);
    return ads[randomIndex];
  };

  return (
    <div>
      <h1>Display Ads</h1>
      {ads.length}
      {ads.length > 0 && (
        <div>
          <p>{getRandomAd().someProperty}</p>
        </div>
      )}
    </div>
  );
};

export default DisplayAdsComponent;
