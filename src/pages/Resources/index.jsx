import React, { useState, useEffect } from "react";
import styled from "styled-components";
import FileExplorer from "./FileExplorer";
import BreadCrumbs from "./BreadCrumbs";
import SearchBar from "./SearchBar";
import searchFiles from "../../hooks/searchFiles";
import { motion } from "framer-motion";
import folderHierarchy from "../../data/folderHierarchy.json";
import searchFolderStructure from "../../hooks/searchFolders";
import FloatingFilterButton from "../../components/FloatingFilterButton";
import SelectionPopup from "../../components/SelectionPopup";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  position: absolute;
  top: 70px;
  left: 0;
  right: 0;
  background: ${(props) => props.theme.background};
  padding: 1rem 2rem;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
  }
`;

const ScrollableContainer = styled.div`
  margin-top: 9rem;
  overflow-y: auto;
  @media (max-width: 768px) {
    overflow-y: auto;
    margin-top: 15rem;
  }
`;

const BreadcrumbsContainer = styled.div`
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
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const NoResultsMessage = styled(motion.div)`
  text-align: center;
  padding: 2rem;
  color: ${(props) => props.theme.text};
  font-size: 1.2rem;
  opacity: 0.7;
`;

const Resources = () => {
  const [currentPath, setCurrentPath] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState(folderHierarchy);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem("filters");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    filters && handleShowFolders();
    searchQuery &&
      setFilteredFiles(() => [...searchFiles(searchQuery, filteredFolders)]);
  }, [filters, searchQuery]);

  const handleShowFolders = () => {
    if (filters.cycle === "C - Cycle") {
      let arr = [];
      [
        "Chemistry (22CHY12A)",
        "CAEG (ME112GL)",
        "Yoga (22HSY18)",
        "Indian Constitution (22HSE16)",
        "Maths (22MA11C)",
        filters.selectedESC,
        filters.selectedPLC,
      ].map((sub) => {
        searchFolderStructure(sub).map((data) => arr.push(data));
      });
      setFilteredFolders(() => [...arr]);
    } else {
      let arr = [];
      [
        "Physics (22PHY22C)",
        "Idea lab (22ME28)",
        "Principles of C prog (22CS23)",
        "Maths (22MA21C)",
        filters.selectedETC,
        filters.selectedKannada,
      ].map((sub) => {
        searchFolderStructure(sub).map((data) => arr.push(data));
      });
      setFilteredFolders(() => [...arr]);
    }
  };

  return (
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
              currentPath={currentPath}
              searchQuery={searchQuery}
              filteredFiles={filteredFiles}
              onPathChange={setCurrentPath}
              rootFolders={filteredFolders}
            />
          )}
        </ScrollableContainer>
      </div>
      <FloatingFilterButton onClick={() => setShowFilterDialog(true)} />
      {showFilterDialog && (
        <SelectionPopup
          filters={filters}
          setFilters={setFilters}
          onClose={() => setShowFilterDialog(false)}
          onSubmit={(selectedFilters) => {
            setFilters(selectedFilters);
            localStorage.setItem("filters", JSON.stringify(selectedFilters));
            setShowFilterDialog(false);
          }}
        />
      )}
    </Container>
  );
};

export default Resources;
