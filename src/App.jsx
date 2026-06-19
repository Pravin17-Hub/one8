import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import TopNavBar from './components/TopNavBar';
import SideNavBar from './components/SideNavBar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderDetails from './pages/OrderDetails';
import AIShoppingAssistant from './pages/AIShoppingAssistant';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';
import Profile from './pages/Profile';
import OrderHistory from './pages/OrderHistory';
import GroupBuy from './pages/GroupBuy';
import GroupBuyDetails from './pages/GroupBuyDetails';
import Auctions from './pages/Auctions';
import AuctionDetails from './pages/AuctionDetails';
import BudgetBuilder from './pages/BudgetBuilder';
import AboutUs from './pages/AboutUs';
import PartnerProgram from './pages/PartnerProgram';
import ShippingInfo from './pages/ShippingInfo';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';


function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <WishlistProvider>
          <NotificationProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
          <TopNavBar />
          <div className="flex flex-1 pt-[72px] relative w-full max-w-container-max mx-auto">
            <SideNavBar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductListing />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />

              <Route path="/group-buy" element={<GroupBuy />} />
              <Route path="/group-buy/:id" element={<GroupBuyDetails />} />
              <Route path="/auctions" element={<Auctions />} />
              <Route path="/auctions/:id" element={<AuctionDetails />} />
              <Route path="/ai-assistant" element={<AIShoppingAssistant />} />
              <Route path="/budget-builder" element={<BudgetBuilder />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/partner-program" element={<PartnerProgram />} />
              <Route path="/shipping-info" element={<ShippingInfo />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />

              <Route
                path="/seller/dashboard"
                element={
                  <RoleRoute roles={['SELLER', 'ADMIN']}>
                    <SellerDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/seller/products"
                element={
                  <RoleRoute roles={['SELLER', 'ADMIN']}>
                    <SellerDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/seller/orders"
                element={
                  <RoleRoute roles={['SELLER', 'ADMIN']}>
                    <SellerDashboard />
                  </RoleRoute>
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  <RoleRoute roles={['ADMIN']}>
                    <AdminDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <RoleRoute roles={['ADMIN']}>
                    <AdminDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <RoleRoute roles={['ADMIN']}>
                    <AdminDashboard />
                  </RoleRoute>
                }
              />
            </Routes>
          </div>
          <Footer />
        </div>
          </BrowserRouter>
        </NotificationProvider>
      </WishlistProvider>
    </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
