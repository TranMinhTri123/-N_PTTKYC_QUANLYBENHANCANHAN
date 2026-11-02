import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import AccountLayout from '../layouts/AccountLayout';
import AdminLayout from '../layouts/AdminLayout';
import DoctorLayout from '../layouts/DoctorLayout';
import PatientLayout from '../layouts/PatientLayout';

// Guard
import RoleRoute from './RoleRoute';

// Public & Auth Pages
import LandingPage from '../pages/landing/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ActivateAccountPage from '../pages/auth/ActivateAccountPage';
import PublicShareViewPage from '../pages/share/PublicShareViewPage';

// Shared Account Pages
import ProfileSettingsPage from '../pages/account/ProfileSettingsPage';
import ChangePasswordPage from '../pages/account/ChangePasswordPage';
import NotificationsPage from '../pages/account/NotificationsPage';

// Admin Portal Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminPatientsPage from '../pages/admin/AdminPatientsPage';
import AdminCatalogsPage from '../pages/admin/AdminCatalogsPage';
import AdminAuditLogsPage from '../pages/admin/AdminAuditLogsPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';

// Doctor Portal Pages
import DoctorDashboardPage from '../pages/doctor/DoctorDashboardPage';
import DoctorWorkspacePage from '../pages/doctor/DoctorWorkspacePage';
import DoctorRecordCreatePage from '../pages/doctor/DoctorRecordCreatePage';
import DoctorPrescriptionPage from '../pages/doctor/DoctorPrescriptionPage';
import DoctorClinicalReviewPage from '../pages/doctor/DoctorClinicalReviewPage';
import DoctorPatientsPage from '../pages/doctor/DoctorPatientsPage';
import DoctorNotesPage from '../pages/doctor/DoctorNotesPage';
import DoctorAppointmentsPage from '../pages/doctor/DoctorAppointmentsPage';
import DoctorSchedulePage from '../pages/doctor/DoctorSchedulePage';
import DoctorProfilePage from '../pages/doctor/DoctorProfilePage';

// Patient Portal Pages
import PatientDashboardPage from '../pages/patient/PatientDashboardPage';
import PatientRecordsPage from '../pages/patient/PatientRecordsPage';
import PatientRecordDetailPage from '../pages/patient/PatientRecordDetailPage';
import PatientPrescriptionsPage from '../pages/patient/PatientPrescriptionsPage';
import PatientAppointmentsPage from '../pages/patient/PatientAppointmentsPage';
import PatientClinicalPage from '../pages/patient/PatientClinicalPage';
import PatientLinkPage from '../pages/patient/PatientLinkPage';
import PatientProfilesPage from '../pages/patient/PatientProfilesPage';
import PatientAuditLogPage from '../pages/patient/PatientAuditLogPage';

// Error Pages
import Error403 from '../components/Error403';
import Error404 from '../components/Error404';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. TRANG ĐÍCH CÔNG KHAI */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/share/view/:token" element={<PublicShareViewPage />} />

      {/* 2. NHÓM XÁC THỰC (Auth Layout) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/activate-account" element={<ActivateAccountPage />} />
      </Route>

      {/* 3. NHÓM TÀI KHOẢN & BẢO MẬT DÙNG CHUNG (Account Layout) */}
      <Route
        element={
          <RoleRoute>
            <AccountLayout />
          </RoleRoute>
        }
      >
        <Route path="/account/profile" element={<ProfileSettingsPage />} />
        <Route path="/account/change-password" element={<ChangePasswordPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<Navigate to="/account/profile" replace />} />
      </Route>

      {/* 4. PHÂN HỆ QUẢN TRỊ VIÊN (Admin Portal - ROLE_ADMIN) */}
      <Route
        path="/admin"
        element={
          <RoleRoute allowedRoles={['ROLE_ADMIN']}>
            <AdminLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="patients" element={<AdminPatientsPage />} />
        <Route path="catalogs" element={<AdminCatalogsPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="system-settings" element={<AdminSettingsPage />} />
      </Route>

      {/* 5. PHÂN HỆ BÁC SĨ ĐIỀU TRỊ (Doctor Portal - ROLE_DOCTOR hoặc ROLE_ADMIN) */}
      <Route
        path="/doctor"
        element={
          <RoleRoute allowedRoles={['ROLE_DOCTOR', 'ROLE_ADMIN']}>
            <DoctorLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Navigate to="/doctor/workspace" replace />} />
        <Route path="workspace" element={<DoctorWorkspacePage />} />
        <Route path="dashboard" element={<DoctorDashboardPage />} />
        <Route path="records/create" element={<DoctorRecordCreatePage />} />
        <Route path="prescriptions/create" element={<DoctorPrescriptionPage />} />
        <Route path="clinical/review" element={<DoctorClinicalReviewPage />} />
        <Route path="appointments" element={<DoctorAppointmentsPage />} />
        <Route path="schedule" element={<DoctorSchedulePage />} />
        <Route path="patients" element={<DoctorPatientsPage />} />
        <Route path="profile" element={<DoctorProfilePage />} />
        <Route path="notes" element={<DoctorNotesPage />} />
      </Route>

      {/* 6. PHÂN HỆ BỆNH NHÂN (Patient Portal - Cổng Bệnh Nhân) */}
      <Route
        path="/patient"
        element={
          <RoleRoute allowedRoles={['ROLE_USER', 'ROLE_DOCTOR', 'ROLE_ADMIN']}>
            <PatientLayout />
          </RoleRoute>
        }
      >
        <Route index element={<Navigate to="/patient/dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboardPage />} />
        <Route path="link" element={<PatientLinkPage />} />
        <Route path="records" element={<PatientRecordsPage />} />
        <Route path="records/:id" element={<PatientRecordDetailPage />} />
        <Route path="prescriptions" element={<PatientPrescriptionsPage />} />
        <Route path="appointments" element={<PatientAppointmentsPage />} />
        <Route path="clinical" element={<PatientClinicalPage />} />
        <Route path="audit-logs" element={<PatientAuditLogPage />} />

        {/* Quản lý hồ sơ sơ bộ cá nhân & người thân */}
        <Route path="profiles" element={<PatientProfilesPage />} />
        <Route path="profile" element={<Navigate to="/patient/profiles" replace />} />
        <Route path="records/create" element={<Navigate to="/patient/records" replace />} />
        <Route path="profiles/:id" element={<Navigate to="/patient/profiles" replace />} />
        <Route path="metrics" element={<Navigate to="/patient/dashboard" replace />} />
        <Route path="shares" element={<Navigate to="/patient/dashboard" replace />} />
      </Route>

      {/* CHUYỂN HƯỚNG TƯƠNG THÍCH ĐƯỜNG DẪN CŨ VÀO PATIENT PORTAL */}
      <Route path="/dashboard" element={<Navigate to="/patient/dashboard" replace />} />
      <Route path="/records" element={<Navigate to="/patient/records" replace />} />
      <Route path="/records/create" element={<Navigate to="/patient/records" replace />} />
      <Route path="/records/:id" element={<Navigate to="/patient/records/:id" replace />} />
      <Route path="/profiles" element={<Navigate to="/patient/profiles" replace />} />
      <Route path="/profile" element={<Navigate to="/patient/profiles" replace />} />
      <Route path="/prescriptions" element={<Navigate to="/patient/prescriptions" replace />} />
      <Route path="/appointments" element={<Navigate to="/patient/appointments" replace />} />
      <Route path="/clinical" element={<Navigate to="/patient/clinical" replace />} />

      {/* 7. TRANG LỖI */}
      <Route path="/403" element={<Error403 />} />
      <Route path="/404" element={<Error404 />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
  );
};

export default AppRoutes;
