import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Lock, AlertCircle, Key } from 'lucide-react';

// Code to user credentials mapping
const CODE_MAPPING = {
  '123456': {
    email: 'player1@themis.cafe',
    password: 'player1',
    role: 'waiter' as const,
    name: 'Player 1'
  },
  '654321': {
    email: 'player2@themis.cafe', 
    password: 'player2',
    role: 'waiter' as const,
    name: 'Player 2'
  },
  '987654': {
    email: 'admin@themis.cafe',
    password: 'admin123',
    role: 'admin' as const,
    name: 'Administrator'
  }
};

export const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!code.trim()) {
      setError(t('auth.codeRequired'));
      setIsSubmitting(false);
      return;
    }

    // Check if the code exists in our mapping
    const userCredentials = CODE_MAPPING[code as keyof typeof CODE_MAPPING];
    
    if (!userCredentials) {
      setError(t('auth.invalidCode'));
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Code-based login attempt:', { code, userInfo: userCredentials.name, role: userCredentials.role });
      
      // Use the mapped credentials to sign in via Supabase
      const success = await login(userCredentials.email, userCredentials.password, userCredentials.role);
      
      if (!success) {
        setError(t('auth.invalidCredentials'));
      }
    } catch (error) {
      console.error('Code-based login error:', error);
      setError(t('auth.unexpectedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormDisabled = isLoading || isSubmitting;

  // Quick access function for development
  const handleQuickCode = (quickCode: string) => {
    if (!isFormDisabled) {
      setCode(quickCode);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 fade-in">
        <div className="text-center space-section">
          <div className="flex justify-center mb-8">
            {/* Logo */}
            <div className="relative group">
              <img 
                src="https://i.ibb.co/fz4jksJz/image.jpg" 
                alt="Themis Logo" 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shadow-neon hover-lift object-cover border-2 border-gray-700 group-hover:border-cyan-400 transition-all duration-300"
                style={{
                  filter: 'brightness(1.1) contrast(1.1)',
                  imageRendering: 'crisp-edges'
                }}
              />
              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          </div>
          <h2 className="text-display text-white tracking-tight text-heading">
            Themis
          </h2>
          <p className="mt-4 text-subtitle text-gray-300 font-medium text-subheading">
            Café Order Assistant
          </p>
        </div>

        {/* Code-Based Login Form */}
        <form className="space-y-8 space-component" onSubmit={handleSubmit}>
          <div className="card-modern space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-white mb-2 text-subheading">
                {t('auth.enterCode')}
              </h3>
              <p className="text-gray-400 text-sm text-caption">
                {t('auth.codeInstructions')}
              </p>
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-semibold text-white mb-3 text-subheading">
                {t('auth.accessCode')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none z-10">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full pl-16 pr-6 py-4 bg-gray-900 border-2 border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-200 font-inter text-base min-h-[48px] text-center text-lg font-mono tracking-widest"
                  placeholder={t('auth.codePlaceholder')}
                  disabled={isFormDisabled}
                  maxLength={6}
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-700/50 text-red-300 px-6 py-4 rounded-lg text-sm font-medium flex items-center space-x-3">
                <AlertCircle size={18} />
                <span className="text-body">{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="PRIMARY"
              className="btn-large"
              disabled={isFormDisabled}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('auth.signingIn')}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Lock size={18} />
                  <span>{t('auth.login')}</span>
                </div>
              )}
            </Button>
          </div>

          {/* Development Quick Access */}
          <div className="card-modern space-y-4">
            <div className="text-center">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 text-subheading">
                {t('auth.quickAccess')}
              </h3>
              <p className="text-xs text-gray-500 mb-4 text-caption">
                {t('auth.devMode')}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => handleQuickCode('123456')}
                disabled={isFormDisabled}
                className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-left hover:bg-gray-700 hover:border-cyan-400 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white text-subheading group-hover:text-cyan-400 transition-colors">
                      {t('auth.player1Waiter')}
                    </div>
                    <div className="text-xs text-gray-400 text-caption">
                      {t('auth.accessWaiterDashboard')}
                    </div>
                  </div>
                  <div className="text-lg font-mono text-cyan-400 font-bold">
                    123456
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickCode('654321')}
                disabled={isFormDisabled}
                className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-left hover:bg-gray-700 hover:border-cyan-400 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white text-subheading group-hover:text-cyan-400 transition-colors">
                      {t('auth.player2Waiter')}
                    </div>
                    <div className="text-xs text-gray-400 text-caption">
                      {t('auth.alternativeWaiterAccount')}
                    </div>
                  </div>
                  <div className="text-lg font-mono text-cyan-400 font-bold">
                    654321
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickCode('987654')}
                disabled={isFormDisabled}
                className="w-full p-4 bg-gray-800 border border-gray-600 rounded-lg text-left hover:bg-gray-700 hover:border-green-400 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white text-subheading group-hover:text-green-400 transition-colors">
                      Administrator
                    </div>
                    <div className="text-xs text-gray-400 text-caption">
                      {t('auth.fullAdminAccess')}
                    </div>
                  </div>
                  <div className="text-lg font-mono text-green-400 font-bold">
                    987654
                  </div>
                </div>
              </button>
            </div>

            <div className="text-center pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500 text-caption">
                {t('auth.usingSupabaseAuth')}
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};