import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import Profile from "./pages/Profile";
import CreateListing from "./pages/CreateListing";
import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
}

function FarmerRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'farmer') return <Navigate to="/dashboard" />;
  return children;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/listings", element: <Listings /> },
      { path: "/profile", element: <Profile /> },
      { 
        path: "/create-listing", 
        element: (
          <FarmerRoute>
            <CreateListing />
          </FarmerRoute>
        )
      },
    ],
  },
]);

export default router;
