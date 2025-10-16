import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "../pages/home/HomePage";
import AboutPage from "../pages/about/AboutPage";
import LoginPage from "../pages/login/LoginPage";
import RegisterPage from "../pages/register/RegisterPage";
import MoviesPage from "../pages/movies/MoviesPage";
import ProfilePage from "../pages/profile/ProfilePage";
import LayoutSamFilms from "../layout/LayoutSamFilms";
import SiteMapPage from "../pages/sitemap/SiteMapPage";
import DashboardLayout from "../layout/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute.tsx";

/**
 * Top-level route configuration for the SamFilms app.
 *
 * @component
 * @returns {JSX.Element} Router with all application routes inside a shared layout.
 * @remarks
 * - Uses `BrowserRouter` for clean URLs (history API).
 * - Wraps public pages with `LayoutSamFilms` (Navbar + Footer).
 * - Wraps authenticated pages with `DashboardLayout` (DashboardNavbar only).
 */
const RoutesSamFilms = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<LayoutSamFilms />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/sobre-nosotros" element={<AboutPage />} />
          <Route path="/inicio-sesion" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/mapa-sitio" element={<SiteMapPage />} />
        </Route>

        {/* Authenticated Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/peliculas" element={
            <ProtectedRoute>
              <MoviesPage />
            </ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default RoutesSamFilms;