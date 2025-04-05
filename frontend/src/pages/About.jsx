import styles from '../styles/About.module.css';

function About() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>About AgriLink</h1>
        <p>Connecting farmers and buyers for a sustainable future</p>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>Our Mission</h2>
          <p>
            AgriLink is dedicated to revolutionizing the agricultural marketplace by creating a direct connection between farmers and buyers. We believe in sustainable farming practices and fair trade, ensuring that both farmers receive fair compensation for their produce and buyers get access to fresh, quality agricultural products.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Our Vision</h2>
          <p>
            We envision a future where agricultural trade is transparent, efficient, and beneficial to all stakeholders. By leveraging technology and fostering direct relationships between farmers and buyers, we aim to create a more sustainable and equitable food system.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Our Values</h2>
          <ul>
            <li>Sustainability: Promoting environmentally conscious farming practices</li>
            <li>Fairness: Ensuring equitable trade between farmers and buyers</li>
            <li>Transparency: Maintaining clear and honest communication</li>
            <li>Innovation: Leveraging technology to improve agricultural trade</li>
            <li>Community: Building strong relationships within the agricultural sector</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Our Impact</h2>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <h3>1000+</h3>
              <p>Active Farmers</p>
            </div>
            <div className={styles.stat}>
              <h3>5000+</h3>
              <p>Registered Buyers</p>
            </div>
            <div className={styles.stat}>
              <h3>10,000+</h3>
              <p>Successful Transactions</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About; 