import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced logging with timestamps
const logWithTimestamp = (message: string, data?: any) => {
  const timestamp = new Date().toLocaleString('en-US', { 
    timeZone: 'Asia/Dhaka',
    hour12: false 
  });
  console.log(`[${timestamp} +06] ${message}`, data || '');
};

// Validate environment variables
const validateEnvironment = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    const missingVars = [];
    if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
    if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');
    
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}. ` +
      'Please create a .env file with your Supabase project credentials. ' +
      'You can find these values in your Supabase project settings under API.'
    );
  }

  // Check if values are still placeholder values
  if (supabaseUrl.includes('your_supabase_project_url') || supabaseUrl.includes('your-project-ref')) {
    throw new Error(
      'VITE_SUPABASE_URL is still set to a placeholder value. ' +
      'Please update your .env file with your actual Supabase project URL.'
    );
  }

  if (supabaseAnonKey.includes('your_supabase_anon_key') || supabaseAnonKey.includes('your-anon-key')) {
    throw new Error(
      'VITE_SUPABASE_ANON_KEY is still set to a placeholder value. ' +
      'Please update your .env file with your actual Supabase anonymous key.'
    );
  }

  // Basic URL validation
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error(
      `Invalid VITE_SUPABASE_URL format: ${supabaseUrl}. ` +
      'Please ensure it follows the format: https://your-project-ref.supabase.co'
    );
  }

  logWithTimestamp('Environment variables validated successfully');
};

// Validate environment on module load
validateEnvironment();

// Create Supabase client with WebContainer-compatible configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'restaurant-pos-app'
    },
    // Simplified fetch configuration for WebContainer compatibility
    fetch: (url, options = {}) => {
      logWithTimestamp('Supabase fetch request', { url, method: options.method || 'GET' });
      
      // Use native fetch without aggressive timeouts for WebContainer
      return fetch(url, options).catch(error => {
        logWithTimestamp('Supabase fetch error', {
          url,
          error: error.message,
          name: error.name
        });
        
        // Provide more specific error messages for WebContainer environment
        if (error.message === 'Failed to fetch') {
          throw new Error(
            'Unable to connect to Supabase. This could be due to:\n' +
            '1. Network connectivity issues in WebContainer\n' +
            '2. Supabase project is paused or deleted\n' +
            '3. Invalid Supabase credentials\n' +
            '4. CORS configuration issues\n\n' +
            'Please verify your Supabase project status and credentials in the .env file.'
          );
        }
        
        throw error;
      });
    }
  }
});

logWithTimestamp('Supabase client initialized successfully', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey
});

// Enhanced retry mechanism with exponential backoff
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  context: string = 'operation'
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logWithTimestamp(`${context} - Attempt ${attempt}/${maxRetries} starting`);
      const result = await operation();
      logWithTimestamp(`${context} - Attempt ${attempt} succeeded`);
      return result;
    } catch (error) {
      lastError = error as Error;
      logWithTimestamp(`${context} - Attempt ${attempt} failed`, {
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Don't retry on certain types of errors
      if (error instanceof Error) {
        const nonRetryableErrors = [
          'Invalid API key',
          'Unauthorized',
          'Forbidden',
          'Not Found',
          'Bad Request'
        ];
        
        if (nonRetryableErrors.some(msg => error.message.includes(msg))) {
          logWithTimestamp(`${context} - Non-retryable error detected, stopping retries`);
          break;
        }
      }
      
      // Exponential backoff with jitter (reduced for WebContainer)
      const delay = Math.min(baseDelay * Math.pow(1.5, attempt - 1) + Math.random() * 200, 5000);
      logWithTimestamp(`${context} - Waiting ${Math.round(delay)}ms before retry`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

// Enhanced connection test with WebContainer compatibility
export const testConnection = async (): Promise<boolean> => {
  try {
    logWithTimestamp('Testing Supabase connection...');
    
    // Simplified connectivity test for WebContainer
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      logWithTimestamp('Database access test failed', error);
      return false;
    }
    
    logWithTimestamp('Connection test successful');
    return true;
  } catch (error) {
    logWithTimestamp('Connection test error', error);
    return false;
  }
};

// Helper function to get the current user's ID with retry
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      logWithTimestamp('Auth getSession error', error);
      return null;
    }
    
    if (!session || !session.user) {
      logWithTimestamp('No authenticated user found');
      return null;
    }
    
    logWithTimestamp('User ID retrieved', session.user.id);
    return session.user.id;
  } catch (error) {
    logWithTimestamp('Failed to get current user ID', error);
    return null;
  }
};

// Helper function to check if user is admin with proper error handling
export const isAdmin = async (): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      logWithTimestamp('Cannot check admin status - no user ID');
      return false;
    }

    return await withRetry(async () => {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        logWithTimestamp('Error checking admin status', error);
        throw error;
      }

      const isAdminUser = data?.role === 'admin';
      logWithTimestamp('Admin check result', isAdminUser);
      return isAdminUser;
    }, 2, 500, 'admin check');
  } catch (error) {
    logWithTimestamp('Failed to check admin status after retries', error);
    return false;
  }
};

// Connection state management
export const connectionState = {
  isConnected: false,
  lastConnectionTime: null as Date | null,
  connectionCount: 0,
  lastError: null as Error | null,
  
  markConnected() {
    this.isConnected = true;
    this.lastConnectionTime = new Date();
    this.connectionCount++;
    this.lastError = null;
    logWithTimestamp(`Connection established (count: ${this.connectionCount})`);
  },
  
  markDisconnected(error?: Error) {
    this.isConnected = false;
    this.lastError = error || null;
    logWithTimestamp('Connection marked as disconnected', error);
  },
  
  getStatus() {
    return {
      isConnected: this.isConnected,
      lastConnectionTime: this.lastConnectionTime,
      connectionCount: this.connectionCount,
      lastError: this.lastError
    };
  }
};

// Diagnostic function to help troubleshoot connection issues
export const runDiagnostics = async (): Promise<{
  environmentValid: boolean;
  basicConnectivity: boolean;
  databaseAccess: boolean;
  authWorking: boolean;
  errors: string[];
}> => {
  const results = {
    environmentValid: false,
    basicConnectivity: false,
    databaseAccess: false,
    authWorking: false,
    errors: [] as string[]
  };

  try {
    // Test environment variables
    validateEnvironment();
    results.environmentValid = true;
  } catch (error) {
    results.errors.push(`Environment: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    // Test basic connectivity with simplified approach for WebContainer
    const { error } = await supabase.from('users').select('count').limit(1);
    if (!error) {
      results.basicConnectivity = true;
      results.databaseAccess = true;
    } else {
      results.errors.push(`Database: ${error.message}`);
    }
  } catch (error) {
    results.errors.push(`Database: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    // Test auth
    const { error } = await supabase.auth.getSession();
    if (!error) {
      results.authWorking = true;
    } else {
      results.errors.push(`Auth: ${error.message}`);
    }
  } catch (error) {
    results.errors.push(`Auth: ${error instanceof Error ? error.message : String(error)}`);
  }

  return results;
};

// Initialize connection test on module load with WebContainer compatibility
testConnection().then(success => {
  if (success) {
    connectionState.markConnected();
  } else {
    connectionState.markDisconnected();
    
    // Run diagnostics if initial connection fails
    runDiagnostics().then(diagnostics => {
      logWithTimestamp('Connection diagnostics', diagnostics);
      
      if (diagnostics.errors.length > 0) {
        console.error('Supabase connection issues detected:');
        diagnostics.errors.forEach(error => console.error(`- ${error}`));
        console.error('\nPlease check your Supabase project status and credentials.');
      }
    });
  }
});