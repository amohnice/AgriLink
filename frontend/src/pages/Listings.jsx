import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchListings } from "../api/api";
import styles from "../styles/Listings.module.css";
import componentStyles from "../styles/components.module.css";

function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const { user } = useAuth();

  const isFarmer = user?.role === 'farmer';

  const fetchListingsData = async () => {
    try {
      const data = await fetchListings();
      setListings(data);
    } catch (err) {
      setError("Failed to fetch listings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListingsData();
  }, []);

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !category || listing.category === category;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={`${styles.header} flex items-center justify-center`}>
          <div className={componentStyles.spinner}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={componentStyles.alert + ' ' + componentStyles.alertError}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Browse Listings</h1>
        <p className={styles.subtitle}>
          Find fresh produce and agricultural products from local farmers
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Search listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={componentStyles.input}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={componentStyles.select}
          >
            <option value="">All Categories</option>
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="grains">Grains</option>
            <option value="dairy">Dairy</option>
            <option value="meat">Meat</option>
            <option value="other">Other</option>
          </select>
        </div>

        {filteredListings.length === 0 ? (
          <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>No listings found</h2>
            <p className={styles.emptyText}>
              Try adjusting your search or filters to find what you're looking for.
            </p>
            {isFarmer && (
              <Link to="/create-listing" className={componentStyles.buttonPrimary}>
                Create a new listing
              </Link>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredListings.map((listing) => (
              <div key={listing._id} className={`${styles.card} ${componentStyles.card}`}>
                <img
                  src={listing.images?.[0] || "https://placehold.co/300x200"}
                  alt={listing.title}
                  className={styles.image}
                />
                <div className={styles.content}>
                  <h2 className={styles.title}>{listing.title}</h2>
                  <p className={styles.description}>{listing.description}</p>
                  <div className={styles.details}>
                    <span className={styles.price}>
                      KES {listing.price.toLocaleString()}
                    </span>
                    <span className={styles.quantity}>
                      Qty: {listing.quantity}
                    </span>
                    <span className={styles.location}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                      </svg>
                      {listing.location}
                    </span>
                  </div>
                  <div className={styles.footer}>
                    <span className={styles.seller}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {listing.seller?.name || "Unknown Seller"}
                    </span>
                    <Link 
                      to={`/listings/${listing._id}`} 
                      className={componentStyles.buttonSecondary}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
            </div>
          ))}
        </div>
      )}

        {isFarmer && (
          <Link to="/create-listing" className={styles.createButton}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create New Listing
          </Link>
        )}
      </div>
    </div>
  );
}

export default Listings;
