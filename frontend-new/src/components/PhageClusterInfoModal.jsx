import React, { useState, useEffect } from 'react';

const PhageClusterInfoModal = ({ isOpen, onClose, data }) => {
  const { clusters = {} } = data || {};
  const allClusters = Object.keys(clusters);
  const allPhages = Array.from(
    new Set(Object.values(clusters).flatMap(clusterPhages => Object.keys(clusterPhages)))
  );

  const [mode, setMode] = useState('cluster'); // 'cluster' or 'phage'
  const [selectedItems, setSelectedItems] = useState([]);
  const [result, setResult] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    computeResult();
  }, [selectedItems, mode, isOpen]);

  const computeResult = () => {
    if (!selectedItems.length) return setResult([]);

    if (mode === 'cluster') {
      const commonPhages = selectedItems.reduce((acc, clusterName, i) => {
        const phageSet = new Set(Object.keys(clusters[clusterName] || {}));
        return i === 0 ? phageSet : new Set([...acc].filter(p => phageSet.has(p)));
      }, null);

      const phageBacteriaMap = {};
      [...commonPhages].forEach(phage => {
        const contributors = [];
        selectedItems.forEach(clusterName => {
          const bacteriaList = clusters[clusterName]?.[phage] || [];
          bacteriaList.forEach(({ name, cluster }) => {
            contributors.push({ name, cluster });
          });
        });
        phageBacteriaMap[phage] = contributors;
      });

      setResult(
        Object.entries(phageBacteriaMap).map(([phage, contributors]) => ({
          label: phage,
          contributors,
        }))
      );
    } else {
      const clusterSet = selectedItems.reduce((acc, phage, i) => {
        const clustersWithPhage = Object.entries(clusters)
          .filter(([_, phageMap]) => phageMap[phage])
          .map(([c]) => c);
        return i === 0 ? new Set(clustersWithPhage) : new Set([...acc].filter(c => clustersWithPhage.includes(c)));
      }, null);

      const clusterBacteriaMap = {};
      [...clusterSet].forEach(clusterName => {
        const contributors = [];
        selectedItems.forEach(phage => {
          const bacteriaList = clusters[clusterName]?.[phage] || [];
          bacteriaList.forEach(({ name, cluster }) => {
            contributors.push({ name, cluster });
          });
        });
        clusterBacteriaMap[clusterName] = contributors;
      });

      setResult(
        Object.entries(clusterBacteriaMap).map(([cluster, contributors]) => ({
          label: cluster,
          contributors,
        }))
      );
    }
  };

  const toggleItem = item => {
    setSelectedItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start pt-20 z-50 overflow-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-base-100 text-base-content rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-auto relative shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">Phage & Cluster Explorer</h2>

        <button
          className="btn btn-sm btn-outline absolute top-4 right-4"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <div className="mb-4">
          <label className="mr-4 font-semibold">Mode:</label>
          <select
            className="select select-sm select-bordered"
            value={mode}
            onChange={e => setMode(e.target.value)}
          >
            <option value="cluster">Select Clusters</option>
            <option value="phage">Select Phages</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6 max-h-48 overflow-auto">
          {(mode === 'cluster' ? allClusters : allPhages).map(item => (
            <label key={item} className="cursor-pointer flex items-center space-x-2">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={selectedItems.includes(item)}
                onChange={() => toggleItem(item)}
              />
              <span>{item}</span>
            </label>
          ))}
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-2">
            {mode === 'cluster' ? 'Common Phages & Contributing Bacteria' : 'Common Clusters & Contributing Bacteria'}
          </h3>
          {result.length > 0 ? (
            result.map(({ label, contributors }) => {
              const uniqueContributors = Array.from(
                new Map(contributors.map(c => [`${c.name}|${c.cluster}`, c])).values()
              );

              return (
                <div key={label} className="mb-3">
                  <strong>{label}:</strong>
                  <ul className="ml-4 list-disc max-h-40 overflow-auto">
                    {uniqueContributors.map(({ name, cluster }, i) => (
                      <li key={`${label}-${name}-${cluster}-${i}`}>
                        {name} <span className="text-xs text-base-content/60">({cluster})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          ) : (
            <p className="italic text-base-content/60">No common results found for selected items.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhageClusterInfoModal;
