import React from 'react';
import './Footer.css';

const Footer = () => {

    return (
        <footer className="mobile-center-footer">


            <div className="footer-copyright">
                <p className="copyright-text">
                    &copy; {new Date().getFullYear()}
                    - ALTAUREA -
                    جميع الحقوق محفوظة.
                </p>

            </div>
        </footer>
    );
};

export default Footer;