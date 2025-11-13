import React from 'react';
import styles from './ProductDetails.module.css';

const ProductDetails = ({ product, onClose }) => {
    return (
        <div className={styles.detailsModal}>
            <div className={styles.detailsContainer}>
                <div className={styles.modalHeader}>
                    <h3>Product Details: {product.title}</h3>
                    <button onClick={onClose} className={styles.btnClose}>×</button>
                </div>

                <div className={styles.detailsGrid}>
                    <div className={styles.detailCard}>
                        <h4>Basic Information</h4>
                        <p><strong>Title:</strong> {product.title}</p>
                        <p><strong>Description:</strong> {product.description || 'N/A'}</p>
                        <p><strong>Cost:</strong> ${product.cost}</p>
                        <p><strong>Discount:</strong> {product.discount}%</p>
                        <p><strong>Stock:</strong> {product.totalstock}</p>
                        <p><strong>Stock Alarm:</strong> {product.stock_alarm}</p>
                    </div>
                    <div className={styles.detailCard}>
                        <h4>Additional Information</h4>
                        <p><strong>Theme:</strong> {product.theme}</p>
                        <p><strong>Code:</strong> {product.code || 'N/A'}</p>
                        <p><strong>YouTube URL:</strong> {product.youtube_url || 'N/A'}</p>
                        <p><strong>Categories:</strong> {product.categories.map(cat => cat.name).join(', ') || 'N/A'}</p>
                    </div>
                    {product.image && (
                        <div className={styles.detailCard}>
                            <h4>Image</h4>
                            <img src={product.image} alt={product.title} className={styles.productImage} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;