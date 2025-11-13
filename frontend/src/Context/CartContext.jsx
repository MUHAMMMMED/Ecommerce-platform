
import React, { createContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AxiosInstance from '../Authentication/AxiosInstance';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [currency, setCurrency] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [cartId, setCartId] = useState(null);

    const toggleCart = () => setIsOpen(prev => !prev);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const res = await AxiosInstance.get('/cart/cart/', { withCredentials: true });
            setCurrency(res.data?.currency);
            setCartId(res.data?.id);

            const fetchedItems = res.data.cart_items.map(item => ({
                id: item.id,
                product_id: item.product.id,
                isNot: item.product.isNot,
                name: item.product.title,
                price: parseFloat(item.discount_price || item.product.base_price || 0),
                quantity: item.quantity,
                image: item.variant?.image || item.product?.image || '',
                stock: item.variant ? item.variant.stock : item.product.totalstock || 1,
                variant: item.variant ? {
                    id: item.variant.id,
                    size: item.variant.size?.name || null,
                    color: item.variant.color ? {
                        name: item.variant.color.name,
                        hex_code: item.variant.color.hex_code || '#000'
                    } : null,
                } : null,
                notes: item.notes.map(note => ({ id: note.id, text: note.note })) || [],
            }));

            setCartItems(fetchedItems);
            setCartCount(fetchedItems.reduce((sum, item) => sum + item.quantity, 0));
        } catch (err) {
            console.error('Error fetching cart:', err);
            toast.error(err.response?.data?.error || 'فشل في جلب بيانات السلة');
        } finally {
            setLoading(false);
        }
    };

    const fetchFavorites = async () => {
        try {
            const res = await AxiosInstance.get('/cart/favorites/', { withCredentials: true });
            setFavorites(res.data.results.map(fav => fav.product.id) || []);
        } catch (err) {
            console.error('Error fetching favorites:', err);
            toast.error('فشل في جلب المفضلة');
        }
    };

    useEffect(() => {
        fetchCart();
        fetchFavorites();
    }, []);

    const addToCart = async ({ product_id, variant_id, quantity, notes = [] }) => {
        try {
            const response = await AxiosInstance.post('/cart/add/', {
                product_id,
                variant_id,
                quantity,
                notes,
            }, {
                headers: { 'Content-Type': 'application/json' },
            }
                , { withCredentials: true }

            )

                ;
            await fetchCart();
            toast.success('تم إضافة المنتج إلى السلة');
            return response.data;
        } catch (err) {
            console.error('Error adding to cart:', err);
            toast.error(err.response?.data?.error || 'فشل في إضافة المنتج إلى السلة');
            throw err;
        }
    };

    const addNote = async (cartItemId, note) => {
        try {
            await AxiosInstance.post(`/cart/add-note/${cartItemId}/`, { note });
            await fetchCart();
            toast.success('تم إضافة الملاحظة');
        } catch (err) {
            console.error('Error adding note:', err);
            toast.error(err.response?.data?.error || 'فشل في إضافة الملاحظة');
            throw err;
        }
    };

    const deleteNote = async (cartItemId, noteId) => {
        try {
            await AxiosInstance.delete(`/cart/delete-note/${cartItemId}/${noteId}/`);
            await fetchCart();
            toast.success('تم حذف الملاحظة');
        } catch (err) {
            console.error('Error deleting note:', err);
            toast.error(err.response?.data?.error || 'فشل في حذف الملاحظة');
            throw err;
        }
    };

    const updateQuantity = async (id, newQuantity) => {
        try {
            const response = await AxiosInstance.put(`/cart/update_quantity/${id}/`, { quantity: newQuantity });
            await fetchCart();
            return response.data;
        } catch (err) {
            console.error('Error updating quantity:', err);
            const errorMessage = err.response?.data?.error || 'فشل في تحديث الكمية';
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const removeFromCart = async (id) => {
        try {
            await AxiosInstance.delete(`/cart/delete-cart-item/${id}/`);
            await fetchCart();
        } catch (err) {
            console.error('Error deleting cart item:', err);
            toast.error(err.response?.data?.error || 'فشل في إزالة المنتج من السلة');
            throw err;
        }
    };

    const addFavorite = async (productId) => {
        try {
            const response = await AxiosInstance.post('/cart/favorites/toggle/', { product_id: productId }, { withCredentials: true });
            const isFavorite = response.data.is_favorite;
            setFavorites(prev => isFavorite ? [...prev, productId] : prev.filter(id => id !== productId));
            toast.success(isFavorite ? 'تم إضافة المنتج إلى المفضلة' : 'تم إزالة المنتج من المفضلة');
            return isFavorite;
        } catch (err) {
            console.error('Error toggling favorite:', err.response?.data || err.message);
            toast.error('فشل في تحديث المفضلة');
            throw err;
        }
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            currency,
            cartCount,
            loading,
            isOpen,
            cartId,
            toggleCart,
            addToCart,
            addNote,
            deleteNote,
            updateQuantity,
            removeFromCart,
            addFavorite,
            favorites,
        }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;





// import axios from 'axios';
// import React, { createContext, useEffect, useState } from 'react';
// import { toast } from 'react-toastify';
// import Config from '../Authentication/config';

// // Create Axios instance for consistent configuration
// const api = axios.create({
//     baseURL: `${Config.baseURL}/api`,
//     withCredentials: true,
//     headers: { 'Content-Type': 'application/json' },
// });

// export const CartContext = createContext();

// export const CartProvider = ({ children }) => {
//     const [cartItems, setCartItems] = useState([]);
//     const [cartCount, setCartCount] = useState(0);
//     const [loading, setLoading] = useState(true);
//     const [isOpen, setIsOpen] = useState(false);
//     const [currency, setCurrency] = useState(null);
//     const [favorites, setFavorites] = useState([]);
//     const [cartId, setCartId] = useState(null);

//     const toggleCart = () => setIsOpen(prev => !prev);

//     const fetchCart = async () => {
//         setLoading(true);
//         try {
//             const res = await api.get('/cart/cart/');
//             console.log('Fetch cart response:', res.data); // Debug response
//             setCurrency(res.data?.currency);
//             setCartId(res.data?.id);
//             const fetchedItems = res.data.cart_items.map(item => ({
//                 id: item.id,
//                 product_id: item.product.id,
//                 isNot: item.product.isNot,
//                 name: item.product.title,
//                 price: parseFloat(item.discount_price || item.product.base_price || 0),
//                 quantity: item.quantity,
//                 image: item.variant?.image,
//                 stock: item.variant ? item.variant.stock : item.product.totalstock || 1,
//                 variant: item.variant
//                     ? {
//                         id: item.variant.id,
//                         size: item.variant.size?.name || null,
//                         color: item.variant.color
//                             ? {
//                                 name: item.variant.color.name,
//                                 hex_code: item.variant.color.hex_code || '#000',
//                             }
//                             : null,
//                     }
//                     : null,
//                 notes: item.notes.map(note => ({ id: note.id, text: note.note })) || [],
//             }));
//             setCartItems(fetchedItems);
//             setCartCount(fetchedItems.reduce((sum, item) => sum + item.quantity, 0));
//         } catch (err) {
//             console.error('Error fetching cart:', err.response || err.message);
//             if (err.response?.status === 401) {
//                 toast.error('Please log in to view your cart');
//             } else {
//                 toast.error(err.response?.data?.error || 'فشل في جلب بيانات السلة');
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchFavorites = async () => {
//         try {
//             const res = await api.get('/cart/favorites/');
//             console.log('Fetch favorites response:', res.data); // Debug response
//             setFavorites(res.data.results.map(fav => fav.product.id) || []);
//         } catch (err) {
//             console.error('Error fetching favorites:', err.response || err.message);
//             if (err.response?.status === 401) {
//                 toast.error('Please log in to view your favorites');
//             } else {
//                 toast.error('فشل في جلب المفضلة');
//             }
//         }
//     };

//     useEffect(() => {
//         fetchCart();
//         fetchFavorites();
//     }, []);

//     const addToCart = async ({ product_id, variant_id, quantity, notes = [] }) => {
//         if (!product_id || quantity < 1) {
//             toast.error('Invalid product or quantity');
//             return;
//         }
//         try {
//             const response = await api.post('/cart/add/', {
//                 product_id,
//                 variant_id,
//                 quantity,
//                 notes,
//             });
//             console.log('Add to cart response:', response.data); // Debug response
//             await fetchCart();
//             toast.success('تم إضافة المنتج إلى السلة');
//             return response.data;
//         } catch (err) {
//             console.error('Error adding to cart:', err.response || err.message);
//             if (err.response?.status === 401) {
//                 toast.error('Please log in to add items to cart');
//                 // Optionally redirect to login: window.location.href = '/login';
//             } else {
//                 toast.error(err.response?.data?.error || 'فشل في إضافة المنتج إلى السلة');
//             }
//             throw err;
//         }
//     };

//     const addNote = async (cartItemId, note) => {
//         if (!cartItemId || !note) {
//             toast.error('Invalid cart item or note');
//             return;
//         }
//         try {
//             await api.post(`/cart/add-note/${cartItemId}/`, { note });
//             await fetchCart();
//             toast.success('تم إضافة الملاحظة');
//         } catch (err) {
//             console.error('Error adding note:', err.response || err.message);
//             if (err.response?.status === 401) {
//                 toast.error('Please log in to add notes');
//             } else {
//                 toast.error(err.response?.data?.error || 'فشل في إضافة الملاحظة');
//             }
//             throw err;
//         }
//     };

//     const deleteNote = async (cartItemId, noteId) => {
//         try {
//             await api.delete(`/cart/delete-note/${cartItemId}/${noteId}/`);
//             await fetchCart();
//             toast.success('تم حذف الملاحظة');
//         } catch (err) {
//             console.error('Error deleting note:', err.response || err.message);
//             if (err.response?.status === 401) {
//                 toast.error('Please log in to delete notes');
//             } else {
//                 toast.error(err.response?.data?.error || 'فشل في حذف الملاحظة');
//             }
//             throw err;
//         }
//     };

//     const updateQuantity = async (id, newQuantity) => {
//         if (newQuantity < 1) {
//             toast.error('Quantity must be at least 1');
//             return;
//         }
//         try {
//             const response = await api.put(`/cart/update_quantity/${id}/`, { quantity: newQuantity });
//             await fetchCart();
//             toast.success('تم تحديث الكمية');
//             return response.data;
//         } catch (err) {
//             console.error('Error updating quantity:', err.response || err.message);
//             if (err.response?.status === 401) {
//                 toast.error('Please log in to update quantity');
//             } else {
//                 toast.error(err.response?.data?.error || 'فشل في تحديث الكمية');
//             }
//             throw new Error(err.response?.data?.error || 'فشل في تحديث الكمية');
//         }
//     };

//     const removeFromCart = async (id) => {
//         try {
//             await api.delete(`/cart/delete-cart-item/${id}/`);
//             await fetchCart();
//             toast.success('تم إزالة المنتج من السلة');
//         } catch (err) {
//             console.error('Error deleting cart item:', err.response || err.message);
//             if (err.response?.status === 401) {
//                 toast.error('Please log in to remove items from cart');
//             } else {
//                 toast.error(err.response?.data?.error || 'فشل في إزالة المنتج من السلة');
//             }
//             throw err;
//         }
//     };

//     const addFavorite = async (productId) => {
//         try {
//             const response = await api.post('/cart/favorites/toggle/', { product_id: productId });
//             const isFavorite = response.data.is_favorite;
//             setFavorites(prev => (isFavorite ? [...prev, productId] : prev.filter(id => id !== productId)));
//             toast.success(isFavorite ? 'تم إضافة المنتج إلى المفضلة' : 'تم إزالة المنتج من المفضلة');
//             return isFavorite;
//         } catch (err) {
//             console.error('Error toggling favorite:', err.response || err.message);
//             if (err.response?.status === 401) {
//                 toast.error('Please log in to manage favorites');
//             } else {
//                 toast.error('فشل في تحديث المفضلة');
//             }
//             throw err;
//         }
//     };

//     return (
//         <CartContext.Provider
//             value={{
//                 cartItems,
//                 currency,
//                 cartCount,
//                 loading,
//                 isOpen,
//                 cartId,
//                 toggleCart,
//                 addToCart,
//                 addNote,
//                 deleteNote,
//                 updateQuantity,
//                 removeFromCart,
//                 addFavorite,
//                 favorites,
//             }}
//         >
//             {children}
//         </CartContext.Provider>
//     );
// };

// export default CartProvider;