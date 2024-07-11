import "./App.css";
import React, { Suspense, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Loading from "./components/userAvatar/loading";

// Lazily load the components
const Home = React.lazy(() => import("./components/Pages/Home"));
const Chats = React.lazy(() => import("./components/Pages/ChatsPage"));
const Paycheck = React.lazy(() => import("./components/Pages/Paycheck"));
const NotFound = React.lazy(() => import("./components/Pages/NotFound"));
const ForgotPassword = React.lazy(() => import("./components/Pages/ForgotPassword"));
const VideoCall = React.lazy(() => import("./components/videoCall"));

function App() {
  const [availableHeight, setAvailableHeight] = useState(window.innerHeight);

  useEffect(() => {

    const updateHeight = () => {
      const height = window.innerHeight;
      setAvailableHeight(height);
    };

    window.addEventListener('resize', updateHeight);

    // Initial height calculation
    updateHeight();

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  return (
    <div className="App" style={{ height: `${availableHeight}px`, }}>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" Component={Home} />
          <Route path="/chats" Component={Chats} />
          <Route path="/paycheck" Component={Paycheck} />
          <Route path="/accountrecovery" Component={ForgotPassword} />
          <Route path="/videocalls/:receiver" Component={VideoCall} />
          <Route path="/video-call" Component={VideoCall} />
          <Route path="*" Component={NotFound} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
