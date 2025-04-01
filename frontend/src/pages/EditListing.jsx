import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchListings, updateListing } from '../api/api';
import styles from '../styles/CreateListing.module.css';

function EditListing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    quantity: '',
    unit: '',
    category: '',
    location: '',
    images: []
  });
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
        } else if (found.seller._id !== user._id) {
          setError('You can only edit your own listings');
        } else {
          setListing(found);
          setFormData({
            title: found.title,
            description: found.description,
            price: found.price,
            quantity: found.quantity,
            unit: found.unit,
            category: found.category,
            location: found.location,
            images: found.images || []
          });
        }
      } catch (err) {
        setError('Failed to fetch listing details');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, user._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const imageUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format the data before sending
      const formattedData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
        unit: formData.unit,
        category: formData.category,
        location: formData.location,
        currency: 'KES',
        images: formData.images,
        seller: user._id,
        _id: id // Include the listing ID in the data
      };

      console.log('Submitting update with data:', formattedData);
      console.log('Listing ID:', id);
      console.log('User ID:', user._id);

      await updateListing(id, formattedData);
      navigate(`/listings/${id}`);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      setError(err.message || 'Failed to update listing');
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
          <button onClick={() => navigate('/listings')} className={styles.button}>
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Edit Listing</h1>
        <button onClick={() => navigate(`/listings/${id}`)} className={styles.backButton}>
          ← Back to Listing
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="price">Price (KES)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="unit">Unit</label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              required
            >
              <option value="">Select unit</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="g">Grams (g)</option>
              <option value="l">Liters (L)</option>
              <option value="ml">Milliliters (mL)</option>
              <option value="piece">Piece</option>
              <option value="bundle">Bundle</option>
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="grains">Grains</option>
              <option value="dairy">Dairy</option>
              <option value="meat">Meat</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="images">Images</label>
          <input
            type="file"
            id="images"
            name="images"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
          {formData.images.length > 0 && (
            <div className={styles.imagePreview}>
              {formData.images.map((image, index) => (
                <div key={index} className={styles.imageContainer}>
                  <img src={image} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index)
                      }));
                    }}
                    className={styles.removeImage}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>
            Update Listing
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditListing; 