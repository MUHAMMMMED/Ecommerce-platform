import React, { useEffect, useState } from 'react';
import FloatingCart from '../../components/FloatingCart/FloatingCart';
// import Footer from '../../components/Footer/Footer';
import AxiosInstance from '../../Authentication/AxiosInstance';
import Header from '../../components/Header/Header';
import Loading from '../../components/Loading/Loading';

import Config from '../../Authentication/config';
import ProductsList from '../Product/ProductsList/ProductsList';
// import Categories from './components/Categories/Categories';

export default function Home() {
    const [home, setHome] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await AxiosInstance.get(`products/settings/`);
            setHome(response.data);
        } catch (err) {
            console.log('Error fetching data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <Loading />;

    return (
        <>
            <Header />
            <FloatingCart />
            {home?.landing_cover &&
                <div>
                    <img width={"100%"} src={`${Config.baseURL}${home?.landing_cover}`} alt={'img'} />
                </div>}
            {/* <Categories /> */}
            <ProductsList />
            {/* <Footer /> */}
        </>
    );
}