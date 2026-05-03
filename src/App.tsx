import { BrowserRouter, Route } from "react-router-dom"
import { Routes } from "react-router"
import HomePage from "@/pages/HomePage"
import ReaderPage from "@/pages/ReaderPage"
import StoryDetailPage from "@/pages/StoryDetailPage"
import NotFoundPage from "@/pages/NotFoundPage"
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminContentPage from '@/pages/admin/AdminContentPage'
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage'
import AdminAdsPage from '@/pages/admin/AdminAdsPage'
import AdminAIPage from '@/pages/admin/AdminAIPage'
import AdminEditStoryPage from "@/pages/AdminEditStoryPage"
import LoginPage from "@/pages/LoginPage"
import AdminCreateStoryPage from '@/pages/admin/AdminCreateStoryPage'
import AdminCreateChapterPage from '@/pages/admin/AdminCreateChapterPage'
import AdminCommentsPage from '@/pages/admin/AdminCommentsPage'
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage'
import AIFactoryPage from '@/pages/admin/AIFactoryPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/truyen/:slug" element={<StoryDetailPage />} />

        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/content" element={<AdminContentPage />} />
        <Route path="/admin/content/new" element={<AdminCreateStoryPage />} />
        <Route path="/admin/content/chapters/new" element={<AdminCreateChapterPage />} />
        <Route path="/admin/content/categories" element={<AdminCategoriesPage />} />
        <Route path="/admin/content/comments" element={<AdminCommentsPage />} />
        <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
        <Route path="/admin/ads" element={<AdminAdsPage />} />
        <Route path="/admin/ai-writer" element={<AdminAIPage />} />
        <Route path="/admin/ai-factory" element={<AIFactoryPage />} />

        <Route path="/admin/stories/:id/edit" element={<AdminEditStoryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/doc-truyen/:slug/:chapter" element={<ReaderPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}