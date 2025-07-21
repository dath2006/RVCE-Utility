export const allowedFileTypes = [
  "application/pdf", // PDF
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
  "text/plain", // TXT
  "application/msword", // DOC
  "application/vnd.ms-powerpoint", // PPT
];

export const allowedExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".txt",
];

export const validateFileType = (file) => {
  // Check if file type is in allowed types
  if (!allowedFileTypes.includes(file.type)) {
    // Handle some edge cases where MIME type might not be reliable
    const extension = file.name.toLowerCase().split(".").pop();
    if (
      (extension === "pdf" && file.type === "application/octet-stream") ||
      (extension === "docx" && file.type === "application/octet-stream") ||
      (extension === "pptx" && file.type === "application/octet-stream") ||
      (extension === "txt" && file.type === "application/octet-stream") ||
      (extension === "doc" && file.type === "application/octet-stream") ||
      (extension === "ppt" && file.type === "application/octet-stream")
    ) {
      return true;
    }
    return false;
  }
  return true;
};

export const validateFileSize = (file) => {
  const MAX_SIZE = 20 * 1024 * 1024; // 20MB in bytes
  return file.size <= MAX_SIZE;
};
