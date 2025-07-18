import React from 'react';

const PhageClusterInfoModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  const { phagesInAllClusters, clusters } = data || {};

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start pt-20 z-50 overflow-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-gray-900 rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-auto text-white"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Phage & Cluster Analysis</h2>

        <button
          className="btn btn-sm btn-outline absolute top-4 right-4"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Phages Found in All Clusters</h3>
          {phagesInAllClusters.length > 0 ? (
            <ul className="list-disc list-inside">
              {phagesInAllClusters.map(phage => (
                <li key={phage}>{phage}</li>
              ))}
            </ul>
          ) : (
            <p className="italic text-gray-400">No common phages found across all clusters.</p>
          )}
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4">Phages per Cluster</h3>
          {Object.entries(clusters).map(([clusterName, phageMap]) => (
            <div key={clusterName} className="mb-5 border border-gray-700 rounded p-3">
              <h4 className="font-bold text-lg mb-2">{clusterName}</h4>
              {Object.keys(phageMap).length > 0 ? (
                <div>
                  {Object.entries(phageMap).map(([phage, bacteria]) => (
                    <div key={phage} className="mb-1">
                      <strong>{phage}:</strong>{' '}
                      <span>{bacteria.join(', ')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="italic text-gray-400">No phages found in this cluster.</p>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default PhageClusterInfoModal;
