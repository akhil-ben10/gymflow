import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import AppShell from './layouts/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Landing from './pages/Landing'
import Members from './pages/Members'
import MemberDetails from './pages/MemberDetails'
import Operations from './pages/Operations'
import Settings from './pages/Settings'
import { ForgotPassword, Login, Signup } from './pages/Auth'

export default function App() { return <BrowserRouter><AppProvider><Routes><Route path="/" element={<Landing/>}/><Route path="/login" element={<Login/>}/><Route path="/signup" element={<Signup/>}/><Route path="/forgot-password" element={<ForgotPassword/>}/><Route element={<ProtectedRoute/>}><Route element={<AppShell/>}><Route path="/dashboard" element={<Dashboard/>}/><Route path="/members" element={<Members/>}/><Route path="/members/:id" element={<MemberDetails/>}/><Route path="/add-member" element={<Members/>}/><Route path="/attendance" element={<Operations type="attendance"/>}/><Route path="/plans" element={<Operations type="plans"/>}/><Route path="/subscriptions" element={<Operations type="plans"/>}/><Route path="/payments" element={<Operations type="payments"/>}/><Route path="/reports" element={<Operations type="reports"/>}/><Route path="/staff" element={<Operations type="staff"/>}/><Route path="/settings" element={<Settings/>}/><Route path="/gym-profile" element={<Settings/>}/><Route path="/billing" element={<Settings/>}/></Route></Route><Route path="*" element={<Navigate to="/" replace/>}/></Routes></AppProvider></BrowserRouter> }
