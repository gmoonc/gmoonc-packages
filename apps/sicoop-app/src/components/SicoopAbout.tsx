'use client';

export default function SicoopAbout() {
  return (
    <div className="sicoop-about-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

      <div className="about-content space-y-6 sm:space-y-8">
        {/* Company Info */}
        <div className="company-info p-6 sm:p-8 rounded-2xl shadow-sm" style={{ backgroundColor: '#ffffff', borderLeft: '4px solid #71b399' }}>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center gap-3" style={{ color: '#374161' }}>
            <img src="/logo.png" alt="Logo Goalmoon" className="w-8 h-8 sm:w-10 sm:h-10" />
            Goalmoon
          </h2>
          <p className="text-base sm:text-lg leading-relaxed" style={{ color: '#3F4A6E' }}>
            A Goalmoon é uma empresa especializada em soluções tecnológicas para gestão empresarial. 
            Desenvolvemos sistemas robustos e intuitivos que atendem às necessidades específicas de 
            diferentes setores e organizações.
          </p>
        </div>

        {/* System Description */}
        <div className="system-description p-6 sm:p-8 rounded-2xl" style={{ backgroundColor: '#eaf0f5', border: '1px solid #dbe2ea' }}>
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2" style={{ color: '#374161' }}>
            <span className="text-2xl sm:text-3xl">🎯</span>
            O que é o Sicoop?
          </h3>
          <p className="text-base sm:text-lg leading-relaxed" style={{ color: '#3F4A6E' }}>
            O <strong style={{ color: '#374161' }}>Sicoop</strong> (Sistema de Controle de Operações) é uma plataforma integrada 
            desenvolvida pela Goalmoon para gerenciar e controlar todas as operações de uma organização. 
            O sistema oferece uma visão holística dos processos empresariais, permitindo controle total 
            sobre diferentes áreas operacionais.
          </p>
        </div>

        {/* Features Grid */}
        <div className="features-grid grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="feature-card p-5 sm:p-6 rounded-2xl shadow-sm transition-all hover:shadow-md" style={{ backgroundColor: '#ffffff', border: '1px solid #dbe2ea' }}>
            <h4 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2" style={{ color: '#374161' }}>
              <span className="text-2xl sm:text-3xl">🔐</span>
              Controle de Acesso
            </h4>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#3F4A6E' }}>
              Sistema de permissões baseado em roles (cliente, funcionário, administrador) 
              que garante segurança e controle de acesso adequado para cada usuário.
            </p>
          </div>

          <div className="feature-card p-5 sm:p-6 rounded-2xl shadow-sm transition-all hover:shadow-md" style={{ backgroundColor: '#ffffff', border: '1px solid #dbe2ea' }}>
            <h4 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2" style={{ color: '#374161' }}>
              <span className="text-2xl sm:text-3xl">📊</span>
              Gestão Financeira
            </h4>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#3F4A6E' }}>
              Controle completo de operações financeiras, incluindo câmbios, contas, 
              moedas e gestão de clientes com histórico detalhado de transações.
            </p>
          </div>

          <div className="feature-card p-5 sm:p-6 rounded-2xl shadow-sm transition-all hover:shadow-md" style={{ backgroundColor: '#ffffff', border: '1px solid #dbe2ea' }}>
            <h4 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2" style={{ color: '#374161' }}>
              <span className="text-2xl sm:text-3xl">👥</span>
              Gestão de Pessoas
            </h4>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#3F4A6E' }}>
              Sistema completo para cadastro e gestão de pessoas, incluindo contatos, 
              telefones, e-mails e localidades para controle organizacional.
            </p>
          </div>

          <div className="feature-card p-5 sm:p-6 rounded-2xl shadow-sm transition-all hover:shadow-md" style={{ backgroundColor: '#ffffff', border: '1px solid #dbe2ea' }}>
            <h4 className="text-lg sm:text-xl font-bold mb-3 flex items-center gap-2" style={{ color: '#374161' }}>
              <span className="text-2xl sm:text-3xl">🛠️</span>
              Suporte Técnico
            </h4>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#3F4A6E' }}>
              Help-desk integrado para gestão de ocorrências e problemas, 
              com sistema de tickets e acompanhamento de resoluções.
            </p>
          </div>
        </div>

        {/* Technical Info */}
        <div className="technical-info p-6 sm:p-8 rounded-2xl" style={{ backgroundColor: '#dbe2ea' }}>
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2" style={{ color: '#374161' }}>
            <span className="text-2xl sm:text-3xl">⚙️</span>
            Tecnologia
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h4 className="font-bold text-base sm:text-lg mb-3" style={{ color: '#374161' }}>Frontend</h4>
              <ul className="space-y-2 text-sm sm:text-base" style={{ color: '#3F4A6E' }}>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#71b399' }}>•</span>
                  <span>Next.js 14 com App Router</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#71b399' }}>•</span>
                  <span>React 18 com TypeScript</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#71b399' }}>•</span>
                  <span>Tailwind CSS para estilização</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#71b399' }}>•</span>
                  <span>Componentes reutilizáveis</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-base sm:text-lg mb-3" style={{ color: '#374161' }}>Backend</h4>
              <ul className="space-y-2 text-sm sm:text-base" style={{ color: '#3F4A6E' }}>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#71b399' }}>•</span>
                  <span>Supabase para autenticação</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#71b399' }}>•</span>
                  <span>PostgreSQL para banco de dados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#71b399' }}>•</span>
                  <span>Row Level Security (RLS)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: '#71b399' }}>•</span>
                  <span>APIs RESTful</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="contact-info p-6 sm:p-8 rounded-2xl" style={{ backgroundColor: '#71b399', color: '#ffffff' }}>
          <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">📞</span>
            Contato
          </h3>
          <p className="text-sm sm:text-base leading-relaxed">
            Para mais informações sobre o Sicoop ou outras soluções da Goalmoon, 
            entre em contato conosco através dos canais disponíveis no sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
