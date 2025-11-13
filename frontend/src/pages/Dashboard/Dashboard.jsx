

import React, { useEffect, useState } from 'react';
import {
    FaBox, FaCog, FaImages, FaShippingFast, FaShoppingCart, FaTags
} from 'react-icons/fa';
import { FaUserTie } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import ImageGallery from '../../components/ImageGallery/ImageGallery';
import CategoriesList from '../Categories/Dashboard/CategoriesList';
import Coupons from '../Coupons/Coupons';
import Customers from '../Customers/Customers';
import Orders from '../Orders/Orders';
import Packages from '../Packages/Packages';
import ProductsList from '../Product/Dashboard/ProductsList/ProductsList';
import Settings from '../Settings/Settings';
import Shipping from '../Shipping/Shipping';
import LogoutButton from './components/LogoutButton/LogoutButton';
import Sidebar from './components/Sidebar/Sidebar';

import styles from './Dashboard.module.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeComponent, setActiveComponent] = useState('الطلبات');
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login'); // لو مفيش توكن يرجعه لصفحة اللوجين
        }
    }, [navigate]);

    const mainMenuItems = [
        { id: 1, name: 'الطلبات', component: 'Orders', icon: <FaShoppingCart size={22} /> },
        { id: 2, name: 'العملاء', component: 'Customers', icon: <FaUserTie size={22} /> },
        { id: 3, name: 'المنتجات', component: 'Products', icon: <FaBox size={22} /> },
        { id: 4, name: 'الفئات', component: 'Categories', icon: <FaTags size={22} /> },
        { id: 5, name: 'التغليف', component: 'Packages', icon: <FaBox size={22} /> },
        { id: 6, name: 'الشحن', component: 'Shipping', icon: <FaShippingFast size={22} /> },
        { id: 8, name: 'كوبونات', component: 'Coupons', icon: <FaCog size={22} /> },
        { id: 9, name: 'معرض الصور', component: 'Gallery', icon: <FaImages size={22} /> },
        { id: 10, name: 'الإعدادات', component: 'Settings', icon: <FaCog size={22} /> },
    ];

    const renderComponent = () => {
        switch (activeComponent) {
            case 'Gallery': return <ImageGallery />;
            case 'Categories': return <CategoriesList />;
            case 'Products': return <ProductsList />;
            case 'Orders': return <Orders />;
            case 'Packages': return <Packages />;
            case 'Shipping': return <Shipping />;
            case 'Settings': return <Settings />;
            case 'Coupons': return <Coupons />;
            case 'Customers': return <Customers />;
            default: return <Orders />;
        }
    };

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarExpanded(true);
                setIsSidebarVisible(true);
            } else if (window.innerWidth >= 768) {
                setIsSidebarExpanded(false);
                setIsSidebarVisible(true);
            } else {
                setIsSidebarExpanded(false);
                setIsSidebarVisible(false);
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <LogoutButton />
            <div className={styles.dashboard}>
                <Sidebar
                    setActiveComponent={setActiveComponent}
                    activeComponent={activeComponent}
                    mainMenuItems={mainMenuItems}
                    isSidebarExpanded={isSidebarExpanded}
                    setIsSidebarExpanded={setIsSidebarExpanded}
                    isSidebarVisible={isSidebarVisible}
                    setIsSidebarVisible={setIsSidebarVisible}
                />
                <div className={`${styles.contentWrapperDynamic} ${isSidebarExpanded ? styles.contentWrapperExpanded : ''}`}>
                    <div className={styles.content}>{renderComponent()}</div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;