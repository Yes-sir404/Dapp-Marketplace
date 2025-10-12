import { BrowserRouter, Route, Routes } from "react-router-dom";
import DigitalMarketplace from "../pages/DigitalMarketplace";
import MainPage from "../pages/MainPage";
import DigitalProductListing from "../pages/DigitalProductListing";
import AdminDashboard from "../pages/AdminDashboard";
import SellerDashboard from "../pages/SellerDashboard";
import BuyerDashboard from "../pages/BuyerDashboard";
import ProductDetails from "../pages/ProductDetails";
import EditProduct from "../pages/EditProduct";
// import ScrollToTop from "./ScrollToTop"; // Import the ScrollToTop component

function ReactRouters() {
  return (
    <BrowserRouter>
      {/* <ScrollToTop /> Add ScrollToTop component here */}
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/digital-marketplace" element={<DigitalMarketplace />} />
        <Route
          path="/digital-marketplace-listing"
          element={<DigitalProductListing />}
        />
        <Route path="/product/:productId" element={<ProductDetails />} />
        <Route path="/edit-product/:productId" element={<EditProduct />} />
        <Route path="/moul_shi" element={<AdminDashboard />} />
        <Route path="/seller-dashboard" element={<SellerDashboard />} />
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
        {/* Wildcard for 404 */}
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default ReactRouters;
