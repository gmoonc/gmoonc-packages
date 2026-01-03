import NotificationsManager from '@/components/NotificationsManager';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function NotificacoesPage() {
  return (
    <ProtectedRoute requiredRole="administrador" requiredModule="notificacoes">
      <NotificationsManager />
    </ProtectedRoute>
  );
}
