import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload } from "lucide-react";
import FormFields from "./FormFields";
import FileDropZone from "./FileDropZone";
import FileList from "./FileList";
import UploadButton from "./UploadButton";
import StatusMessages from "./StatusMessages";
import { uploadFile } from "../../utils/uploadUtils";
import {
  validateFileType,
  allowedExtensions,
} from "../../utils/fileValidation";
import { useAuth0 } from "@auth0/auth0-react";

const FileUploadSystem = ({ setDisableWorkSpace }) => {
  const { user, getAccessTokenSilently } = useAuth0();
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    semester: "",
    branch: "",
    subjectCode: "",
    subjectName: "",
    docType: "",
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const setShow = () => {
      setDisableWorkSpace(true);
    };
    setShow();
  }, []);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setUploadStatus(null);
  };

  const processFiles = (selectedFiles) => {
    let validFiles = [];
    let invalidFiles = [];

    selectedFiles.forEach((file) => {
      if (validateFileType(file)) {
        validFiles.push({
          file,
          progress: 0,
          uploaded: false,
          id: crypto.randomUUID(),
        });
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      setError(
        `Invalid file type(s): ${invalidFiles.join(
          ", "
        )}. Only ${allowedExtensions.join(", ")} files are allowed.`
      );
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleFileChange = (event) => {
    setError(null);
    setUploadStatus(null);

    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      processFiles(selectedFiles);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    setUploadStatus(null);

    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    }
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleUpload = async () => {
    setFiles((prev) => prev.map((file) => ({ ...file, error: null })));
    setUploadStatus(null);
    setError(null);

    const { semester, branch, subjectCode, subjectName, docType } = formData;

    if (!semester || !subjectCode || !subjectName || !branch || !docType) {
      setError("Please fill all required fields");
      return;
    }

    if (files.length === 0) {
      setError("Please select at least one file");
      return;
    }

    setIsUploading(true);
    const token = await getAccessTokenSilently();
    const uploadSessionId = crypto.randomUUID();

    // Keep track of upload results
    const uploadResults = [];

    // Process files sequentially
    for (const fileItem of files) {
      if (!fileItem.uploaded && !fileItem.error) {
        try {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id ? { ...f, uploading: true, progress: 0 } : f
            )
          );

          const userProp = {
            fullName: user.name,
            email: user.email,
            imageUrl: user.picture,
          };

          await uploadFile(
            token,
            fileItem,
            formData,
            uploadSessionId,
            userProp,
            (progress) => {
              setFiles((prev) =>
                prev.map((f) => (f.id === fileItem.id ? { ...f, progress } : f))
              );
            }
          );

          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? { ...f, uploaded: true, uploading: false, progress: 100 }
                : f
            )
          );

          uploadResults.push({ id: fileItem.id, success: true });
        } catch (error) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? {
                    ...f,
                    uploaded: false,
                    uploading: false,
                    progress: 0,
                    error: error.message,
                  }
                : f
            )
          );

          uploadResults.push({
            id: fileItem.id,
            success: false,
            error: error.message,
          });
        }
      }
    }

    // Check results based on our tracking array
    const successfulUploads = uploadResults.filter((result) => result.success);
    const failedUploads = uploadResults.filter((result) => !result.success);
    const allUploaded =
      failedUploads.length === 0 && successfulUploads.length > 0;

    setUploadStatus({
      success: allUploaded,
      message: allUploaded
        ? "All files uploaded successfully!"
        : `${failedUploads.length} file(s) failed to upload. Please try again.`,
    });

    if (allUploaded) {
      setTimeout(() => {
        setFiles([]);
        setFormData({
          semester: "",
          branch: "",
          subjectCode: "",
          subjectName: "",
          docType: "",
        });
        setUploadStatus(null);
      }, 2000);
    }

    setIsUploading(false);
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const isFormValid =
    formData.semester &&
    formData.branch &&
    formData.subjectCode &&
    formData.subjectName &&
    formData.docType;

  return (
    <div className="h-fit  flex items-center justify-center p-3 sm:p-5 lg:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full max-w-4xl bg-slate-900/50 backdrop-blur-lg rounded-lg shadow-lg border border-slate-800 p-5 sm:p-6 lg:p-8"
      >
        <div className="text-center mb-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-white mb-2"
          >
            Upload Study Materials
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-slate-400"
          >
            Share your documents with fellow students
          </motion.p>
        </div>

        <div className="space-y-6">
          <FormFields formData={formData} onChange={handleFormChange} />

          <FileDropZone
            isDragging={isDragging}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onFileSelect={() => fileInputRef.current?.click()}
            fileInputRef={fileInputRef}
            onFileChange={handleFileChange}
          />

          <AnimatePresence>
            {files.length > 0 && (
              <FileList
                files={files}
                onRemoveFile={removeFile}
                isUploading={isUploading}
              />
            )}
          </AnimatePresence>

          <StatusMessages error={error} uploadStatus={uploadStatus} />

          <UploadButton
            onClick={handleUpload}
            disabled={!isFormValid || files.length === 0 || isUploading}
            isUploading={isUploading}
            fileCount={files.length}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default FileUploadSystem;
