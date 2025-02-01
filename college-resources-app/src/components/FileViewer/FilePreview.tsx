import React from 'react';

interface FilePreviewProps {
    fileName: string;
    fileType: string;
    onPreview: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ fileName, fileType, onPreview }) => {
    return (
        <div className="file-preview" onClick={onPreview}>
            <h3>{fileName}</h3>
            <p>{fileType}</p>
        </div>
    );
};

export default FilePreview;