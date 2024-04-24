import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Pages/Home";
import GoogleInfo from "./components/Pages/GoogleInfo";
import Chats from "./components/Pages/ChatsPage";
import Paycheck from "./components/Pages/Paycheck";
import NotFound from "./components/Pages/NotFound";
import forgotPassword from "./components/Pages/ForgotPassword";
import VideoCall from "./components/videoCall";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/googleinfo" Component={GoogleInfo} />
        <Route path="/chats" Component={Chats} />
        <Route path="/paycheck" Component={Paycheck} />
        <Route path="/accountrecovery" Component={forgotPassword} />
        <Route path="/videocalls/:receiver" Component={VideoCall} />
        <Route path="/video-call" Component={VideoCall} />
        <Route path="*" Component={NotFound} />
      </Routes>
    </div>
  );
}

export default App;
