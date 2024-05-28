import React from 'react';

export const regions = [
  { name: 'Asia', color: '#5B46E3' },
  { name: 'Europe', color: '#9E6CE3' },
  { name: 'Africa', color: '#DA8089' },
  { name: 'Oceania', color: '#F6A431' },
  { name: 'Americas', color: '#FCC235' },
  { name: 'Other', color: '#7f7f7f' },
];

const Legend: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <strong>Region</strong>
      {regions.map(region => (
        <div key={region.name} className="flex items-center ml-3">
          <div style={{ backgroundColor: region.color }} className="size-[12px] mr-1 rounded-sm"></div>
          <span>{region.name}</span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
