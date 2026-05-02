import { BrowserRouter, Route } from "react-router-dom"
import { Routes } from "react-router"
import HomePage from "@/pages/HomePage"
import ReaderPage from "@/pages/ReaderPage"
import StoryDetailPage from "@/pages/StoryDetailPage"
import NotFoundPage from "@/pages/NotFoundPage"
// AdminPage kept for backward compatibility but not used directly by routing now
// AdminPage kept for backward compatibility but not used directly by routing now
// import AdminPage from "@/pages/AdminPage"
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminContentPage from '@/pages/admin/AdminContentPage'
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage'
import AdminAdsPage from '@/pages/admin/AdminAdsPage'
import AdminAIPage from '@/pages/admin/AdminAIPage'
import AdminEditStoryPage from "@/pages/AdminEditStoryPage"
import LoginPage from "@/pages/LoginPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/truyen/:slug" element={<StoryDetailPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/content" element={<AdminContentPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/ads" element={<AdminAdsPage />} />
        <Route path="/admin/ai-writer" element={<AdminAIPage />} />
        <Route path="/admin/stories/:id/edit" element={<AdminEditStoryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/doc-truyen/:slug/:chapter" element={<ReaderPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
