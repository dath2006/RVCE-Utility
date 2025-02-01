Sure, here's the content for the file: /college-resources-app/college-resources-app/src/components/Workspace/FileManager.tsx

import React from 'react';
import { Folder } from '../../types/folder';
import './FileManager.css';

interface FileManagerProps {
  folders: Folder[];
  onAddToWorkspace: (folderId: string) => void;
  onViewFile: (fileId: string) => void;
  onDownloadFile: (fileId: string) => void;
}

const FileManager: React.FC<FileManagerProps> = ({ folders, onAddToWorkspace, onViewFile, onDownloadFile }) => {
  return (
    <div className="file-manager">
      {folders.map(folder => (
        <div key={folder.id} className="file-card">
          <h3>{folder.name}</h3>
          <div className="file-actions">
            <button onClick={() => onAddToWorkspace(folder.id)}>Add to Workspace</button>
            <button onClick={() => onViewFile(folder.id)}>View</button>
            <button onClick={() => onDownloadFile(folder.id)}>Download</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileManager;