
import React from 'react';
import ProductDetails from './StaticProductDetails';

export default function Details() {
    const products = [
        {
            id: 1,
            title: 'تيشيرت كلاسيكي بدون خصائص',
            description: 'منتج بسيط لا يحتوي على مقاسات أو ألوان.',
            image: 'https://accesslap.com/wp-content/uploads/2024/12/unnamed-file-7.jpg',
            price: 120,
            variants: [],
            videoLinks: ['https://www.youtube.com/embed/dQw4w9WgXcQ'],
            isNot: true,
            isSize: false,
            isColor: false,
            relatedProducts: [],
        },
        {
            id: 2,
            title: 'تيشيرت بألوان فقط',
            description: 'منتج يحتوي على ألوان فقط بدون مقاسات.',
            image: 'https://vinci-eyewear.com/cdn/shop/files/128.png?v=1737837748&width=1000',
            price: 130,
            variants: [
                {
                    id: 21,
                    color: 'أبيض',
                    hex: '#ffffff',
                    stock: 5,
                    price: 130,
                    image: 'https://accesslap.com/wp-content/uploads/2024/12/unnamed-file-4.jpg',
                },
                {
                    id: 22,
                    color: 'أسود',
                    hex: '#000000',
                    stock: 0,
                    price: 130,
                    image: 'https://accesslap.com/wp-content/uploads/2024/12/0000000000000000000000.jpg',
                },
            ],
            videoLinks: [
                'https://www.youtube.com/embed/9bZkp7q19f0',
                'https://www.youtube.com/embed/tgbNymZ7vqY',
            ],
            isNot: true,
            isSize: true,
            isColor: true,
            relatedProducts: [],
        },
        {
            id: 3,
            title: 'تيشيرت بمقاسات فقط',
            description: 'منتج يحتوي على مقاسات فقط بدون ألوان.',
            image: 'https://accesslap.com/wp-content/uploads/2024/12/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.jpg',
            price: 140,
            variants: [
                {
                    id: 31,
                    size: 'M',
                    stock: 10,
                    price: 140,
                    image: 'https://accesslap.com/wp-content/uploads/2024/12/unnamed-file-5.jpg',
                },
                {
                    id: 32,
                    size: 'L',
                    stock: 0,
                    price: 140,
                    image: 'https://accesslap.com/wp-content/uploads/2024/12/unnamed-file-7.jpg',
                },
            ],
            videoLinks: [],
            isNot: false,
            isSize: true,
            isColor: false,
            relatedProducts: [],
        },
        {
            id: 4,
            title: 'تيشيرت كامل الخصائص',
            description: 'يحتوي على مقاسات وألوان.',
            image: 'https://accesslap.com/wp-content/uploads/2024/12/eeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.jpg',
            price: 150,
            variants: [
                {
                    id: 441,
                    size: 'S',
                    color: 'أبيض',
                    hex: '#ffffff',
                    stock: 8,
                    price: 150,
                    image: 'https://accesslap.com/wp-content/uploads/2024/12/unnamed-file-4.jpg',
                },
                {
                    id: 442,
                    size: 'M',
                    color: 'أبيض',
                    hex: '#ffffff',
                    stock: 5,
                    price: 155,
                    image: 'https://accesslap.com/wp-content/uploads/2024/12/unnamed-file-4.jpg',
                },
                {
                    id: 443,
                    size: 'L',
                    color: 'أبيض',
                    hex: '#ffffff',
                    stock: 0,
                    price: 160,
                    image: 'https://accesslap.com/wp-content/uploads/2024/12/unnamed-file-4.jpg',
                },
                {
                    id: 444,
                    size: 'S',
                    color: 'أحمر',
                    hex: '#ff0000',
                    stock: 7,
                    price: 150,
                    image: 'https://accesslap.com/wp-content/uploads/2024/12/unnamed-file-7.jpg',
                },
                {
                    id: 445,
                    size: 'M',
                    color: 'أحمر',
                    hex: '#ff0000',
                    stock: 2,
                    price: 155,
                    image: 'https://accesslap.com/wp-content/uploads/2024/12/unnamed-file-7.jpg',
                },
                {
                    id: 446,
                    size: 'M',
                    color: 'أسود',
                    hex: '#000000',
                    stock: 3,
                    price: 150,
                    image: 'https://accesslap.com/wp-content/uploads/2024/12/0000000000000000000000.jpg',
                },
                {
                    id: 447,
                    size: 'L',
                    color: 'أسود',
                    hex: '#000000',
                    stock: 5,
                    price: 160,
                    image: 'https://accesslap.com/wp-content/uploads/2024/12/0000000000000000000000.jpg',
                },
            ],
            videoLinks: ['https://www.youtube.com/embed/5NV6Rdv1a3I'],
            isNot: false,
            isSize: true,
            isColor: true,
            relatedProducts: [
                {
                    id: 1,
                    title: 'تيشيرت كلاسيكي بدون خصائص',
                    description: 'منتج بسيط لا يحتوي على مقاسات أو ألوان.',
                    image: 'https://accesslap.com/wp-content/uploads/2024/12/unnamed-file-7.jpg',
                    price: 120,
                    variants: [],
                    videoLinks: ['https://www.youtube.com/embed/dQw4w9WgXcQ'],
                    isNot: false,
                    isSize: false,
                    isColor: false,
                },
                {
                    id: 2,
                    title: 'تيشيرت بألوان فقط',
                    description: 'منتج يحتوي على ألوان فقط بدون مقاسات.',
                    image: 'https://vinci-eyewear.com/cdn/shop/files/128.png?v=1737837748&width=1000',
                    price: 130,
                    variants: [
                        {
                            id: 21,
                            color: 'أبيض',
                            hex: '#ffffff',
                            stock: 5,
                            price: 130,
                            image: 'https://accesslap.com/wp-content/uploads/2024/12/unnamed-file-4.jpg',
                        },
                        {
                            id: 22,
                            color: 'أسود',
                            hex: '#000000',
                            stock: 0,
                            price: 130,
                            image: 'https://accesslap.com/wp-content/uploads/2024/12/0000000000000000000000.jpg',
                        },
                    ],
                    videoLinks: [
                        'https://www.youtube.com/embed/9bZkp7q19f0',
                        'https://www.youtube.com/embed/tgbNymZ7vqY',
                    ],
                    isNot: false,
                    isSize: false,
                    isColor: true,
                },
            ],
        },
    ];

    return (
        <div style={{ display: 'grid', gap: '40px', padding: '20px' }}>
            {products.map((product) => (
                <ProductDetails key={product.id} product={product} allProducts={products} />
            ))}
        </div>
    );
}