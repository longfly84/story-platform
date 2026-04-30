import { BrowserRouter, Route } from "react-router-dom"
import { Routes } from "react-router"
import HomePage from "@/pages/HomePage"
import ReaderPage from "@/pages/ReaderPage"
import StoryDetailPage from "@/pages/StoryDetailPage"
import NotFoundPage from "@/pages/NotFoundPage"
import AdminPage from "@/pages/AdminPage"
import LoginPage from "@/pages/LoginPage"

export default function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/truyen/:slug" element={<StoryDetailPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/doc-truyen/:slug/:chapter" element={<ReaderPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
    </BrowserRouter>
  )
}