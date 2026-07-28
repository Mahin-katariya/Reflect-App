import { Routes, Route } from 'react-router'
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/DashboardHome';
import TopicPage from './pages/TopicPage';
import TopicCreate from './pages/TopicCreate';
import ProtectedRoutes from './components/ProtectedRoutes';
import PublicProfile from './pages/PublicProfile';

function App() {
  return (
    <Routes>
      <Route path='/register' element={<Register />} />
      <Route path='/login' element={<Login/>} />
      <Route path='/dashboard' element={
        <ProtectedRoutes>
          <Dashboard />
        </ProtectedRoutes>
      }>
        <Route index element={<DashboardHome />} />
        <Route path='new' element={<TopicCreate />} />
        <Route path=':topicId' element={<TopicPage />} />
      </Route>
      <Route path='/profile/:slug' element={<PublicProfile/>} />
    </Routes>
  )
}

export default App;
