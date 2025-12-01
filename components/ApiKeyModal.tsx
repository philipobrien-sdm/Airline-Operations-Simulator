
import React from 'react';

interface ApiKeyModalProps {
  onClose: () => void;
  reason: 'auth_failure' | 'missing_key';
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose, reason }) => {
  const isAuthFailure = reason === 'auth_failure';

  return (
    <div className="absolute inset-0 bg-gray-900/95 flex items-center justify-center font-sans z-50">
        <div className="w-full max-w-2xl mx-auto bg-gray-800 border-2 border-red-500/50 rounded-lg shadow-2xl shadow-red-500/10 p-8 text-left">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-red-400">Google Maps Configuration Error</h1>
                <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
            </div>
            {isAuthFailure ? (
              <>
                <p className="text-gray-400 mt-4 mb-6 leading-relaxed">
                    The application could not load Google Maps correctly. This is usually due to an issue with the Google Maps API key configuration in your Google Cloud Project.
                </p>
                <div className="bg-gray-900/50 p-4 rounded-md space-y-4">
                    <h2 className="text-lg font-semibold text-yellow-400 border-b border-yellow-400/20 pb-1">How to Fix Authentication Errors</h2>
                    <p className="text-gray-300">
                        To resolve the <code className="bg-gray-700 text-yellow-300 px-1 rounded">ApiProjectMapError</code>, please check the following in your Google Cloud Platform project:
                    </p>
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                        <li>
                            <strong>Enable APIs:</strong> Make sure the "Maps JavaScript API" is enabled for your project in the Google Cloud Console.
                        </li>
                        <li>
                            <strong>Billing:</strong> Verify that billing is enabled for your Google Cloud project. Google Maps Platform products require a billing account.
                        </li>
                        <li>
                            <strong>API Key Restrictions:</strong> If you have restricted your API key (e.g., by HTTP referrer), ensure that the domain you are using for this application is allowed.
                        </li>
                    </ul>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-400 mt-4 mb-6 leading-relaxed">
                    The application cannot load Google Maps because the API key is missing.
                </p>
                <div className="bg-gray-900/50 p-4 rounded-md space-y-4">
                    <h2 className="text-lg font-semibold text-yellow-400 border-b border-yellow-400/20 pb-1">How to Fix a Missing Key</h2>
                    <p className="text-gray-300">
                        Please ensure you have created a valid API key and that it is correctly set up as the <code className="bg-gray-700 text-yellow-300 px-1 rounded">REACT_APP_GOOGLE_MAPS_API_KEY</code> environment variable for this application.
                    </p>
                </div>
              </>
            )}
            <p className="text-xs text-gray-500 pt-3 mt-4 border-t border-gray-700">
                After correcting the configuration, you may need to restart the application or clear your browser cache for the changes to take effect.
            </p>
        </div>
    </div>
  );
};

export default ApiKeyModal;