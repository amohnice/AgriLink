import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import styles from '../styles/Profile.module.css';
import componentStyles from '../styles/components.module.css';

function Profile() {
  const { user } = useAuth();

  if (!user) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className={styles.userInfo}>
          <h1>{user.name}</h1>
          <p className={styles.role}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
          <p className={styles.email}>{user.email}</p>
        </div>
        <div className={styles.actions}>
          <Link 
            to="/profile/edit" 
            className={`${componentStyles.button} ${componentStyles.secondary}`}
          >
            Edit Profile
          </Link>
          <Link 
            to="/profile/settings" 
            className={`${componentStyles.button} ${componentStyles.secondary}`}
          >
            Settings
          </Link>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h2>Account Overview</h2>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>Member Since</span>
              <span className={styles.statValue}>
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            {user.role === 'farmer' && (
              <>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Active Listings</span>
                  <span className={styles.statValue}>{user.activeListings || 0}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Total Sales</span>
                  <span className={styles.statValue}>{user.totalSales || 0}</span>
                </div>
              </>
            )}
            {user.role === 'buyer' && (
              <>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Total Purchases</span>
                  <span className={styles.statValue}>{user.totalPurchases || 0}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Active Orders</span>
                  <span className={styles.statValue}>{user.activeOrders || 0}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2>Recent Activity</h2>
          {user.recentActivity && user.recentActivity.length > 0 ? (
            <ul className={styles.activityList}>
              {user.recentActivity.map((activity, index) => (
                <li key={index} className={styles.activityItem}>
                  <span className={styles.activityDate}>
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                  <span className={styles.activityDescription}>
                    {activity.description}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noActivity}>No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
