import { useState } from 'react';
import styles from '../styles/HelpCenter.module.css';

function HelpCenter() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = {
    general: [
      {
        question: "What is AgriLink?",
        answer: "AgriLink is a platform that connects farmers directly with buyers, facilitating the sale of agricultural products. We provide a marketplace where farmers can list their produce and buyers can purchase directly from them."
      },
      {
        question: "How do I get started?",
        answer: "To get started, you'll need to create an account. Choose whether you're a farmer or a buyer, fill out the registration form, and verify your email. Once registered, you can start listing products (if you're a farmer) or browsing listings (if you're a buyer)."
      },
      {
        question: "Is AgriLink free to use?",
        answer: "Creating an account and browsing listings is free. We charge a small commission on successful transactions to maintain and improve our platform."
      }
    ],
    farmers: [
      {
        question: "How do I list my products?",
        answer: "To list your products, go to your dashboard and click 'Create New Listing'. Fill out the product details, including photos, description, price, and quantity. Make sure to provide accurate information to attract buyers."
      },
      {
        question: "How do I receive payments?",
        answer: "We use M-Pesa for secure payments. When a buyer makes a purchase, the payment will be processed through our secure payment system and transferred to your registered account."
      },
      {
        question: "How do I manage my inventory?",
        answer: "You can manage your inventory through your dashboard. Update quantities, prices, and product status as needed. The system will automatically mark items as sold when purchases are made."
      }
    ],
    buyers: [
      {
        question: "How do I purchase products?",
        answer: "Browse through available listings, select the products you want, and click 'Purchase'. You can use M-Pesa to complete the payment securely."
      },
      {
        question: "How do I contact sellers?",
        answer: "Once you've made a purchase or are interested in a product, you can use our built-in chat system to communicate directly with the seller."
      },
      {
        question: "What if I'm not satisfied with my purchase?",
        answer: "We have a satisfaction guarantee. If you're not satisfied with your purchase, contact our support team within 24 hours of receiving the product, and we'll help resolve the issue."
      }
    ]
  };

  const filteredFaqs = faqs[activeCategory].filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Help Center</h1>
        <p>Find answers to your questions</p>
      </div>

      <div className={styles.search}>
        <input
          type="text"
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.sidebar}>
          <h2>Categories</h2>
          <ul>
            <li>
              <button
                className={`${styles.categoryButton} ${activeCategory === 'general' ? styles.active : ''}`}
                onClick={() => setActiveCategory('general')}
              >
                General
              </button>
            </li>
            <li>
              <button
                className={`${styles.categoryButton} ${activeCategory === 'farmers' ? styles.active : ''}`}
                onClick={() => setActiveCategory('farmers')}
              >
                For Farmers
              </button>
            </li>
            <li>
              <button
                className={`${styles.categoryButton} ${activeCategory === 'buyers' ? styles.active : ''}`}
                onClick={() => setActiveCategory('buyers')}
              >
                For Buyers
              </button>
            </li>
          </ul>
        </div>

        <div className={styles.faqs}>
          <h2>Frequently Asked Questions</h2>
          {filteredFaqs.map((faq, index) => (
            <div key={index} className={styles.faq}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.support}>
        <h2>Still Need Help?</h2>
        <p>Our support team is here to assist you</p>
        <div className={styles.supportOptions}>
          <div className={styles.supportOption}>
            <i className="fas fa-envelope"></i>
            <h3>Email Support</h3>
            <p>support@agrilink.com</p>
          </div>
          <div className={styles.supportOption}>
            <i className="fas fa-phone"></i>
            <h3>Phone Support</h3>
            <p>+1 (555) 123-4567</p>
          </div>
          <div className={styles.supportOption}>
            <i className="fas fa-comments"></i>
            <h3>Live Chat</h3>
            <p>Available 24/7</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpCenter; 