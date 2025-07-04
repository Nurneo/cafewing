import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FuzzyTextDemo } from '../ui/fuzzy-text-demo';
import { Button } from '../ui/Button';
import { Home, ArrowLeft, Coffee, AlertTriangle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Log 404 page access for debugging
    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'Asia/Dhaka',
      hour12: false 
    });
    console.log(`[${timestamp} +06] 404 Page accessed for path: ${location.pathname}`);
  }, [location.pathname]);

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // If no history, go to dashboard
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #00FFFF 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, #1F51FF 0%, transparent 50%),
                           radial-gradient(circle at 50% 50%, #00FF7F 0%, transparent 50%)`
        }} />
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-8 fade-in">
          <div className="p-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-neon hover-lift">
            <Coffee className="text-black" size={48} />
          </div>
        </div>

        {/* Fuzzy 404 Text */}
        <div className="mb-8 fade-in stagger-1">
          <FuzzyTextDemo />
        </div>

        {/* Error Message */}
        <div className="mb-12 fade-in stagger-2">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight text-heading">
            {t('errors.pageNotFound')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed text-subheading">
            {t('errors.pageNotFoundDescription')}
          </p>
          
          {/* Debug Info for Development */}
          <div className="mt-6 bg-gray-900 border border-gray-700 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="accent-yellow" size={16} />
              <span className="accent-yellow text-sm font-semibold text-subheading">{t('errors.debugInfo')}</span>
            </div>
            <p className="text-gray-400 text-sm text-caption">
              {t('errors.requestedPath')}: <code className="accent-cyan bg-gray-800 px-1 rounded">{location.pathname}</code>
            </p>
            <p className="text-gray-500 text-xs mt-1 text-caption">
              {t('errors.legitimateError')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in stagger-3">
          <Button
            variant="PRIMARY"
            onClick={handleGoHome}
            className="flex items-center space-x-3 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 gpu-accelerated min-w-[200px]"
          >
            <Home size={20} />
            <span>{t('errors.backToDashboard')}</span>
          </Button>
          
          <Button
            variant="OUTLINE"
            onClick={handleGoBack}
            className="flex items-center space-x-3 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 gpu-accelerated min-w-[200px]"
          >
            <ArrowLeft size={20} />
            <span>{t('errors.goBack')}</span>
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-16 fade-in stagger-4">
          <div className="card-modern p-6 sm:p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4 text-heading">{t('errors.needHelp')}</h3>
            <p className="text-gray-300 mb-6 text-body">
              {t('errors.helpDescription')}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-600 transition-all duration-200">
                <h4 className="font-semibold accent-cyan mb-2 text-subheading">{t('errors.forWaiters')}</h4>
                <p className="text-sm text-gray-400 text-caption">{t('errors.waitersDescription')}</p>
              </div>
              
              <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-green-600 transition-all duration-200">
                <h4 className="font-semibold accent-green mb-2 text-subheading">{t('errors.forAdmins')}</h4>
                <p className="text-sm text-gray-400 text-caption">{t('errors.adminsDescription')}</p>
              </div>
            </div>

            {/* Valid Routes Reference */}
            <div className="mt-6 bg-gray-800 border border-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-2 text-subheading">{t('errors.validRoutes')}</h4>
              <div className="text-xs text-gray-400 space-y-1 text-caption">
                <div><code className="accent-cyan">/</code> - {t('errors.redirectsToDashboard')}</div>
                <div><code className="accent-cyan">/dashboard</code> - {t('errors.mainDashboard')}</div>
                <div><code className="accent-cyan">/login</code> - {t('errors.loginPage')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-cyan-600 rounded-full opacity-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-16 h-16 bg-blue-600 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-20 w-12 h-12 bg-green-600 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
    </div>
  );
};