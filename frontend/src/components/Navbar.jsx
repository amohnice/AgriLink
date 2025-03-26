import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Navbar.module.css";
import componentStyles from "../styles/components.module.css";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.logo}>
        AgriLink
      </Link>
      <ul className={styles.navLinks}>
        <li><Link to="/">Home</Link></li>
        {user ? (
          <>
            <li>
              <Link to={user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard'}>
                Dashboard
              </Link>
            </li>
            <li><Link to="/listings">Listings</Link></li>
            {user.role === 'farmer' && (
              <li><Link to="/create-listing">Create Listing</Link></li>
            )}
            <li><Link to="/profile">Profile</Link></li>
            <li><Link to="/chat">Chat</Link></li>
            <li>
              <button 
                onClick={logout} 
                className={`${componentStyles.buttonOutline} ${styles.logoutBtn}`}
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className={componentStyles.buttonPrimary}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className={componentStyles.buttonOutline}>
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
