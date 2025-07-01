import * as XLSX from 'xlsx';
import { MarkerType } from '@xyflow/react';

export function parseExcelToFlow(file, callback) {
  const reader = new FileReader();

  reader.onload = (evt) => {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (json.length < 3) return;

    const phageHeaders = json[1].slice(2); // headers (row 2, columns C+)
    const phageDataCols = json.slice(2).map(row => row.slice(2)); // data rows (columns C+)

    const columnsToKeep = [];
    const combinedHeaders = [];

    // Detect consecutive zero-only columns groups
    let groupStart = null;

    const isAllZero = (colIndex) => {
      return phageDataCols.every(row => parseInt(row[colIndex]) === 0);
    };

    for (let i = 0; i < phageHeaders.length; i++) {
      if (isAllZero(i)) {
        if (groupStart === null) groupStart = i;
      } else {
        if (groupStart !== null) {
          // Push group of zero-only columns
          const names = phageHeaders.slice(groupStart, i);
          // combined header if there's a group if just one column, the label is the same as the header
          if (names.length === 1) {
            combinedHeaders.push({ startIndex: groupStart, endIndex: i - 1, label: names[0] });
          } else {
            combinedHeaders.push({ startIndex: groupStart, endIndex: i - 1, label: `${names[0]} - ${names[names.length - 1]}` });
          }
          groupStart = null;
        }
        columnsToKeep.push(i);
      }
    }
    // Handle trailing group
    if (groupStart !== null) {
      const names = phageHeaders.slice(groupStart);
      combinedHeaders.push({ startIndex: groupStart, endIndex: phageHeaders.length - 1, label: `${names[0]} - ${names[names.length - 1]}` });
    }

    const newNodes = [];
    const newEdges = [];

    const bacteriaX = 50;
    const phageStartX = 200;
    const phageSpacing = 100;

    // Header node for Bacteria
    newNodes.push({
      id: 'header-bacteria',
      data: { label: 'Bacteria' },
      position: { x: bacteriaX, y: 0 },
      type: 'header',
      draggable: false,
    });

    // We want to place all headers (normal + combined) horizontally in order
    // Merge and sort all header columns by their original index order
    const sortedNormal = columnsToKeep
      .slice()
      .sort((a, b) => a - b)
      .map(idx => ({ index: idx, label: phageHeaders[idx], type: 'single' }));

    // Combined zero-only headers appended at end, sorted by their start index
    const sortedCombined = combinedHeaders
      .slice()
      .sort((a, b) => a.startIndex - b.startIndex)
      .map(group => ({ index: group.startIndex, label: group.label, type: 'combined' }));

    const allHeaders = [...sortedNormal, ...sortedCombined];

    // Add header nodes, spaced horizontally
    allHeaders.forEach(({ label, type }, i) => {
      newNodes.push({
        id: type === 'combined' ? `header-combined-${i}` : `header-phage-${i}`,
        data: { label },
        position: { x: phageStartX + i * phageSpacing, y: 0 },
        type: 'header',
        draggable: false,
      });
    });

    // Now for each bacteria row
    for (let i = 2; i < json.length; i++) {
      const row = json[i];
      const yOffset = (i - 1) * 150;

      const bacteriaId = `bacteria-${i}`;
      const bacteriaName = row[0]?.toString() || `Bacteria ${i}`;
      const rowNodes = [];

      const bacteriaNode = {
        id: bacteriaId,
        data: { label: bacteriaName },
        position: { x: bacteriaX, y: yOffset },
        type: 'bacteria',
        draggable: false,
      };
      rowNodes.push(bacteriaNode);

      // Place phage nodes only for columnsToKeep (non-zero-only columns)
      let nodeX = phageStartX;
      allHeaders.forEach(({ type, index }, idx) => {
        if (type === 'combined') {
          // Skip nodes for combined zero-only columns; no phage nodes rendered
          return;
        }
        // Normal phage column — get original column index
        const colIndex = index;
        const value = row[colIndex + 2]; // offset A,B columns

        if (value === undefined || value === '') {
          nodeX += phageSpacing;
          return;
        }

        const isEmpty = parseInt(value) === 0;
        const nodeType = isEmpty ? 'emptyPhage' : 'filledPhage';

        const phageNode = {
          id: `phage-${i}-${colIndex}`,
          data: { label: '' },
          position: { x: nodeX, y: yOffset },
          type: nodeType,
          draggable: false,
        };
        rowNodes.push(phageNode);

        nodeX += phageSpacing;
      });

      // Create edges (bacteria -> first phage -> next phage ...)
      for (let k = 1; k < rowNodes.length; k++) {
        newEdges.push({
          id: `e-${rowNodes[k - 1].id}-${rowNodes[k].id}`,
          source: rowNodes[k - 1].id,
          target: rowNodes[k].id,
          markerEnd: { type: MarkerType.ArrowClosed },
        });
      }

      newNodes.push(...rowNodes);
    }

    callback(newNodes, newEdges);
  };

  reader.readAsArrayBuffer(file);
}
