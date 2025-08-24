import { BrowserRouter, Route, Routes } from "react-router-dom";
import DigitalMarketplace from "../pages/DigitalMarketplace";
import MainPage from "../pages/MainPage";
import DigitalProductListing from "../pages/DigitalProductListing";
import AdminDashboard from "../pages/AdminDashboard";
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
        <Route path="/admin" element={<AdminDashboard />} />
        {/* Wildcard for 404 */}
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default ReactRouters;
