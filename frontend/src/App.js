// import { Button, ButtonGroup } from "@chakra-ui/react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./components/Pages/Home";
import Chats from "./components/Pages/ChatsPage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" Component={Home} exact />
        <Route path="/chats" Component={Chats} />
      </Routes>
    </div>
  );
}

export default App;
