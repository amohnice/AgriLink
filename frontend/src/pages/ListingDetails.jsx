import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchListings } from '../api/api';
import { initiateMpesaPayment } from '../api/mpesa';
import styles from '../styles/ListingDetails.module.css';

function ListingDetails() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= listing.quantity) {
      setQuantity(value);
    }
  };

  const calculateTotal = () => {
    return listing.price * quantity;
  };

  const handlePayment = async () => {
    if (!phone) {
      setPaymentMessage("Please enter your M-Pesa phone number");
      return;
    }

    if (quantity <= 0 || quantity > listing.quantity) {
      setPaymentMessage("Invalid quantity selected");
      return;
    }

    setPaymentLoading(true);
    setPaymentMessage('');

    try {
      const totalAmount = calculateTotal();
      const response = await initiateMpesaPayment(phone, totalAmount);
      if (response && response.ResponseCode === "0") {
        setPaymentMessage("Payment request sent. Please check your phone for the M-Pesa prompt.");
      } else {
        setPaymentMessage("Payment initiation failed. Please try again.");
      }
    } catch (error) {
      setPaymentMessage("Failed to process payment. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

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

  const isOwner = user?._id === listing.seller?._id;
  const isBuyer = user?.role === 'buyer';
  const isFarmer = user?.role === 'farmer';

  // Add console logging for debugging
  console.log('User:', user);
  console.log('Listing:', listing);
  console.log('Is Owner:', isOwner);
  console.log('User ID:', user?._id);
  console.log('Seller ID:', listing.seller?._id);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/listings" className={styles.backButton}>
          ← Back to Listings
        </Link>
        {isFarmer && (
          <div className={styles.actions}>
            {isOwner ? (
              <button
                onClick={() => navigate(`/listings/${id}/edit`)}
                className={`${styles.button} ${styles.editButton}`}
              >
                Edit Listing
              </button>
            ) : null}
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

          {!isOwner && user && (
            <div className={styles.actionButtons}>
              {isBuyer ? (
                <>
                  <Link
                    to={`/chat?seller=${listing.seller?._id}`}
                    className={`${styles.button} ${styles.contactButton}`}
                  >
                    Contact Seller
                  </Link>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className={`${styles.button} ${styles.payButton}`}
                  >
                    Pay with M-Pesa
                  </button>
                </>
              ) : isFarmer ? null : (
                <div className={styles.message}>
                  <p>You need a buyer account to purchase or contact the seller.</p>
                </div>
              )}
            </div>
          )}

          {!user && (
            <div className={styles.message}>
              <p>Please <Link to="/login" className={styles.link}>log in</Link> to contact the seller or make a purchase.</p>
            </div>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>M-Pesa Payment</h3>
            
            <div className={styles.inputGroup}>
              <label>Quantity (Available: {listing.quantity})</label>
              <div className={styles.quantityControl}>
                <button 
                  type="button"
                  onClick={() => quantity > 1 && setQuantity(q => q - 1)}
                  className={styles.quantityButton}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={listing.quantity}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className={styles.quantityInput}
                />
                <button 
                  type="button"
                  onClick={() => quantity < listing.quantity && setQuantity(q => q + 1)}
                  className={styles.quantityButton}
                >
                  +
                </button>
              </div>
            </div>

            <div className={styles.priceBreakdown}>
              <div className={styles.priceRow}>
                <span>Price per item:</span>
                <span>KES {listing.price.toLocaleString()}</span>
              </div>
              <div className={styles.priceRow}>
                <span>Quantity:</span>
                <span>{quantity}</span>
              </div>
              <div className={`${styles.priceRow} ${styles.totalRow}`}>
                <span>Total Amount:</span>
                <span>KES {calculateTotal().toLocaleString()}</span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>M-Pesa Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your M-Pesa number"
                className={styles.input}
              />
            </div>

            {paymentMessage && (
              <p className={`${styles.message} ${paymentMessage.includes('failed') ? styles.error : styles.success}`}>
                {paymentMessage}
              </p>
            )}

            <div className={styles.modalButtons}>
              <button
                onClick={handlePayment}
                disabled={paymentLoading || quantity <= 0 || quantity > listing.quantity}
                className={`${styles.button} ${styles.payButton}`}
              >
                {paymentLoading ? "Processing..." : `Pay KES ${calculateTotal().toLocaleString()}`}
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className={`${styles.button} ${styles.cancelButton}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListingDetails;
