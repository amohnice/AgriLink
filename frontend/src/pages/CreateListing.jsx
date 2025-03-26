import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createListing } from "../api/api";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/CreateListing.module.css";

function CreateListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "",
    category: "vegetables",
    location: user?.location || "",
    currency: "KES",
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagePreviews.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    const newImageFiles = [...imageFiles];
    const newImagePreviews = [...imagePreviews];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be less than 5MB');
        return;
      }

      const preview = URL.createObjectURL(file);
      newImageFiles.push(file);
      newImagePreviews.push(preview);

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    }

    setImageFiles(newImageFiles);
    setImagePreviews(newImagePreviews);
    setError('');
  };

  const removeImage = (index) => {
    const newImageFiles = imageFiles.filter((_, i) => i !== index);
    const newImagePreviews = imagePreviews.filter((_, i) => i !== index);
    const newImages = formData.images.filter((_, i) => i !== index);

    setImageFiles(newImageFiles);
    setImagePreviews(newImagePreviews);
    setFormData(prev => ({ ...prev, images: newImages }));

    URL.revokeObjectURL(imagePreviews[index]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const listingData = {
        ...formData,
        seller: user.id,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10)
      };
      
      await createListing(listingData);
      
      // Clean up object URLs
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
      
      navigate("/listings");
    } catch (err) {
      setError(err.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create New Listing</h1>
          <p className={styles.subtitle}>List your agricultural products</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Images (Max 5)
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className={styles.fileInput}
              />
            </label>
            {imagePreviews.length > 0 && (
              <div className={styles.imagePreviews}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} className={styles.imagePreviewContainer}>
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className={styles.imagePreview}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className={styles.removeImage}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className={styles.input}
              required
              placeholder="Enter product title"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.textarea}
              required
              placeholder="Describe your product"
              rows={4}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="price" className={styles.label}>
                Price (KES)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                className={styles.input}
                required
                min="0"
                step="0.01"
                placeholder="Enter price in KES"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="quantity" className={styles.label}>
                Quantity
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                className={styles.input}
                required
                min="1"
                placeholder="Enter quantity"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category" className={styles.label}>
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="grains">Grains</option>
              <option value="dairy">Dairy</option>
              <option value="meat">Meat</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location" className={styles.label}>
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              className={styles.input}
              required
              placeholder="Enter location"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateListing;
