import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import Profile from "./pages/Profile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/listings", element: <Listings /> },
      { path: "/profile", element: <Profile /> },
    ],
  },
]);

export default router;
