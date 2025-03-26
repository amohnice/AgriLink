import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Listings from '../pages/Listings';
import CreateListing from '../pages/CreateListing';
import FarmerDashboard from '../pages/FarmerDashboard';
import BuyerDashboard from '../pages/BuyerDashboard';
import Profile from '../pages/Profile';
import Chat from '../pages/Chat';
import ListingDetails from '../pages/ListingDetails';
import EditProfile from '../pages/EditProfile';
import Settings from '../pages/Settings';

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

function RoleBasedRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <Navigate to={user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard'} />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/listings" element={<Listings />} />
      <Route path="/listings/:id" element={<ListingDetails />} />
      <Route
        path="/create-listing"
        element={
          <FarmerRoute>
            <CreateListing />
          </FarmerRoute>
        }
      />
      <Route
        path="/farmer/dashboard"
        element={
          <FarmerRoute>
            <FarmerDashboard />
          </FarmerRoute>
        }
      />
      <Route
        path="/buyer/dashboard"
        element={
          <ProtectedRoute>
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route path="/dashboard" element={<RoleBasedRedirect />} />
    </Routes>
  );
}

export default AppRoutes;