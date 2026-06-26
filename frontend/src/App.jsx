import { Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/layouts/AppLayout";
import HomeFeed from "@/pages/HomeFeed";
import Messages from "@/pages/Messages";
import Groups from "@/pages/Groups";
import Circles from "@/pages/Circles";
import CircleRoom from "@/pages/CircleRoom";
import Confessions from "@/pages/Confessions";
import NotificationsPage from "@/pages/NotificationsPage";
import Profile from "@/pages/Profile";
import SettingsPage from "@/pages/SettingsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/app/messages" replace />} />
          <Route path="home" element={<HomeFeed />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:conversationId" element={<Messages />} />
          <Route path="groups" element={<Groups />} />
          <Route path="groups/:conversationId" element={<Groups />} />
          <Route path="circles" element={<Circles />} />
          <Route path="circles/:circleId" element={<CircleRoom />} />
          <Route path="confessions" element={<Confessions />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
