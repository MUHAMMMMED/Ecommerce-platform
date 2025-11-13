import React from 'react';
import { Link } from 'react-router-dom';
import slugify from 'slugify';
import Config from '../../../../../Authentication/config';
import './RelatedProducts.css';

const RelatedProducts = ({ products = [], currency }) => {
    const formatTitleForUrl = (title) => {
        return slugify(title, {
            lower: true,
            strict: true,
            locale: 'ar',
            trim: true
        });
    };

    if (!products.length) return null;

    return (
        <div className="related-wrapper">
            <div className="related-header">
                <div className="line" />
                <h2 className="related-title">منتجات ذات صلة</h2>
                <div className="line" />
            </div>

            <div className="related-products">
                {products.map((product) => (
                    <div className="rp-card" key={product.id}>
                        <div className="rp-image-wrapper">
                            <Link to={`/products/${formatTitleForUrl(product.title)}/${product.id}`}>
                                <img
                                    src={`${Config.baseURL}${product.image}`}
                                    alt={product.title}
                                    className="rp-image"
                                />
                            </Link>
                        </div>

                        <div className="rp-details">
                            <h3 className="rp-name">{product.title}</h3>
                            <div className="rp-bottom">
                                <div className="rp-price-wrapper">
                                    {product.discount > 0 ? (
                                        <>
                                            <span className="rp-old-price">
                                                {parseFloat(product.base_price).toLocaleString()} {product.currency}
                                            </span>
                                            <span className="rp-price">
                                                {(product.base_price * (1 - product.discount / 100)).toFixed(2)} {product.currency}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="rp-price">
                                            {parseFloat(product.base_price).toLocaleString()} {product.currency}
                                        </span>
                                    )}
                                </div>

                                <Link
                                    to={`/products/${formatTitleForUrl(product.title)}/${product.id}`}
                                    className="rp-more"
                                >
                                    عرض المزيد
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;