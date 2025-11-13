import React, { useEffect, useState } from 'react';
import { MdKeyboardDoubleArrowDown } from "react-icons/md";
import { Link } from 'react-router-dom';
import slugify from 'slugify';
import AxiosInstance from '../../../../Authentication/AxiosInstance';
import './Categories.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [displayedCategories, setDisplayedCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Function to pick 3 random categories
    const getRandomCategories = (categories, count = 3) => {
        const shuffled = [...categories].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, categories.length));
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await AxiosInstance.get('/products/categories/');
                const fetchedCategories = response.data;
                setCategories(fetchedCategories);
                setDisplayedCategories(getRandomCategories(fetchedCategories));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('فشل في تحميل الفئات.');
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Update displayed categories when categories change
    useEffect(() => {
        if (categories.length > 0) {
            setDisplayedCategories(getRandomCategories(categories));
        }
    }, [categories]);

    const formatTitleForUrl = (title) => {
        return slugify(title, {
            lower: true,
            strict: true,
            locale: 'ar',
            trim: true
        });
    };
    return (
        <>
            <section className="categories-section" dir="rtl">
                <h2 className="categories-section-title">استكشف فئاتنا</h2>
                {loading ? (
                    <div className="categories-loading">جارٍ التحميل...</div>
                ) : error ? (
                    <div className="categories-error">{error}</div>
                ) : categories.length === 0 ? (
                    <div className="categories-empty">لا توجد فئات متاحة</div>
                ) : (
                    <>
                        <div className="categories-masonry">
                            {displayedCategories.map((category, index) => (
                                <div
                                    className={`category-item category-item--${index + 1}`}
                                    key={category.id}
                                    style={{ '--index': index }}
                                >
                                    <div className="category-image-container">
                                        {category.image &&
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="category-image"
                                            />}
                                        {category && category.id && (
                                            <Link to={`/category/${formatTitleForUrl(category.name)}/${category?.id}`} className="category-action">
                                                تسوق الآن
                                            </Link>
                                        )}
                                    </div>
                                    <h3 className="category-label">{category.name}</h3>
                                </div>
                            ))}
                        </div>
                        <div className="categories-cta">
                            <Link to="/categories" className="categories-cta-button">
                                <MdKeyboardDoubleArrowDown className="cta-arrow" />
                                عرض المزيد
                            </Link>
                        </div>
                    </>
                )}
            </section>
        </>
    );
};

export default Categories;