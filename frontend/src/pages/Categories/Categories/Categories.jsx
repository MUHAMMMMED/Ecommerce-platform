import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import slugify from 'slugify';
import AxiosInstance from '../../../Authentication/AxiosInstance';
import FloatingCart from '../../../components/FloatingCart/FloatingCart';
import Footer from '../../../components/Footer/Footer';
import Header from '../../../components/Header/Header';
import './Categories.css';
const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response = await AxiosInstance.get('/products/categories/');
                setCategories(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('فشل في تحميل الفئات. حاول مرة أخرى لاحقًا.');
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);


    const formatTitleForUrl = (title) => {
        return slugify(title, {
            lower: true,
            strict: true,
            locale: 'ar',
            trim: true
        });
    };
    return (<>
        <Header />
        <FloatingCart />
        <div className="categories-container" dir="rtl">
            <h2 className="categories-title">تسوق حسب الفئة</h2>
            {loading ? (
                <div className="categories-loading">جارٍ التحميل...</div>
            ) : error ? (
                <div className="categories-error">{error}</div>
            ) : categories.length === 0 ? (
                <div className="categories-empty">لا توجد فئات متاحة</div>
            ) : (
                <div className="categories-grid">
                    {categories.map((category, index) => (
                        <div className="category-card" key={category.id} style={{ '--index': index }}>
                            <div className="category-image-wrapper">
                                <img
                                    src={category?.image}
                                    alt={category.name}
                                    className="category-image"
                                />

                                {category && category.id && (
                                    <Link to={`/category/${formatTitleForUrl(category?.name)}/${category?.id}`} className="category-button">
                                        تسوق الآن
                                    </Link>
                                )}


                            </div>
                            <div className="category-content">
                                <h3 className="category-name">{category.name}</h3>
                                <p className="category-description">
                                    {category.description || 'اكتشف مجموعتنا الرائعة من المنتجات في هذه الفئة.'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
        <Footer />
    </>
    );
};

export default Categories;