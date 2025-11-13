
import { Route, Routes } from 'react-router-dom';
import Login from './Authentication/Login/Login';
import Success from './components/Success/Success';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Cart/components/Checkout/Checkout';
import Categories from './pages/Categories/Categories/Categories';
import Category from './pages/Categories/Category/Category';
import Dashboard from './pages/Dashboard/Dashboard';
import FavoriteProducts from './pages/FavoriteProducts/FavoriteProducts';
import Home from './pages/Home/Home';
import ProductDetails from './pages/Product/ProductDetails/ProductDetails';
import PixelLoader from './Pixels/PixelLoader';

function App() {


  return (
    <div>
      <PixelLoader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:slug/:id" element={<Category />} />
        <Route path="/products/:slug/:id" element={<ProductDetails />} />
        <Route path="/favorite" element={<FavoriteProducts />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout/:id" element={<Checkout />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </div>
  );
}

export default App;