import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Listings from '../pages/Listings';
import CreateListing from '../pages/CreateListing';
import EditListing from '../pages/EditListing';
import FarmerDashboard from '../pages/FarmerDashboard';
import BuyerDashboard from '../pages/BuyerDashboard';
import Profile from '../pages/Profile';
import Chat from '../pages/Chat';
import ListingDetails from '../pages/ListingDetails';
import EditProfile from '../pages/EditProfile';
import Settings from '../pages/Settings';
import AdminDashboard from '../pages/admin/AdminDashboard';
import Messages from '../pages/Messages';
import About from '../pages/About';
import Contact from '../pages/Contact';
import HelpCenter from '../pages/HelpCenter';

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

function BuyerRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'buyer') return <Navigate to="/dashboard" />;
  return children;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
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
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/listings" element={<Listings />} />
      <Route path="/listings/:id" element={<ListingDetails />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/help" element={<HelpCenter />} />
      
      {/* Protected routes accessible to all authenticated users */}
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
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />
      
      {/* Dashboard redirect */}
      <Route path="/dashboard" element={<RoleBasedRedirect />} />
      
      {/* Admin routes */}
      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      
      {/* Farmer routes */}
      <Route
        path="/farmer/*"
        element={
          <FarmerRoute>
            <Routes>
              <Route path="/dashboard" element={<FarmerDashboard />} />
              <Route path="/create-listing" element={<CreateListing />} />
            </Routes>
          </FarmerRoute>
        }
      />
      
      {/* Buyer routes */}
      <Route
        path="/buyer/*"
        element={
          <BuyerRoute>
            <BuyerDashboard />
          </BuyerRoute>
        }
      />

      {/* Create listing route */}
      <Route
        path="/create-listing"
        element={
          <FarmerRoute>
            <CreateListing />
          </FarmerRoute>
        }
      />

      {/* Edit listing route */}
      <Route
        path="/listings/:id/edit"
        element={
          <FarmerRoute>
            <EditListing />
          </FarmerRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;