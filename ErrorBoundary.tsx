import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  timestamp: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      timestamp: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'Asia/Dhaka',
      hour12: false 
    });
    
    return {
      hasError: true,
      error,
      timestamp: `${timestamp} +06`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'Asia/Dhaka',
      hour12: false 
    });
    
    console.error(`[${timestamp} +06] Error Boundary caught an error:`, error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      timestamp: `${timestamp} +06`
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      timestamp: ''
    });
    
    // Reload the page to reset the application state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="card-modern p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-red-900 rounded-full">
                  <AlertCircle className="text-red-400" size={32} />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-4">
                Something went wrong
              </h1>
              
              <p className="text-gray-400 mb-6">
                An unexpected error occurred at {this.state.timestamp}. 
                Please try refreshing the page or contact support if the problem persists.
              </p>
              
              {this.state.error && (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6 text-left">
                  <h3 className="text-sm font-semibold text-red-400 mb-2">Error Details:</h3>
                  <p className="text-xs text-gray-300 font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                <Button
                  variant="PRIMARY"
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <RefreshCw size={16} />
                  <span>Retry</span>
                </Button>
                
                <Button
                  variant="OUTLINE"
                  onClick={() => window.location.href = '/'}
                  className="w-full"
                >
                  Go to Home
                </Button>
              </div>
              
              <div className="mt-6 text-xs text-gray-500">
                Error ID: {Date.now().toString(36)}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}