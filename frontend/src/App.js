// import { Button, ButtonGroup } from "@chakra-ui/react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Pages/Home";
import GoogleInfo from "./components/Pages/GoogleInfo";
import Chats from "./components/Pages/ChatsPage";
import Paycheck from "./components/Pages/Paycheck";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/googleinfo" Component={GoogleInfo} />
        <Route path="/chats" Component={Chats} />
        <Route path="/paycheck" Component={Paycheck} />
      </Routes>
    </div>
  );
}

export default App;
