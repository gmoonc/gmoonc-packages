'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EmailChangeInstructions() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setEmail(params.get('email'));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            📧 Troca de Email Solicitada
          </h2>
          <p className="text-xl text-gray-600">
            Processo de segurança ativado
          </p>
        </div>

        {/* Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Coluna Esquerda - Status e Instruções */}
          <div className="space-y-8">
            
            {/* Status Principal */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center justify-center mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-indigo-600"></div>
                <span className="ml-4 text-2xl font-semibold text-gray-900">
                  Aguardando Confirmação dos Emails
                </span>
              </div>
              
              {email && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-4 text-center">
                  <p className="text-lg text-gray-700">
                    Email solicitado: <span className="font-bold text-blue-800">{email}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Instruções Importantes */}
            <div className="bg-yellow-50 border-l-6 border-yellow-500 p-8 rounded-2xl shadow-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-10 w-10 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-yellow-800 mb-4">
                    ⚠️ ATENÇÃO: NÃO TENTE FAZER LOGIN
                  </h3>
                  <div className="text-lg text-yellow-700 space-y-3">
                    <p>
                      <strong>Você receberá 2 emails</strong> (um para cada endereço de email).
                    </p>
                    <p>
                      <strong>Clique no link de confirmação em AMBOS os emails</strong> para efetivar a alteração.
                    </p>
                    <p>
                      <strong>Não tente fazer login</strong> até confirmar os dois links.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Suporte e Ações */}
          <div className="space-y-8">
            
            {/* Contato de Suporte */}
            <div className="bg-blue-50 border-l-6 border-blue-500 p-8 rounded-2xl shadow-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-10 w-10 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.788.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-blue-800 mb-4">
                    Precisa de Ajuda?
                  </h3>
                  <div className="text-lg text-blue-700">
                    <p className="mb-4">
                      Se encontrar algum problema ou não receber os emails:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-lg">
                      <li>Entre em contato: <strong>suporte@goalmoon.com</strong></li>
                      <li>Abra um chamado no sistema de suporte</li>
                      <li>Não tente fazer login antes de resolver o problema</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Ações Disponíveis
              </h3>
              
              <div className="space-y-4">
                <button
                  onClick={() => window.open('mailto:suporte@goalmoon.com?subject=Problema na Troca de Email', '_blank')}
                  className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  📧 Contatar Suporte
                </button>
                
                <Link
                  href="/auth/login"
                  className="w-full flex justify-center py-4 px-6 border border-gray-300 rounded-xl shadow-lg text-lg font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  🔐 Ir para Login
                </Link>
              </div>

              {/* Instrução Final */}
              <div className="mt-8 p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-lg text-gray-700">
                  <strong>Lembre-se:</strong> Só vá para a tela de login após confirmar os dois emails!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout (hidden on desktop) */}
        <div className="lg:hidden mt-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="space-y-4">
              <button
                onClick={() => window.open('mailto:suporte@goalmoon.com?subject=Problema na Troca de Email', '_blank')}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                📧 Contatar Suporte
              </button>
              
              <Link
                href="/auth/login"
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                🔐 Ir para Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
