function downloadFile(fileUrl: string, fileName: string): void {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function openFileInNewTab(fileUrl: string): void {
    window.open(fileUrl, '_blank');
}

export { downloadFile, openFileInNewTab };