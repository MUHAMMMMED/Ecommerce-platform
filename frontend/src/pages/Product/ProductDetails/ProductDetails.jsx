import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import AxiosInstance from '../../../Authentication/AxiosInstance';
import FloatingCart from '../../../components/FloatingCart/FloatingCart';
import Header from '../../../components/Header/Header';
import Loading from '../../../components/Loading/Loading';
import LandingComponent from './components/LandingComponent/LandingComponent';
import RelatedProducts from './components/RelatedProducts/RelatedProducts';
import './ProductDetails.css';
import Amazon from './Theme/Amazon/Amazon';
import Classic from './Theme/Classic/Classic';
import Modern from './Theme/Modern/Modern';
import Simple from './Theme/Simple/Simple';

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await AxiosInstance.get(`/products/product-details/${id}/`);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError('فشل في جلب تفاصيل المنتج');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <div>{error}</div>;
  if (!product) return <div>المنتج غير موجود</div>;



  
  const renderThemeComponent = () => {
    switch (product.theme?.toLowerCase()) {
      case 'simple':
        return <Simple product={product} />;
      case 'amazon':
        return <Amazon product={product} />;
      case 'modern':
        return <Modern product={product} />;
      case 'classic':
        return <Classic product={product} />;
      default:
        return <Simple product={product} />; // fallback
    }
  };

  return (
    <>
      <Header />
      <FloatingCart />

      <div className="details-Product">
        {renderThemeComponent()}
        <LandingComponent components={product?.components} />
        <RelatedProducts products={product?.category_products} currency={product?.currency} />
      </div>
    </>
  );
}

export default ProductDetails;