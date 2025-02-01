Sure, here's the content for the file `/college-resources-app/college-resources-app/src/components/Navigation/Breadcrumbs.tsx`:

import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbsProps {
  paths: { name: string; path: string }[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ paths }) => {
  return (
    <nav>
      <ul className="breadcrumbs">
        {paths.map((item, index) => (
          <li key={index}>
            <Link to={item.path}>{item.name}</Link>
            {index < paths.length - 1 && <span> / </span>}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;