import React from 'react'
import { Routes, Route } from 'react-router-dom'
import DoctorSignup from './Components/AuthControlls/DoctorSignup'
import AdminControls from './Components/AuthControlls/AdminSignup'
import UserSignup from './Components/AuthControlls/PatientSignup'
import Navbar from './Components/Common/Navbar'
import HospitalList from './Components/Hospitals/HospitalList'
import AdminDashboard from './Components/Dashboards/AdminDashboard/AdminDashboard'
import DoctorDashboard from './Components/Dashboards/DoctorDashboard/DoctorDashboard'
import PatientDashboard from './Components/Dashboards/PatientDashBoard/PatientDashboard'
import DocorLogin from './Components/AuthControlls/DocorLogin'
import Home from './Components/Home/Home'
import AdminLogin from './Components/AuthControlls/AdminLogin'
import AdminSignup from './Components/AuthControlls/AdminSignup'
import UserLogin from './Components/AuthControlls/PatientLogin'
import About from './Components/Common/About'
import Contact from './Components/Common/Contact'
import PatientLogin from './Components/AuthControlls/PatientLogin'
import PatientSignup from './Components/AuthControlls/PatientSignup'

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* General Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />

        {/* Admin Routes */}
        <Route path='/admin/signup' element={<AdminSignup />} />
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path='/admin/dashboard' element={<AdminDashboard />} />

        {/* Doctor Routes */}
        <Route path='/doctor/signup' element={<DoctorSignup />} />
        <Route path='/doctor/signin' element={<DocorLogin />} />
        <Route path='/doctor/dashboard' element={<DoctorDashboard />} />

        {/* Patient Routes */}
        <Route path='/patient/signup' element={<PatientSignup />} />
        <Route path='/patient/signin' element={<PatientLogin />} />
        <Route path='/patient/dashboard' element={<PatientDashboard />} />
      </Routes>

    </>
  )
}

export default App