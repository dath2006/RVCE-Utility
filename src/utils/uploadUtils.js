import axios from "axios";
import { validateFileType, validateFileSize } from "./fileValidation";

export const uploadFile = async (
  token,
  fileItem,
  formData,
  uploadSessionId,
  userProp,
  onProgress
) => {
  // Validate file type
  if (!validateFileType(fileItem.file)) {
    throw new Error(`Invalid file type: ${fileItem.file.name}`);
  }

  // Validate file size
  if (!validateFileSize(fileItem.file)) {
    throw new Error(`File ${fileItem.file.name} exceeds 20MB limit`);
  }

  const formDataObj = new FormData();
  formDataObj.append("file", fileItem.file);
  formDataObj.append("uploadSessionId", uploadSessionId);
  formDataObj.append("subjectCode", formData.subjectCode);
  formDataObj.append("subjectName", formData.subjectName);
  formDataObj.append("semester", formData.semester);
  formDataObj.append("branch", formData.branch);
  formDataObj.append("docType", formData.docType);

  // Mock user data - replace with actual user data from your auth system
  formDataObj.append("user", JSON.stringify(userProp));

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_UPLOAD_URL}/upload`, // Replace with your actual upload endpoint
      formDataObj,
      {
        headers: {
          Authorization: `Bearer ${token}`,

          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Upload failed: ${
          error.response.data.message || error.response.statusText
        }`
      );
    } else if (error.request) {
      throw new Error("Upload failed: No response from server");
    } else {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
};
