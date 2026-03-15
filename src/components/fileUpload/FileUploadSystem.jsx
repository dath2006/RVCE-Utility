import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, UploadCloud } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

import FormFields from "./FormFields";
import FileDropZone from "./FileDropZone";
import FileList from "./FileList";
import UploadButton from "./UploadButton";
import StatusMessages from "./StatusMessages";
import { uploadFile } from "../../utils/uploadUtils";
import {
  allowedExtensions,
  validateFileType,
} from "../../utils/fileValidation";
import { incrementResourceCount } from "../../firebase";

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
    setDisableWorkSpace(true);
  }, [setDisableWorkSpace]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setUploadStatus(null);
  };

  const processFiles = (selectedFiles) => {
    const validFiles = [];
    const invalidFiles = [];

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
        `Invalid file type(s): ${invalidFiles.join(", ")}. Only ${allowedExtensions.join(", ")} files are allowed.`,
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
      processFiles(Array.from(event.target.files));
    }
  };

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    setIsDragging(false);
    setError(null);
    setUploadStatus(null);

    if (event.dataTransfer.files) {
      processFiles(Array.from(event.dataTransfer.files));
    }
  }, []);

  const handleDragEnter = useCallback((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
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
    const uploadResults = [];

    for (const fileItem of files) {
      if (!fileItem.uploaded && !fileItem.error) {
        try {
          setFiles((prev) =>
            prev.map((file) =>
              file.id === fileItem.id
                ? { ...file, uploading: true, progress: 0 }
                : file,
            ),
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
                prev.map((file) =>
                  file.id === fileItem.id ? { ...file, progress } : file,
                ),
              );
            },
          );

          setFiles((prev) =>
            prev.map((file) =>
              file.id === fileItem.id
                ? { ...file, uploaded: true, uploading: false, progress: 100 }
                : file,
            ),
          );

          uploadResults.push({ id: fileItem.id, success: true });
        } catch (uploadError) {
          setFiles((prev) =>
            prev.map((file) =>
              file.id === fileItem.id
                ? {
                    ...file,
                    uploaded: false,
                    uploading: false,
                    progress: 0,
                    error: uploadError.message,
                  }
                : file,
            ),
          );

          uploadResults.push({
            id: fileItem.id,
            success: false,
            error: uploadError.message,
          });
        }
      }
    }

    const successfulUploads = uploadResults.filter((result) => result.success);
    const failedUploads = uploadResults.filter((result) => !result.success);

    if (successfulUploads.length > 0) {
      incrementResourceCount(successfulUploads.length);
    }

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
      }, 1800);
    }

    setIsUploading(false);
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const isFormValid =
    formData.semester &&
    formData.branch &&
    formData.subjectCode &&
    formData.subjectName &&
    formData.docType;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mx-auto w-full max-w-5xl"
    >
      <div className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">
              Upload Study Material
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add clean metadata, attach files, and publish for review.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin reviewed before publishing
          </div>
        </div>

        <div className="space-y-4">
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

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-muted/35 p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UploadCloud className="h-4 w-4" />
              <span>{files.length} file(s) in queue</span>
              {files.some((file) => file.uploaded) && (
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Uploaded: {files.filter((file) => file.uploaded).length}
                </span>
              )}
            </div>

            <UploadButton
              onClick={handleUpload}
              disabled={!isFormValid || files.length === 0 || isUploading}
              isUploading={isUploading}
              fileCount={files.length}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FileUploadSystem;
