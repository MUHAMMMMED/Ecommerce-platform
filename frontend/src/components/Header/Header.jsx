
import React, { useContext, useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import { FiMenu, FiUser, FiX } from 'react-icons/fi';
import { LuLayoutDashboard } from "react-icons/lu";
import { TbShoppingBag } from 'react-icons/tb';
import { Link } from 'react-router-dom';
import AxiosInstance from '../../Authentication/AxiosInstance';
import { CartContext } from '../../Context/CartContext';
import './Header.css';

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [randomCategories, setRandomCategories] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const { cartCount, toggleCart } = useContext(CartContext);

    // Get user from localStorage or sessionStorage
    useEffect(() => {
        const user =
            JSON.parse(localStorage.getItem('user')) ||
            JSON.parse(sessionStorage.getItem('user'));

        if (user) {
            setCurrentUser(user);
        }
    }, []);

    // Fetch all categories from API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await AxiosInstance.get('/products/categories/');
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    // Get 3 random categories each time categories change
    useEffect(() => {
        if (categories.length > 0) {
            const shuffled = [...categories].sort(() => 0.5 - Math.random());
            setRandomCategories(shuffled.slice(0, 3));
        }
    }, [categories, mobileMenuOpen]);

    const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
    const closeMenu = () => setMobileMenuOpen(false);

    return (

        <header className="custom-header">
            <div className="header-inner">

                {/* Logo */}
                <div className="header-logo">
                    <Link to="/" style={{ color: 'inherit', textDecoration: 'none', border: 'none' }}>

                        {/* <img
                            src=""
                            alt="Logo"
                        />   */}

                        <h2>ALTAUREA</h2></Link>
                </div>

                {/* Navigation Links */}
                <nav className={`header-nav ${mobileMenuOpen ? 'active' : ''}`}>
                    <ul>
                        <li><Link to="/" onClick={closeMenu}>الرئيسية</Link></li>
                        <li><Link to="/categories" onClick={closeMenu}>الفئة</Link></li>
                        {randomCategories.map(category => (
                            <li key={category.id}>
                                <Link to={`/category/${category.name}/${category.id}`} onClick={closeMenu}>
                                    {category.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Right Icons */}
                <div className="header-icons">
                    <div className="icon-btn cart-icon" onClick={toggleCart}>
                        <TbShoppingBag />
                        {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                    </div>

                    <Link to="/favorite">
                        <div className="icon-btn"><FaHeart /></div>
                    </Link>

                    {currentUser ? (
                        <Link to="/dashboard">
                            <div className="icon-btn" title="لوحة التحكم">
                                <LuLayoutDashboard />
                            </div>
                        </Link>
                    ) : (
                        <Link to="/login">
                            <div className="icon-btn" title="تسجيل الدخول">
                                <FiUser />
                            </div>
                        </Link>
                    )}
                </div>

                {/* Mobile Toggle */}
                <div className="menu-toggle" onClick={toggleMenu}>
                    {mobileMenuOpen ? <FiX /> : <FiMenu />}
                </div>
            </div>
        </header>
    );
};

export default Header;