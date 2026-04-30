import { BrowserRouter, Route } from "react-router-dom"
import { Routes } from "react-router"
import HomePage from "@/pages/HomePage"
import ReaderPage from "@/pages/ReaderPage"
import StoryDetailPage from "@/pages/StoryDetailPage"
import NotFoundPage from "@/pages/NotFoundPage"

export default function App() {
  return (
    <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/truyen/:slug" element={<StoryDetailPage />} />
          <Route path="/doc-truyen/:slug/:chapter" element={<ReaderPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
    </BrowserRouter>
  )
}