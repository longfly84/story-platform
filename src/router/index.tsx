import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from "@/pages/HomePage"
import ReaderPage from "@/pages/ReaderPage"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/doc-truyen/:slug/chuong-:chapter" element={<ReaderPage />} />
      </Routes>
    </BrowserRouter>
  )
}