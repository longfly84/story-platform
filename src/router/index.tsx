import { BrowserRouter, Route } from "react-router-dom"
import { Navigate } from "react-router"
import HomePage from "@/pages/HomePage"
import ReaderPage from "@/pages/ReaderPage"
import StoryDetailPage from "@/pages/StoryDetailPage"
import NotFoundPage from "../pages/NotFoundPage"
import ScrollToTop from "@/components/ScrollToTop"
import AdminPage from "@/pages/AdminPage"
import LoginPage from "@/pages/LoginPage"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <>
        <Route path="/" element={<HomePage />} />
        <Route path="/truyen/:slug" element={<StoryDetailPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/doc-truyen/:slug/:chapter" element={<ReaderPage />} />
        <Route
          path="/doc-truyen/:slug"
          element={<Navigate to={`/doc-truyen/${window.location.pathname.split('/')[2]}/1`} replace />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </>
    </BrowserRouter>
  )
}
