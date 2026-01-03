import MensagensTecnicasManager from '@/components/MensagensTecnicasManager';

export default function MensagensTecnicasPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Título da Página */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            🔧 Gerenciamento Técnico de Mensagens
          </h1>
        </div>
        
        <MensagensTecnicasManager />
      </div>
    </div>
  );
}
