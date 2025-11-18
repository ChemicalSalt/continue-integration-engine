import React from 'react';
import BuildItem from './builditem';

const BuildList = ({ builds }) => {
  return (
    <div className="space-y-4">
      {builds.map((b) => (
        <BuildItem key={b._id} build={b} />
      ))}
    </div>
  );
};

export default BuildList;
