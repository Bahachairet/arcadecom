import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import BecomeASeller from '@/pages/BecomeASeller';
import AdminDashboard from '@/pages/AdminDashboard';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import SellerDashboard from '@/pages/SellerDashboard';
import CreateProduct from '@/pages/CreateProduct';

function App() {
  return (
    <AuthProvider>
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

          {/* Seller dashboard layout (self-contained sidebar) */}
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/products/new" element={<CreateProduct />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
