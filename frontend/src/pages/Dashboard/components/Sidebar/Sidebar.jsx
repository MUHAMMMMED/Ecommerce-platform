import React from 'react';
import { FaBars } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = ({
    setActiveComponent,
    activeComponent,
    mainMenuItems,
    isSidebarExpanded,
    setIsSidebarExpanded,
    isSidebarVisible,
    setIsSidebarVisible,
}) => {
    const handleItemClick = (component) => {
        setActiveComponent(component);
    };

    const toggleSidebar = () => {
        if (window.innerWidth <= 767) {
            setIsSidebarVisible(!isSidebarVisible);
        } else {
            setIsSidebarExpanded(!isSidebarExpanded);
        }
    };

    return (
        <>
            {(window.innerWidth <= 767 || !isSidebarExpanded) && (
                <button className={styles.hamburger} onClick={toggleSidebar} aria-label="تبديل الشريط الجانبي">
                    <FaBars />
                </button>
            )}
            <aside
                className={`${styles.sidebar} ${isSidebarVisible || (window.innerWidth >= 1024 && isSidebarExpanded)
                    ? styles.visible
                    : styles.hidden
                    } ${isSidebarExpanded ? styles.expanded : ''}`}
            >
                <Link to="/">
                    <div className={styles.logo}>لوحة التحكم</div></Link>
                <nav className={styles.nav}>
                    {mainMenuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`${styles.navItem} ${activeComponent === item.component ? styles.active : ''}`}
                            onClick={() => handleItemClick(item.component)}
                            aria-label={`الانتقال إلى ${item.name}`}
                        >
                            <span className={styles.icon}>{item.icon}</span>
                            <span className={styles.text}>{item.name}</span>
                        </button>
                    ))}
                </nav>
                {(window.innerWidth >= 768) && (
                    <button className={styles.moreButton} onClick={toggleSidebar} aria-label="توسيع الشريط الجانبي">
                        <FaBars />
                    </button>
                )}
            </aside>
        </>
    );
};

export default Sidebar;