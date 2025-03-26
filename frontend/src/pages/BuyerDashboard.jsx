import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/BuyerDashboard.module.css';
import axios from 'axios';
import { toast } from 'react-toastify';

function BuyerDashboard() {
  const { user } = useAuth();
  const [recentListings, setRecentListings] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPurchases: 0,
    savedItems: 0,
    activeOrders: 0
  });

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/listings/recent`);
      setRecentListings(response.data);
    } catch (err) {
      console.error('Error fetching recent listings:', err);
      setError('Failed to fetch recent listings');
      toast.error('Failed to fetch recent listings');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedListings = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/listings/saved`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setSavedListings(response.data);
      setStats(prev => ({ ...prev, savedItems: response.data.length }));
    } catch (err) {
      console.error('Error fetching saved listings:', err);
      toast.error('Failed to fetch saved listings');
    }
  };

  useEffect(() => {
    fetchListings();
    fetchSavedListings();
  }, []);

  const handleSave = async (listingId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/listings/${listingId}/save`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const listing = recentListings.find(l => l._id === listingId);
      if (listing && !savedListings.some(saved => saved._id === listingId)) {
        setSavedListings(prev => [...prev, listing]);
        setStats(prev => ({ ...prev, savedItems: prev.savedItems + 1 }));
        toast.success('Listing saved successfully!');
      }
    } catch (err) {
      console.error('Error saving listing:', err);
      toast.error('Failed to save listing');
    }
  };

  const handleRemoveSaved = async (listingId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/listings/${listingId}/save`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setSavedListings(prev => prev.filter(listing => listing._id !== listingId));
      setStats(prev => ({ ...prev, savedItems: prev.savedItems - 1 }));
      toast.success('Listing removed from saved items');
    } catch (err) {
      console.error('Error removing saved listing:', err);
      toast.error('Failed to remove listing');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchListings} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <h1>Welcome, {user?.name}!</h1>
      
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>Total Purchases</h3>
          <p>{stats.totalPurchases}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Saved Items</h3>
          <p>{stats.savedItems}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Active Orders</h3>
          <p>{stats.activeOrders}</p>
        </div>
      </div>

      <section className={styles.recentListings}>
        <h2>Recent Listings</h2>
        <div className={styles.listingsGrid}>
          {recentListings.length === 0 ? (
            <p className={styles.noListings}>No recent listings available</p>
          ) : (
            recentListings.map(listing => (
              <div key={listing._id} className={styles.listingCard}>
                <img 
                  src={listing.imageUrl || '/placeholder-image.jpg'} 
                  alt={listing.title}
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                <div className={styles.listingInfo}>
                  <h3>{listing.title}</h3>
                  <p>Price: ${listing.price}</p>
                  <p>Quantity: {listing.quantity}</p>
                  <p>Seller: {listing.seller?.name}</p>
                  <div className={styles.actions}>
                    <Link to={`/listings/${listing._id}`} className={styles.viewButton}>
                      View Details
                    </Link>
                    <button
                      className={styles.saveButton}
                      onClick={() => handleSave(listing._id)}
                      disabled={savedListings.some(saved => saved._id === listing._id)}
                    >
                      {savedListings.some(saved => saved._id === listing._id) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className={styles.savedListings}>
        <h2>Saved Listings</h2>
        <div className={styles.listingsGrid}>
          {savedListings.length === 0 ? (
            <p className={styles.noListings}>No saved listings yet</p>
          ) : (
            savedListings.map(listing => (
              <div key={listing._id} className={styles.listingCard}>
                <img 
                  src={listing.imageUrl || '/placeholder-image.jpg'} 
                  alt={listing.title}
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                <div className={styles.listingInfo}>
                  <h3>{listing.title}</h3>
                  <p>Price: ${listing.price}</p>
                  <p>Quantity: {listing.quantity}</p>
                  <p>Seller: {listing.seller?.name}</p>
                  <div className={styles.actions}>
                    <Link to={`/listings/${listing._id}`} className={styles.viewButton}>
                      View Details
                    </Link>
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemoveSaved(listing._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default BuyerDashboard;
