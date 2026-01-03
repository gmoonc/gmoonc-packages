import PermissionsManager from '@/components/PermissionsManager';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function PermissoesPage() {
  return (
    <ProtectedRoute requiredRole="administrador">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <PermissionsManager />
        </div>
      </div>
    </ProtectedRoute>
  );
}
