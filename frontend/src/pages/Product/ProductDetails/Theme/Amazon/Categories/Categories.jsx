import React from 'react';
import { Link } from 'react-router-dom';
import './Categories.css';
export default function Categories({ product }) {

    if (!product.categories || product.categories.length === 0) {
        return null;
    }

    return (
        <div className="amazon-categories-container">
            <span className="amazon-category-label">التصنيفات:</span>
            {product.categories.map((cat, index) => (
                <React.Fragment key={cat.id}>
                    <Link
                        to={`/category/${cat.name}/${cat.id}`}
                        className="amazon-category-link"
                    >
                        {cat.name}
                    </Link>
                    {index < product.categories.length - 1 && (
                        <span className="amazon-category-separator">, </span>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};