// frontend/src/components/dashboard/builditem.jsx
import React, { useState } from 'react';

const BuildItem = ({ build }) => {
  const [showLogs, setShowLogs] = useState(false);

  return (
    <div className="border rounded-lg p-3 bg-gray-100 dark:bg-gray-800 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-semibold text-purple-700 dark:text-purple-400">
            Commit: {build.commitSHA.substring(0, 7)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Status: {build.status === 'success' ? (
              <span className="text-green-600 dark:text-green-400 font-semibold">Success</span>
            ) : (
              <span className="text-red-600 dark:text-red-400 font-semibold">Fail</span>
            )}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(build.timestamp).toLocaleString()}
          </p>
        </div>

        <button
          onClick={() => setShowLogs(!showLogs)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm font-semibold"
        >
          {showLogs ? 'Hide Logs' : 'Show Logs'}
        </button>
      </div>

      {showLogs && (
        <pre className="mt-3 p-3 bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-lg overflow-x-auto text-xs whitespace-pre-wrap">
          {build.logs}
        </pre>
      )}
    </div>
  );
};

export default BuildItem;
