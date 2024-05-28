import React from 'react';

export const regions = [
  { name: 'Asia', color: '#1f77b4' },
  { name: 'Europe', color: '#ff7f0e' },
  { name: 'Africa', color: '#2ca02c' },
  { name: 'Oceania', color: '#d62728' },
  { name: 'Americas', color: '#9467bd' },
  { name: 'Other', color: '#7f7f7f' },
];

const Legend: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <strong>Region</strong>
      {regions.map(region => (
        <div key={region.name} className="flex items-center ml-3">
          <div style={{ width: '12px', height: '12px', backgroundColor: region.color, marginRight: '5px' }}></div>
          <span>{region.name}</span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
