import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { api } from '../api/api';
import styles from '../styles/Profile.module.css';
import componentStyles from '../styles/components.module.css';

function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/auth/me');
        setUserData(response.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.response?.data?.message || 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!user) {
    return <div className={styles.error}>Please log in to view your profile</div>;
  }

  const displayUser = userData || user;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          {displayUser.avatar ? (
            <img src={displayUser.avatar} alt={displayUser.name} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {displayUser.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className={styles.userInfo}>
          <h1>{displayUser.name}</h1>
          <p className={styles.role}>{displayUser.role.charAt(0).toUpperCase() + displayUser.role.slice(1)}</p>
          <p className={styles.email}>{displayUser.email}</p>
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
              <h3>Member Since</h3>
              <p>{new Date(displayUser.createdAt).toLocaleDateString()}</p>
            </div>
            <div className={styles.stat}>
              <h3>Account Status</h3>
              <p>{displayUser.status?.charAt(0).toUpperCase() + displayUser.status?.slice(1) || 'Active'}</p>
            </div>
            {displayUser.role === 'farmer' && (
              <div className={styles.stat}>
                <h3>Seller Status</h3>
                <p>{displayUser.isApproved ? 'Approved' : 'Pending Approval'}</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2>Recent Activity</h2>
          {displayUser.recentActivity && displayUser.recentActivity.length > 0 ? (
            <ul className={styles.activityList}>
              {displayUser.recentActivity.map((activity, index) => (
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
