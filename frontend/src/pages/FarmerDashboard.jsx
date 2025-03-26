import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchListings, deleteListing } from '../api/api';
import PricePredictor from '../components/PricePredictor';
import styles from '../styles/FarmerDashboard.module.css';

function FarmerDashboard() {
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalSales: 0,
  });
  const { user } = useAuth();

  const handleDelete = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      await deleteListing(listingId);
      setMyListings(prevListings => prevListings.filter(listing => listing._id !== listingId));
      setStats(prevStats => ({
        ...prevStats,
        totalListings: prevStats.totalListings - 1,
        activeListings: prevStats.activeListings - 1
      }));
    } catch (err) {
      setError('Failed to delete listing');
    }
  };

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const data = await fetchListings();
        const userListings = data.filter(listing => listing.seller?._id === user?.id);
        setMyListings(userListings);
        
        // Calculate stats
        setStats({
          totalListings: userListings.length,
          activeListings: userListings.filter(l => l.status === 'available').length,
          totalSales: userListings.filter(l => l.status === 'sold').length,
        });
      } catch (err) {
        setError('Failed to fetch your listings');
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, [user]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Farmer Dashboard</h1>
        <p className={styles.subtitle}>Manage your agricultural products and track sales</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Listings</h3>
          <p className={styles.statNumber}>{stats.totalListings}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Active Listings</h3>
          <p className={styles.statNumber}>{stats.activeListings}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Sales</h3>
          <p className={styles.statNumber}>{stats.totalSales}</p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your Listings</h2>
            <Link to="/listings/new" className={styles.button}>
              Create New Listing
            </Link>
          </div>
          
          {error && <p className={styles.error}>{error}</p>}
          
          <div className={styles.listingsGrid}>
            {myListings.length === 0 ? (
              <div className={styles.empty}>
                <p>You haven't created any listings yet.</p>
                <Link to="/listings/new" className={styles.button}>
                  Create Your First Listing
                </Link>
              </div>
            ) : (
              myListings.map((listing) => (
                <div key={listing._id} className={styles.listingCard}>
                  <img
                    src={listing.images?.[0] || "https://placehold.co/300x200"}
                    alt={listing.title}
                    className={styles.listingImage}
                  />
                  <div className={styles.listingContent}>
                    <h3 className={styles.listingTitle}>{listing.title}</h3>
                    <div className={styles.listingDetails}>
                      <span className={styles.price}>
                        KES {listing.price.toLocaleString()}
                      </span>
                      <span className={styles.quantity}>
                        Qty: {listing.quantity}
                      </span>
                      <span className={`${styles.status} ${styles[listing.status]}`}>
                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                      </span>
                    </div>
                    <div className={styles.listingActions}>
                      <Link
                        to={`/listings/${listing._id}/edit`}
                        className={`${styles.button} ${styles.editButton}`}
                      >
                        Edit
                      </Link>
                      <button
                        className={`${styles.button} ${styles.deleteButton}`}
                        onClick={() => handleDelete(listing._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Price Prediction Tool</h2>
          <div className={styles.predictionTool}>
            <PricePredictor />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmerDashboard;
