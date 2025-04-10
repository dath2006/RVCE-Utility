import { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { X, CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { toast } from "react-toastify";
import { useAuth0 } from "@auth0/auth0-react";

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 16px;

  @media (max-width: 640px) {
    padding: 8px;
  }
`;

const PopupContainer = styled(motion.div)`
  background: ${(props) => props.theme.surface};
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  padding: 24px;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);

  @media (max-width: 640px) {
    width: 100%;
    max-height: 90vh;
    padding: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  @media (max-width: 640px) {
    margin-bottom: 12px;
  }
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${(props) => props.theme.text};

  @media (max-width: 640px) {
    font-size: 20px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 640px) {
    padding: 6px;
  }
`;

const Stats = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 16px;

  @media (max-width: 640px) {
    padding: 12px;
    gap: 12px;
    margin-bottom: 12px;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;

  @media (max-width: 640px) {
    font-size: 12px;
    gap: 4px;
  }
`;

const DocumentList = styled.div`
  overflow-y: auto;
  max-height: calc(80vh - 200px);
  padding-right: 8px;

  @media (max-width: 640px) {
    max-height: calc(90vh - 160px);
    padding-right: 4px;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }
`;

const DocumentCard = styled(motion.div)`
  padding: 16px;
  background: ${(props) => props.theme.surface};
  border-radius: 12px;
  border: 1px solid #eee;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  @media (max-width: 640px) {
    padding: 12px;
    gap: 12px;
    margin-bottom: 8px;
  }
`;

const DocumentInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: ${(props) => props.theme.text};
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

const DocumentMeta = styled.div`
  font-size: 14px;
  color: ${(props) => props.theme.text};
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    font-size: 12px;
    gap: 6px;
  }
`;

const Subject = styled.span`
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: #495057;

  @media (max-width: 640px) {
    font-size: 11px;
    padding: 3px 6px;
  }
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;

  @media (max-width: 640px) {
    font-size: 11px;
    padding: 3px 6px;
  }

  ${({ status }) => {
    switch (status) {
      case "approved":
        return `
          background: #d4edda;
          color: #155724;
        `;
      case "rejected":
        return `
          background: #f8d7da;
          color: #721c24;
        `;
      default:
        return `
          background: #fff3cd;
          color: #856404;
        `;
    }
  }}
`;
const ViewContribution = ({ onClose, isOpen }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (!user) {
    return null;
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      getData();
    }
  }, [isLoading, isAuthenticated]);

  const stats = {
    approved: data.filter((doc) => doc.approved === "approved").length,
    rejected: data.filter((doc) => doc.approved === "rejected").length,
    pending: data.filter((doc) => doc.approved === "pending").length,
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={16} />;
      case "rejected":
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getData = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/getData`, {
        email: user.email,
      });
      if (res.data.success) {
        setData(res.data.resources);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onClose()}
        >
          <PopupContainer
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <Header>
              <Title>Document Overview</Title>
              <CloseButton onClick={() => onClose()}>
                <X size={24} />
              </CloseButton>
            </Header>

            {loading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Stats>
                  <StatItem>
                    <CheckCircle size={16} color="#198754" />
                    <span>{stats.approved} Approved</span>
                  </StatItem>
                  <StatItem>
                    <XCircle size={16} color="#dc3545" />
                    <span>{stats.rejected} Rejected</span>
                  </StatItem>
                  <StatItem>
                    <Clock size={16} color="#ffc107" />
                    <span>{stats.pending} Pending</span>
                  </StatItem>
                </Stats>

                <DocumentList>
                  {data.length > 0 ? (
                    data.map((doc, index) => (
                      <DocumentCard
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <FileText size={24} color="#6c757d" />
                        <DocumentInfo>
                          <FileName>{doc.file}</FileName>
                          <DocumentMeta>
                            {format(
                              new Date(doc.uploadedAt),
                              "DD/MM/YYYY HH:mm"
                            )}
                            <Subject>{doc.subject}</Subject>
                          </DocumentMeta>
                        </DocumentInfo>
                        <StatusBadge status={doc.approved}>
                          {getStatusIcon(doc.approved)}
                          {doc.approved.charAt(0).toUpperCase() +
                            doc.approved.slice(1)}
                        </StatusBadge>
                      </DocumentCard>
                    ))
                  ) : (
                    <div className="w-full flex justify-center">
                      <p>No documents found</p>
                    </div>
                  )}
                </DocumentList>
              </>
            )}
          </PopupContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default ViewContribution;
