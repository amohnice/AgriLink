import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Settings.module.css';

function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    messages: true,
    updates: false
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showLocation: true,
    showContact: true
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handlePrivacyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPrivacy(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // TODO: Implement settings update API call
      setSuccess('Settings updated successfully');
      setTimeout(() => navigate('/profile'), 2000);
    } catch (err) {
      setError('Failed to update settings');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <section className={styles.section}>
          <h2>Notifications</h2>
          <div className={styles.settingGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="email"
                checked={notifications.email}
                onChange={handleNotificationChange}
              />
              Email Notifications
            </label>
            <p className={styles.description}>
              Receive updates and alerts via email
            </p>
          </div>

          <div className={styles.settingGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="push"
                checked={notifications.push}
                onChange={handleNotificationChange}
              />
              Push Notifications
            </label>
            <p className={styles.description}>
              Receive notifications in your browser
            </p>
          </div>

          <div className={styles.settingGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="messages"
                checked={notifications.messages}
                onChange={handleNotificationChange}
              />
              Message Notifications
            </label>
            <p className={styles.description}>
              Get notified when you receive new messages
            </p>
          </div>

          <div className={styles.settingGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="updates"
                checked={notifications.updates}
                onChange={handleNotificationChange}
              />
              Product Updates
            </label>
            <p className={styles.description}>
              Receive updates about new features and improvements
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Privacy</h2>
          <div className={styles.settingGroup}>
            <label htmlFor="profileVisibility">Profile Visibility</label>
            <select
              id="profileVisibility"
              name="profileVisibility"
              value={privacy.profileVisibility}
              onChange={handlePrivacyChange}
              className={styles.select}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="contacts">Contacts Only</option>
            </select>
          </div>

          <div className={styles.settingGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="showLocation"
                checked={privacy.showLocation}
                onChange={handlePrivacyChange}
              />
              Show Location
            </label>
            <p className={styles.description}>
              Display your location on your profile
            </p>
          </div>

          <div className={styles.settingGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="showContact"
                checked={privacy.showContact}
                onChange={handlePrivacyChange}
              />
              Show Contact Info
            </label>
            <p className={styles.description}>
              Make your contact information visible to others
            </p>
          </div>
        </section>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${styles.button} ${styles.saveButton}`}
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
