import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ProjectPage from './pages/ProjectPage.jsx'
import BlocksPage from './pages/BlocksPage.jsx'
import CreateBlock from './pages/CreateBlock.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="projects" element={<ProjectPage />} />
          <Route path="blocks" element={<BlocksPage />} />
          <Route path="blocks/new" element={<CreateBlock />} />

        </Route>

        {/*
          Pages that should NOT have the sidebar/header/footer
          (e.g. the full-screen canvas editor) go OUTSIDE the layout route:
          <Route path="/projects/:id/canvas" element={<CanvasPage />} />
        */}
      </Routes>
    </BrowserRouter>
  )
}
