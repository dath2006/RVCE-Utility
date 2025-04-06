import React, { useState, useRef, useCallback, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  Check,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import { toast } from "react-toastify";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// Container and Layout Components
const Container = styled.div`
  color: ${(props) => props.theme.text || "#e5e7eb"};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  background: ${(props) => props.theme.background || "#111827"};

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const MainContent = styled.div`
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  margin-top: 5rem;
  position: relative;
`;

const UploadCard = styled(motion.div)`
  background: ${(props) => props.theme.cardTheme || "#1f2937"};
  color: ${(props) => props.theme.text || "#e5e7eb"};
  border-radius: 24px;
  padding: 1.5rem;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.07);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
    z-index: 1;
  }

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 16px;
  }
`;

const CardTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-align: center;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

// Form Components
const FormGroup = styled.div`
  width: 100%;
  margin-bottom: 1.5rem;
  position: relative;
  animation: ${fadeIn} 0.5s ease forwards;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 0.1rem;
  font-size: 0.9rem;
  color: ${(props) => props.theme.text || "#e5e7eb"};
  font-weight: 500;
`;

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid
    ${(props) => props.theme.border || "rgba(255, 255, 255, 0.1)"};
  border-radius: 12px;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.text};
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary || "#3b82f6"};
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }

  &::placeholder {
    color: #6b7280;
  }
`;

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SelectField = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem; /* Space for the dropdown icon */
  border: 2px solid
    ${(props) => props.theme.border || "rgba(255, 255, 255, 0.1)"};
  border-radius: 12px;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.text};
  font-size: 1rem;
  transition: all 0.3s ease;
  appearance: none;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.primary || "#3b82f6"};
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }
`;

const SelectIcon = styled(ChevronDown)`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
`;

// File Upload Zone Components
const DragDropZone = styled(motion.div)`
  width: 100%;
  min-height: 220px;
  border: 2px dashed ${(props) => (props.isDragging ? "#6366f1" : "#4b5563")};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  background: ${(props) =>
    props.isDragging ? "rgba(99, 102, 241, 0.1)" : props.theme.background};
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${(props) =>
      props.isDragging
        ? "radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)"
        : "none"};
    z-index: 0;
    opacity: ${(props) => (props.isDragging ? 1 : 0)};
    transition: opacity 0.3s ease;
  }

  @media (max-width: 768px) {
    min-height: 150px;
    padding: 1.5rem;
  }
`;

const UploadIconWrapper = styled(motion.div)`
  margin-bottom: 1.5rem;
  z-index: 1;
`;

const UploadText = styled.p`
  color: #9ca3af;
  text-align: center;
  margin: 0.5rem 0;
  z-index: 1;
  font-size: 1rem;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const BrowseLink = styled.span`
  color: #6366f1;
  cursor: pointer;
  font-weight: 500;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 1px;
    background: #6366f1;
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: scaleX(1);
    transform-origin: left;
  }
`;

// File List Components
const FileList = styled.div`
  width: 100%;
  margin-top: 0.6rem;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(31, 41, 55, 0.4);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(99, 102, 241, 0.5);
    border-radius: 3px;
  }
`;

const FileItem = styled(motion.div)`
  color: ${(props) => props.theme.text || "#e5e7eb"};
  background: ${(props) => props.theme.background};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  border: 1px solid
    ${(props) => props.theme.border || "rgba(255, 255, 255, 0.1)"};
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

const FileDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`;

const FileIconWrapper = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(99, 102, 241, 0.15);
  color: #6366f1;

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }
`;

const FileInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const FileName = styled.span`
  color: ${(props) => props.theme.text};
  font-size: 0.95rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;

  @media (max-width: 768px) {
    max-width: 180px;
    font-size: 0.85rem;
  }
`;

const FileSize = styled.span`
  color: #9ca3af;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const DeleteButton = styled(motion.button)`
  color: #9ca3af;
  background: rgba(239, 68, 68, 0.1);
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.2);
  }
`;

const FileStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;

  ${(props) =>
    props.status === "uploaded" &&
    `
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
  `}

  ${(props) =>
    props.status === "uploading" &&
    `
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
  `}
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: rgba(31, 41, 55, 0.4);
  width: 100%;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 3px;
  transition: width 0.3s ease;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.4) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: ${shimmer} 2s infinite linear;
    background-size: 1000px 100%;
  }
`;

// Upload Button and Status Components
const UploadButton = styled(motion.button)`
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  padding: 0.875rem 2.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1.5rem;
  position: relative;
  overflow: hidden;
  font-size: 1rem;

  &:disabled {
    background: linear-gradient(90deg, #4b5563, #6b7280);
    cursor: not-allowed;
  }

  &::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.2) 0%,
      rgba(255, 255, 255, 0) 60%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover:not(:disabled)::after {
    opacity: 1;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 0.75rem;
  }
`;

const UploadSuccess = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  margin-top: 1.5rem;
  border: 1px solid rgba(16, 185, 129, 0.2);
`;

const UploadError = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  margin-top: 1.5rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
`;

const FileCounter = styled.div`
  color: #9ca3af;
  font-size: 0.9rem;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 500;
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
`;

// Loading Toast Component
const LoadingToast = styled(motion.div)`
  position: fixed;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 1000;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    width: 90%;
    padding: 0.75rem 1rem;
  }
`;

const LoadingIcon = styled(motion.div)`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366f1;
`;

// Help Button and Modal Components

const Contributation = ({ setDisableWorkSpace }) => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [subject, setSubject] = useState("");

  const { user } = useUser();

  useEffect(() => {
    const setShow = () => {
      setDisableWorkSpace(true);
    };
    setShow();
  }, []);

  const handleFileChange = (event) => {
    setError(null);
    setUploadStatus(null);
    const newFiles = Array.from(event.target.files).map((file) => ({
      file,
      progress: 0,
      uploaded: false,
      id: crypto.randomUUID(),
    }));
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const uploadFile = (fileItem) => {
    return new Promise((resolve, reject) => {
      // Check file size (20MB limit)
      const MAX_SIZE = 20 * 1024 * 1024; // 20MB in bytes
      if (fileItem.file.size > MAX_SIZE) {
        setError(`File ${fileItem.file.name} exceeds 20MB limit`);
        setIsUploading(false);
        reject(`File size limit exceeded`);
        return;
      }

      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", fileItem.file);
      formData.append("subject", subject);
      formData.append("semester", semester);
      formData.append("branch", branch);
      formData.append(
        "user",
        JSON.stringify({
          fullName: user.fullName,
          email: user.primaryEmailAddress.emailAddress,
          imageUrl: user.imageUrl,
        })
      );

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round(
            (event.loaded / event.total) * 100
          );

          // Update only this specific file's progress
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === fileItem.id ? { ...f, progress: percentComplete } : f
            )
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === fileItem.id ? { ...f, uploaded: true, progress: 100 } : f
            )
          );
          resolve(xhr.response);
        } else {
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === fileItem.id ? { ...f, uploaded: false } : f
            )
          );
          setError(`Uploading Failed: ${xhr.statusText}`);
          reject(`Upload failed with status ${xhr.status}`);
        }
      };

      xhr.onerror = () => {
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === fileItem.id ? { ...f, uploaded: false } : f
          )
        );
        setError(`Network error occurred during upload`);
        reject("Network error");
      };

      // Replace with your actual upload URL
      xhr.open("POST", `${import.meta.env.VITE_API_URL}/contribute`, true);
      xhr.send(formData);
    });
  };

  const handleUpload = async () => {
    try {
      if (!semester || !subject) {
        setError("Please select semester and enter subject name");
        return;
      }

      setIsUploading(true);
      setError(null);

      // Process files sequentially to see individual progress
      for (const fileItem of files) {
        if (!fileItem.uploaded) {
          try {
            await uploadFile(fileItem);
          } catch (error) {
            toast.error(`Error uploading ${fileItem.file.name}`);
            console.error(`Error uploading ${fileItem.file.name}:`, error);
            // Continue with next file even if this one fails
          }
        }
      }

      const allUploaded = files.every((file) => file.uploaded);

      setUploadStatus({
        success: allUploaded,
        message: allUploaded
          ? "All files uploaded successfully!"
          : "Some files failed to upload.",
      });

      // Only clear files after successful upload
      if (allUploaded) {
        setTimeout(() => {
          setFiles([]);
        }, 1500);
      }

      setIsUploading(false);
    } catch (error) {
      console.error("Upload error:", error);

      setUploadStatus({
        success: false,
        message: "Some files failed to upload.",
      });
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const updatedFiles = droppedFiles.map((file) => ({
      file,
      progress: 0,
      uploaded: false,
      id: crypto.randomUUID(),
    }));

    setFiles((prevFiles) => [...prevFiles, ...updatedFiles]);
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (id) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <>
      <MainContent>
        <UploadCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <CardTitle>Upload Study Materials</CardTitle>

          <FormRow>
            <FormGroup>
              <InputLabel>Semester</InputLabel>
              <SelectWrapper>
                <SelectField
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                >
                  <option value="">Select Semester</option>
                  {Array.from({ length: 8 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      Semester {i + 1}{" "}
                      {i === 0
                        ? "(Chemistry Cycle)"
                        : i === 1
                        ? "(Physics Cycle)"
                        : ""}
                    </option>
                  ))}
                </SelectField>
                <SelectIcon size={18} />
              </SelectWrapper>
            </FormGroup>

            <FormGroup>
              <InputLabel>Branch</InputLabel>
              <InputField
                type="text"
                placeholder="Enter your branch"
                value={branch}
                onChange={(e) => {
                  if (!(e.target.value > 30)) {
                    setBranch(e.target.value);
                  } else {
                    toast.info("Branch too long");
                  }
                }}
              />
            </FormGroup>
          </FormRow>

          <FormGroup>
            <InputLabel>Subject</InputLabel>

            <InputField
              type="text"
              placeholder="Enter subject name"
              value={subject}
              onChange={(e) => {
                if (!(e.target.value > 30)) {
                  setSubject(e.target.value);
                } else {
                  toast.info("Subject too long");
                }
              }}
            />
          </FormGroup>

          <DragDropZone
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            isDragging={isDragging}
            onClick={() => fileInputRef.current.click()}
          >
            <UploadIconWrapper
              animate={{
                y: isDragging ? [0, -15, 0] : 0,
              }}
              transition={{
                duration: 1,
                repeat: isDragging ? Infinity : 0,
                ease: "easeInOut",
              }}
            >
              <Upload size={40} color={isDragging ? "#6366f1" : "#4b5563"} />
            </UploadIconWrapper>
            <UploadText>
              Drag and drop files here, or <BrowseLink>browse</BrowseLink>
            </UploadText>
            <UploadText>PDF, DOC, PPT files up to 20MB each</UploadText>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              multiple
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx"
            />
          </DragDropZone>

          {files.length > 0 && (
            <>
              <FileList>
                {files.map((fileItem) => (
                  <FileItem
                    key={fileItem.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FileDetails>
                      <FileIconWrapper
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FileText size={20} />
                      </FileIconWrapper>
                      <FileInfo>
                        <FileName>{fileItem.file.name}</FileName>
                        <FileSize>
                          {formatFileSize(fileItem.file.size)}
                        </FileSize>
                      </FileInfo>
                    </FileDetails>

                    {fileItem.uploaded ? (
                      <FileStatus status="uploaded">
                        <Check size={14} /> Uploaded
                      </FileStatus>
                    ) : isUploading ? (
                      <FileStatus status="uploading">
                        {fileItem.progress}%
                      </FileStatus>
                    ) : (
                      <DeleteButton
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeFile(fileItem.id)}
                      >
                        <X size={16} />
                      </DeleteButton>
                    )}

                    {isUploading && !fileItem.uploaded && (
                      <ProgressBar>
                        <ProgressFill
                          style={{ width: `${fileItem.progress}%` }}
                        />
                      </ProgressBar>
                    )}
                  </FileItem>
                ))}
              </FileList>

              <FileCounter>
                <Badge>
                  {files.length} File{files.length !== 1 ? "s" : ""}
                </Badge>
                Selected
              </FileCounter>
            </>
          )}

          {error && (
            <UploadError
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle size={18} />
              {error}
            </UploadError>
          )}

          {uploadStatus?.success && (
            <UploadSuccess
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Check size={18} />
              {uploadStatus.message}
            </UploadSuccess>
          )}

          <UploadButton
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleUpload}
            disabled={
              files.length === 0 || isUploading || !subject || !semester
            }
          >
            {isUploading ? "Uploading..." : "Upload Files"}
          </UploadButton>
        </UploadCard>
      </MainContent>

      {isUploading && (
        <LoadingToast
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <LoadingIcon
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          Uploading files, please wait...
        </LoadingToast>
      )}
    </>
  );
};

export default Contributation;
