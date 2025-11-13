// import { useEffect } from 'react';
// import { useTrackEvents } from '../hooks/useTrackEvents';

// const App = () => {
//     const { trackEvent } = useTrackEvents();

//     useEffect(() => {
//         trackEvent('PageView'); // Auto-triggered by initPixels, but can be called manually
//     }, []);

//     return <div>{/* Your app */}</div>;
// };



// const ProductDetail = ({ product }) => {
//     const { trackEvent } = useTrackEvents();

//     const handleViewContent = () => {
//         trackEvent('ViewContent', {
//             id: product.id, // e.g., 'prod1'
//             name: product.name, // e.g., 'Blue Shirt'
//             price: product.price, // e.g., 29.99
//             currency: 'USD',
//             category: product.category || 'General' // e.g., 'Clothing'
//         });
//     };

//     // Trigger on component mount or button click
//     useEffect(() => {
//         handleViewContent();
//     }, []);

//     return <div>{/* Product details */}</div>;
// };



// import { useCartStore } from '../store/cartStore';

// const ProductDetail = ({ product }) => {
//     const { trackEvent } = useTrackEvents();
//     const addToCart = useCartStore((state) => state.addToCart);

//     const handleAddToCart = () => {
//         addToCart(product);
//         trackEvent('AddToCart', {
//             id: product.id, // e.g., 'prod1'
//             name: product.name, // e.g., 'Blue Shirt'
//             price: product.price, // e.g., 29.99
//             currency: 'USD',
//             quantity: 1
//         });
//     };

//     return <button onClick={handleAddToCart}>Add to Cart</button>;
// };



// import { useState } from 'react';

// const Header = () => {
//     const { trackEvent } = useTrackEvents();
//     const [searchQuery, setSearchQuery] = useState('');

//     const handleSearch = () => {
//         if (searchQuery) {
//             trackEvent('Search', {
//                 query: searchQuery // e.g., 'shoes'
//             });
//             // Perform search logic (e.g., filter products)
//         }
//     };

//     return (
//         <div>
//             <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 placeholder="Search products..."
//             />
//             <button onClick={handleSearch}>Search</button>
//         </div>
//     );
// };



// const SubscriptionForm = () => {
//     const { trackEvent } = useTrackEvents();
//     const [email, setEmail] = useState('');

//     const handleSubscribe = (e) => {
//         e.preventDefault();
//         if (email) {
//             trackEvent('CompleteRegistration', {
//                 email: email, // e.g., 'user@example.com'
//                 content_name: 'Newsletter Subscription'
//             });
//             // Call subscription API
//             setEmail('');
//         }
//     };

//     return (
//         <form onSubmit={handleSubscribe}>
//             <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="Enter email"
//                 required
//             />
//             <button type="submit">Subscribe</button>
//         </form>
//     );
// };


// const ContactForm = () => {
//     const { trackEvent } = useTrackEvents();
//     const [email, setEmail] = useState('');

//     const handleLead = (e) => {
//         e.preventDefault();
//         if (email) {
//             trackEvent('Lead', {
//                 email: email, // e.g., 'user@example.com'
//                 content_name: 'Contact Form Submission'
//             });
//             // Submit form to API
//             setEmail('');
//         }
//     };

//     return (
//         <form onSubmit={handleLead}>
//             <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="Enter email"
//                 required
//             />
//             <button type="submit">Submit</button>
//         </form>
//     );
// };







// const CartPage = () => {
//     const { trackEvent } = useTrackEvents();
//     const { cart } = useCartStore();

//     const handleInitiateCheckout = () => {
//         const items = cart.map(item => ({
//             id: item.id, // e.g., 'prod1'
//             name: item.name, // e.g., 'Blue Shirt'
//             price: item.price, // e.g., 29.99
//             currency: 'USD',
//             quantity: item.quantity // e.g., 2
//         }));
//         trackEvent('InitiateCheckout', {
//             items,
//             total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0) // e.g., 59.98
//         });
//         // Redirect to checkout page or API call
//     };

//     return <button onClick={handleInitiateCheckout}>Proceed to Checkout</button>;
// };




// const CheckoutSuccess = ({ orderId }) => {
//     const { trackEvent } = useTrackEvents();
//     const { cart } = useCartStore();

//     const handlePurchase = () => {
//         const items = cart.map(item => ({
//             id: item.id, // e.g., 'prod1'
//             name: item.name, // e.g., 'Blue Shirt'
//             price: item.price, // e.g., 29.99
//             currency: 'USD',
//             quantity: item.quantity // e.g., 2
//         }));
//         trackEvent('Purchase', {
//             items,
//             order_id: orderId, // e.g., 'order123'
//             total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0), // e.g., 59.98
//             currency: 'USD'
//         });
//     };

//     // Trigger on mount or button click
//     useEffect(() => {
//         handlePurchase();
//     }, []);

//     return <div>Thank you for your purchase!</div>;
// };



// const ProductCard = ({ product }) => {
//     const { trackEvent } = useTrackEvents();

//     const handleAddToWishlist = () => {
//         trackEvent('AddToWishlist', {
//             id: product.id, // e.g., 'prod1'
//             name: product.name, // e.g., 'Blue Shirt'
//             price: product.price, // e.g., 29.99
//             currency: 'USD'
//         });
//         // Add to wishlist logic (e.g., API call)
//     };

//     return <button onClick={handleAddToWishlist}>Add to Wishlist</button>;
// };