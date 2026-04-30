import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from "@/pages/HomePage"
import ReaderPage from "@/pages/ReaderPage"
import StoryDetailPage from "@/pages/StoryDetailPage"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/truyen/:slug" element={<StoryDetailPage />} />
        <Route path="/doc-truyen/:slug/:chapter" element={<ReaderPage />} />
      </Routes>
    </BrowserRouter>
  )
}