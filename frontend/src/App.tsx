import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useAppDispatch } from '@/store/hooks';
import { fetchCart } from '@/store/slices/cartSlice';
import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import BecomeASeller from '@/pages/BecomeASeller';
import AdminDashboard from '@/pages/AdminDashboard';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import CartPage from '@/pages/CartPage';
import SellerDashboard from '@/pages/SellerDashboard';
import CreateProduct from '@/pages/CreateProduct';
import EditProduct from '@/pages/EditProduct';
import OrderDetail from '@/pages/OrderDetail';
import BuyerOrders from '@/pages/BuyerOrders';
import AuctionDetail from '@/pages/AuctionDetail';
import CreateAuction from '@/pages/CreateAuction';
import BidsPage from '@/pages/BidsPage';
import AboutUs from '@/pages/AboutUs';
import ContactUs from '@/pages/ContactUs';

function CartLoader() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [user, dispatch]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <CartLoader />
      <Router>
        <Routes>
          {/* Public layout with Navbar + Footer */}
          <Route
            path="/"
            element={
              <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Navbar />
                <main className="flex-grow"><Home /></main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/login"
            element={
              <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Navbar />
                <main className="flex-grow"><Login /></main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/register"
            element={
              <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Navbar />
                <main className="flex-grow"><Register /></main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/become-seller"
            element={
              <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Navbar />
                <main className="flex-grow"><BecomeASeller /></main>
                <Footer />
              </div>
            }
          />
          {/* Admin dashboard layout (self-contained sidebar) */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Seller dashboard layout (self-contained sidebar) */}
          <Route
            path="/products"
            element={
              <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Navbar />
                <main className="flex-grow"><Products /></main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/products/:id"
            element={
              <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Navbar />
                <main className="flex-grow"><ProductDetail /></main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/cart"
            element={
              <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Navbar />
                <main className="flex-grow"><CartPage /></main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/orders"
            element={
              <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Navbar />
                <main className="flex-grow"><BuyerOrders /></main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Navbar />
                <main className="flex-grow"><OrderDetail /></main>
                <Footer />
              </div>
            }
          />

          {/* Seller dashboard layout (self-contained sidebar) */}
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/products/new" element={<CreateProduct />} />
          <Route path="/seller/products/:id/edit" element={<EditProduct />} />
          <Route path="/seller/auctions/new" element={<CreateAuction />} />

          {/* Auction detail */}
          <Route
            path="/auctions/:id"
            element={
              <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Navbar />
                <main className="flex-grow"><AuctionDetail /></main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/bids"
            element={
              <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Navbar />
                <main className="flex-grow"><BidsPage /></main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/about"
            element={
              <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Navbar />
                <main className="flex-grow"><AboutUs /></main>
                <Footer />
              </div>
            }
          />
          <Route
            path="/contact"
            element={
              <div className="min-h-screen flex flex-col bg-background text-foreground">
                <Navbar />
                <main className="flex-grow"><ContactUs /></main>
                <Footer />
              </div>
            }
          />
        </Routes>
        </Router>
    </AuthProvider>
  );
}

export default App;
