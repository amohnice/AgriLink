import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Home.module.css";
import componentStyles from '../styles/components.module.css';

function Home() {
  const { user } = useAuth();

  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Welcome to AgriLink</h1>
        <p className={styles.subtitle}>
          Connecting farmers and buyers for a sustainable agricultural marketplace
        </p>
        
        <div className={styles.cta}>
          {!user ? (
            <>
              <Link to="/register" className={`${componentStyles.button} ${componentStyles.primary}`}>
                Get Started
              </Link>
              <Link to="/login" className={`${componentStyles.button} ${componentStyles.secondary}`}>
                Sign In
              </Link>
            </>
          ) : (
            <>
              <Link
                to={user.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard'}
                className={`${componentStyles.button} ${componentStyles.primary}`}
              >
                Go to Dashboard
              </Link>
              <Link to="/listings" className={`${componentStyles.button} ${componentStyles.secondary}`}>
                Browse Listings
              </Link>
            </>
          )}
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.feature}>
          <h3>For Farmers</h3>
          <ul>
            <li>List your products easily</li>
            <li>Manage your inventory</li>
            <li>Connect with buyers directly</li>
            <li>Track your sales</li>
          </ul>
        </div>

        <div className={styles.feature}>
          <h3>For Buyers</h3>
          <ul>
            <li>Browse fresh produce</li>
            <li>Connect with local farmers</li>
            <li>Real-time chat with sellers</li>
            <li>Secure transactions</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default Home;
