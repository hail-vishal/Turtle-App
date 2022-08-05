import React, { useEffect, createContext, useReducer, useContext } from "react";
import NavBar from "./components/Navbar";
import "./App.css";
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Home from "./components/screens/Home";
import Profile from "./components/screens/Profile";
import Signin from "./components/screens/Signin";
import Signup from "./components/screens/Signup";
import UserProfile from "./components/screens/UserProfile";
import CreatePost from "./components/screens/CreatePost";
import SubscribedUserPosts from "./components/screens/SubscribedUserPosts";
import { reducer, intialState } from "./reducers/userReducer";
import Reset from "./components/screens/Reset";
import Newpassword from "./components/screens/Newpassword";

export const userContext = createContext();

const Routing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useContext(userContext);
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      dispatch({ type: "USER", payload: user });
    } else {
      if (!location.pathname.startsWith("/reset")) navigate("/signin");
    }
  }, []);
  return (
    <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path="/signin" element={<Signin />}></Route>
      <Route path="/signup" element={<Signup />}></Route>
      <Route exact path="/profile" element={<Profile />}></Route>
      <Route path="/create" element={<CreatePost />}></Route>
      <Route path="/profile/:userid" element={<UserProfile />}></Route>
      <Route path="/myfollowings" element={<SubscribedUserPosts />}></Route>
      <Route exact path="/reset" element={<Reset />}></Route>
      <Route path="/reset/:token" element={<Newpassword />}></Route>
    </Routes>
  );
};

function App() {
  const [state, dispatch] = useReducer(reducer, intialState);
  return (
    <userContext.Provider value={{ state, dispatch }}>
      <BrowserRouter>
        <NavBar />
        <Routing />
      </BrowserRouter>
    </userContext.Provider>
  );
}

export default App;
