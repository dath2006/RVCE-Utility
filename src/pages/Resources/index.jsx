import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import FileExplorer from "./FileExplorer";
import BreadCrumbs from "./BreadCrumbs";
import SearchBar from "./SearchBar";
import searchFiles from "../../hooks/searchFiles";
import { motion } from "framer-motion";
import searchFolderStructure from "../../hooks/searchFolders";
import FloatingFilterButton from "../../components/FloatingFilterButton";
import SelectionPopup from "../../components/SelectionPopup";
import { WindowProvider } from "../../components/FileViewer/WindowContext";
import WaveLoader from "../../components/Loading";
import axios from "axios";
import { FilterList } from "@mui/icons-material";
import { useOverlay } from "../../contexts/NavigationContext";

const Container = styled.div`
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 70px;
  width: 100vw;
  left: unset;
  right: unset;
  background: ${(props) => props.theme.background};
  padding: 0.75rem 1.25rem;
  z-index: 10;
  background: rgba(255, 248, 248, 0.07);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);

  @media (max-width: 768px) {
    padding: 0.5rem 0.5rem;
    gap: 0.5rem;
    top: 75px;
  }

  @media (max-width: 501px) {
    padding: 0.5rem 0.5rem;
    gap: 0.5rem;
    top: 60px;
  }
`;

const ScrollableContainer = styled.div`
  margin-top: 5.5rem;
  overflow-y: auto;
  padding: 1rem;
  @media (max-width: 601px) {
    margin-top: 5rem;
    padding: 1rem;
  }

  @media (max-width: 501px) {
    margin-top: 4rem;
    padding: 0 0.6rem;
  }
`;

const BreadcrumbsContainer = styled.div`
  flex: 1 1 0%;
  min-width: 0;
  @media (max-width: 768px) {
    font-size: 0.9rem;
    width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const SearchContainer = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
`;

const NoResultsMessage = styled(motion.div)`
  text-align: center;
  padding: 2rem;
  color: ${(props) => props.theme.text};
  font-size: 1.2rem;
  opacity: 0.7;
`;

const LoadingSpinner = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const Resources = ({ screenSize, setDisableWorkSpace }) => {
  const [currentPath, setCurrentPath] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [jsonData, setJsonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem("filters");
    return saved ? JSON.parse(saved) : null;
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useOverlay("filterDialog", showFilterDialog);

  const handleShowFolders = useCallback(() => {
    if (!jsonData || jsonData.length === 0) {
      return;
    }
    if (!filters) {
      setFilteredFolders(jsonData);
      return;
    }

    let arr = [];
    if (filters.cycle === "C - Cycle") {
      [
        "Question Papers",
        "Chemistry (22CHY12A)",
        "CAEG (ME112GL)",
        "Yoga (22HSY18)",
        "Indian Constitution (22HSE16)",
        "Maths (22MA11C)",
        filters.selectedESC,
        filters.selectedPLC,
      ].forEach((sub) => {
        if (sub) {
          searchFolderStructure(sub, jsonData).forEach((data) =>
            arr.push(data)
          );
        }
      });
    } else {
      [
        "Mechanical Engineering",
        "Basic Electronics",
        "Physics (22PHY22C)",
        "Idea lab (22ME28)",
        "Principles of C prog (22CS23)",
        "Maths (22MA21C)",
        filters.selectedETC,
        filters.selectedKannada,
        filters.selectedESC,
      ].forEach((sub) => {
        if (sub) {
          searchFolderStructure(sub, jsonData).forEach((data) =>
            arr.push(data)
          );
        }
      });
    }
    setFilteredFolders(arr);
  }, [jsonData, filters]);

  useEffect(() => {
    const setShow = () => {
      setDisableWorkSpace(false);
    };
    setShow();
    getFiles();
  }, []);

  useEffect(() => {
    handleShowFolders();
  }, [filters, jsonData, handleShowFolders]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredFiles([...searchFiles(searchQuery, jsonData)]);
    } else {
      setFilteredFiles([]);
    }
  }, [searchQuery, jsonData]);

  async function getFiles() {
    setLoading(true);

    try {
      const res = await axios.get(import.meta.env.VITE_FILES_URL);
      const data = res.data;

      setJsonData(data);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  }

  return loading ? (
    <LoadingSpinner>
      <WaveLoader
        size="7em"
        primaryColor="hsl(220,90%,50%)"
        secondaryColor="hsl(300,90%,50%)"
      />
    </LoadingSpinner>
  ) : (
    <WindowProvider>
      <Container>
        <div>
          <Header>
            <BreadcrumbsContainer>
              <BreadCrumbs path={currentPath} onNavigate={setCurrentPath} />
            </BreadcrumbsContainer>
            <SearchContainer>
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </SearchContainer>
          </Header>

          <ScrollableContainer>
            {searchQuery && filteredFiles.length === 0 ? (
              <NoResultsMessage
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                No files found for "{searchQuery}"
              </NoResultsMessage>
            ) : (
              <FileExplorer
                key={refreshKey}
                currentPath={currentPath}
                searchQuery={searchQuery}
                filteredFiles={filteredFiles}
                onPathChange={setCurrentPath}
                rootFolders={filteredFolders}
              />
            )}
          </ScrollableContainer>
        </div>
        {screenSize >= 925 && (
          <FloatingFilterButton onClick={() => setShowFilterDialog(true)} />
        )}

        {screenSize < 925 && !loading && (
          <button
            onClick={() => setShowFilterDialog(true)}
            style={{
              position: "fixed",
              top: 140,
              right: -15,
              zIndex: 30,
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#e0e7ff", // Tailwind bg-indigo-100
              color: "#4f46e5", // Tailwind text-indigo-600
              border: "none",
              borderRadius: "100px 0 0 100px",
              boxShadow: "0 2px 12px 0 rgba(0,0,0,0.10)",
              padding: "0.4rem 0.7rem 0.4rem 0.7rem",
              fontWeight: 500,
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            <FilterList size={20} style={{ marginRight: 7 }} />
          </button>
        )}

        {showFilterDialog && (
          <SelectionPopup
            filters={filters}
            setFilters={setFilters}
            onClose={() => setShowFilterDialog(false)}
            onSubmit={(selectedFilters) => {
              setFilters(selectedFilters);
              localStorage.setItem("filters", JSON.stringify(selectedFilters));
              setShowFilterDialog(false);
              setRefreshKey((k) => k + 1);
            }}
          />
        )}
      </Container>
    </WindowProvider>
  );
};

export default Resources;
