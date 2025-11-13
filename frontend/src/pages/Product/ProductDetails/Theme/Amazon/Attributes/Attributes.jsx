import React from 'react';
import './Attributes.css';

const Attributes = ({ product }) => {
    const renderProductSpecs = () => {
        if (product.attributes?.length > 0) {
            return product.attributes.map((attr) => (
                <div className="spec-row" key={`spec-${attr.id}`}>
                    <span className="spec-title">{attr.key}</span>
                    <span className="spec-value">{attr.value || 'غير محدد'}</span>
                </div>
            ));
        }
        return <div className="no-specs">لا توجد مواصفات متاحة</div>;
    };

    return (
        <div className="product-specs">
            <h3 className="specs-header">المواصفات</h3>
            {renderProductSpecs()}
        </div>
    );
};

export default Attributes;