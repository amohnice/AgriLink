import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchListings } from '../api/api';
import styles from '../styles/ListingDetails.module.css';

function ListingDetails() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const listings = await fetchListings();
        const found = listings.find(l => l._id === id);
        if (!found) {
          setError('Listing not found');
        } else {
          setListing(found);
        }
      } catch (err) {
        setError('Failed to fetch listing details');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>{error || 'Listing not found'}</h2>
          <Link to="/listings" className={styles.button}>Back to Listings</Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === listing.seller?._id;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/listings" className={styles.backButton}>
          ← Back to Listings
        </Link>
        {isOwner && (
          <div className={styles.actions}>
            <Link
              to={`/listings/${listing._id}/edit`}
              className={`${styles.button} ${styles.editButton}`}
            >
              Edit Listing
            </Link>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.imageSection}>
          <img
            src={listing.images?.[0] || "https://placehold.co/600x400"}
            alt={listing.title}
            className={styles.mainImage}
          />
        </div>

        <div className={styles.details}>
          <h1 className={styles.title}>{listing.title}</h1>
          
          <div className={styles.meta}>
            <span className={styles.price}>
              KES {listing.price.toLocaleString()}
            </span>
            <span className={styles.quantity}>
              Quantity: {listing.quantity} {listing.unit}
            </span>
            <span className={`${styles.status} ${styles[listing.status]}`}>
              {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
            </span>
          </div>

          <div className={styles.seller}>
            <h3>Seller Information</h3>
            <p>Name: {listing.seller?.name}</p>
            <p>Location: {listing.location}</p>
          </div>

          <div className={styles.description}>
            <h3>Description</h3>
            <p>{listing.description}</p>
          </div>

          {!isOwner && (
            <div className={styles.contactSection}>
              <Link
                to={`/chat?seller=${listing.seller?._id}`}
                className={`${styles.button} ${styles.contactButton}`}
              >
                Contact Seller
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListingDetails;
