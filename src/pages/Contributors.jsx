import { useState, React, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GitHub } from "@mui/icons-material";
import {
  FaUsers,
  FaHandshake,
  FaMedal,
  FaTrophy,
  FaAward,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import ViewContribution from "../components/contribution/ViewContribution";
import axios from "axios";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";
import { useAuth0 } from "@auth0/auth0-react";
import WaveLoader from "../components/Loading";

const PageContainer = styled.div`
  min-height: 100vh;
  // background: ${(props) => props.theme.background};
  padding: 2rem 0;
  position: relative;
  overflow-x: hidden;

  @media (max-width: 925px) {
    padding-bottom: 6rem;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 0 0.75rem;
  }
`;

const HeroSection = styled(motion.section)`
  text-align: center;
  margin-bottom: 4rem;
  padding: 3rem 0;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 100%;
    background: radial-gradient(
      ellipse at center,
      ${(props) => props.theme.primary}08,
      transparent 70%
    );
    border-radius: 50%;
    z-index: -1;
  }
`;

const MainTitle = styled(motion.h1)`
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 900;
  background: ${(props) => props.theme.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    margin-bottom: 0.75rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  color: ${(props) => props.theme.text}99;
  max-width: 600px;
  margin: 0 auto 2rem;
  line-height: 1.6;
  font-weight: 400;
`;

const CTAButton = styled(motion.button)`
  background: ${(props) => props.theme.gradient};
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  font-size: clamp(1rem, 2vw, 1.1rem);
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 8px 32px ${(props) => props.theme.primary}40;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px ${(props) => props.theme.primary}60;
  }

  @media (max-width: 768px) {
    padding: 0.875rem 2rem;
  }
`;

const Section = styled(motion.section)`
  margin-bottom: 4rem;

  @media (max-width: 768px) {
    margin-bottom: 3rem;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const SectionTitle = styled(motion.h2)`
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  color: ${(props) => props.theme.text};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  svg {
    font-size: 0.9em;
    color: ${(props) => props.theme.primary};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const SectionDescription = styled(motion.p)`
  font-size: clamp(0.95rem, 2vw, 1.1rem);
  color: ${(props) => props.theme.text}80;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

const MajorContributorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const ContributorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
  // Remove min-height to prevent layout issues

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
`;

const MajorContributorCard = styled(motion.div)`
  background: ${(props) => props.theme.surface};
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 0 20px 40px ${(props) => props.theme.shadow}15;
  border: 1px solid ${(props) => props.theme.border};
  position: relative;
  overflow: hidden;
  text-align: center;
  transition: all 0.3s ease;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, #ffd700, #ffa500);
    border-radius: 24px 24px 0 0;
  }

  &::after {
    content: "";
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle,
      ${(props) => props.theme.primary}08,
      transparent
    );
    border-radius: 50%;
    z-index: 0;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 25px 50px ${(props) => props.theme.shadow}25;
  }

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const MajorContributorContent = styled.div`
  position: relative;
  z-index: 1;
`;

const MajorContributorName = styled.h3`
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  color: ${(props) => props.theme.text};
  margin-bottom: 1rem;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: ${(props) => props.theme.gradient};
    border-radius: 2px;
  }
`;

const MajorContributorDescription = styled.p`
  font-size: clamp(0.95rem, 2vw, 1.1rem);
  color: ${(props) => props.theme.text}80;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const ContributorCard = styled(motion.div)`
  background: ${(props) => props.theme.surface};
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 10px 30px ${(props) => props.theme.shadow}12;
  border: 1px solid ${(props) => props.theme.border};
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 40px ${(props) => props.theme.shadow}20;
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

const ContributorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ContributorName = styled.h4`
  font-size: clamp(1.1rem, 2.5vw, 1.3rem);
  font-weight: 600;
  color: ${(props) => props.theme.text};
  margin: 0;
`;

const RankBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: clamp(0.8rem, 1.5vw, 0.9rem);
  font-weight: 600;
  color: ${(props) => {
    if (props.rank <= 3) return "#FFD700";
    if (props.rank <= 10) return "#C0C0C0";
    return props.theme.primary;
  }};

  svg {
    font-size: 1.2em;
  }
`;

const ContributionTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ContributionTag = styled.span`
  background: ${(props) => {
    switch (props.type) {
      case "Notes":
        return "#3B82F6";
      case "QP":
        return "#10B981";
      case "Textbook":
        return "#8B5CF6";
      default:
        return "#F59E0B";
    }
  }};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: clamp(0.75rem, 1.5vw, 0.85rem);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ContributionStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${(props) => props.theme.border};
`;

const StatItem = styled.div`
  text-align: center;

  .value {
    font-size: clamp(1.2rem, 2.5vw, 1.5rem);
    font-weight: 700;
    color: ${(props) => props.theme.primary};
    display: block;
  }

  .label {
    font-size: clamp(0.75rem, 1.5vw, 0.85rem);
    color: ${(props) => props.theme.text}70;
    margin-top: 0.25rem;
  }
`;

const GitHubButton = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${(props) => props.theme.surface};
  color: ${(props) => props.theme.text};
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 500;
  font-size: clamp(0.9rem, 1.8vw, 1rem);
  border: 1px solid ${(props) => props.theme.border};
  transition: all 0.3s ease;

  &:hover {
    background: ${(props) => props.theme.primary};
    color: white;
    transform: translateY(-2px);
  }

  svg {
    font-size: 1.2em;
  }
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

const PaginationButton = styled(motion.button)`
  background: ${(props) =>
    props.active ? props.theme.primary : props.theme.surface};
  color: ${(props) => (props.active ? "white" : props.theme.text)};
  border: 1px solid
    ${(props) => (props.active ? props.theme.primary : props.theme.border)};
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-weight: 500;
  font-size: clamp(0.9rem, 1.8vw, 1rem);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 44px;
  justify-content: center;

  &:hover:not(:disabled) {
    background: ${(props) => props.theme.primary};
    color: white;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
`;

const PaginationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${(props) => props.theme.text}80;
  font-size: clamp(0.85rem, 1.5vw, 0.95rem);
  margin: 0 1rem;

  @media (max-width: 768px) {
    margin: 0 0.5rem;
    font-size: 0.8rem;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const StatCard = styled(motion.div)`
  background: ${(props) => props.theme.surface};
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  border: 1px solid ${(props) => props.theme.border};
  min-width: 140px;

  .stat-value {
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 700;
    color: ${(props) => props.theme.primary};
    display: block;
  }

  .stat-label {
    font-size: clamp(0.85rem, 1.5vw, 0.95rem);
    color: ${(props) => props.theme.text}70;
    margin-top: 0.5rem;
  }
`;

const ContactSection = styled(motion.section)`
  background: ${(props) => props.theme.surface};
  border-radius: 20px;
  padding: 3rem 2rem;
  text-align: center;
  margin-top: 4rem;
  border: 1px solid ${(props) => props.theme.border};
  box-shadow: 0 10px 30px ${(props) => props.theme.shadow}10;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    margin-top: 3rem;
  }
`;

const ContactTitle = styled.h3`
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  color: ${(props) => props.theme.text};
  margin-bottom: 1rem;
`;

const ContactButton = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: ${(props) => props.theme.gradient};
  color: white;
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: clamp(1rem, 2vw, 1.1rem);
  box-shadow: 0 8px 25px ${(props) => props.theme.primary}40;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px ${(props) => props.theme.primary}60;
  }
`;

const LoadingSpinner = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${(props) => props.theme.text}60;

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: ${(props) => props.theme.primary}40;
  }

  .empty-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .empty-description {
    font-size: 1rem;
    line-height: 1.6;
  }
`;

// Major Contributors (static)
const majorContributors = [
  {
    name: "Adithya Bhandari",
    description:
      "Adithya Bhandari played a pivotal role in kickstarting the resource collection for first-year students, laying the foundation for this platform's growth and impact.",
    github: "https://github.com/aditya-bhandari-cd23",
  },
  // Add more major contributors here as needed
];

// FileType display mapping
const fileTypeLabels = {
  Notes: "Notes",
  QP: "Question Papers",
  Other: "Other",
  Lab: "Lab Work",
  Textbook: "Textbooks",
};

const fileTypeOrder = ["Notes", "QP", "Lab", "Textbook", "Other"];

const Contributors = ({
  setShowAuthCard,
  showAuthCard,
  setDisableWorkSpace,
}) => {
  const [showContribute, setShowContribute] = useState(false);
  const { isAuthenticated, isLoading, user } = useAuth0();
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userRank, setUserRank] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredContributors, setFilteredContributors] = useState([]);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setDisableWorkSpace(false);
  }, []);

  useEffect(() => {
    getContributors();
  }, [user]);

  useEffect(() => {
    // Filter out major contributors from regular contributors
    const regularContributors = contributors
      .filter(
        (contributor) =>
          !majorContributors.some((mc) => mc.name === contributor.name)
      )
      .sort((a, b) => b.resources.length - a.resources.length);

    setFilteredContributors(regularContributors);
    setCurrentPage(1); // Reset to first page when contributors change
  }, [contributors]);

  const getContributors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/contribute/fetch`
      );
      if (res.data.success) {
        setContributors(res.data.contributors);

        // Calculate user rank if user is authenticated
        if (isAuthenticated && user) {
          const sortedContributors = [...res.data.contributors].sort(
            (a, b) => b.resources.length - a.resources.length
          );
          const userIndex = sortedContributors.findIndex(
            (contributor) => contributor.email === user.email
          );
          setUserRank(userIndex !== -1 ? userIndex + 1 : null);
        }
      } else {
        toast.error("Error fetching contributors");
      }
    } catch (error) {
      toast.error("Error fetching contributors");
    } finally {
      setLoading(false);
    }
  };

  // Helper: Count resources by fileType
  const getFileTypeCounts = (resources = []) => {
    const counts = { Notes: 0, QP: 0, Lab: 0, Textbook: 0, Other: 0 };
    resources.forEach((r) => {
      if (counts[r.fileType] !== undefined) counts[r.fileType]++;
    });
    return counts;
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaTrophy />;
    if (rank === 2) return <FaMedal />;
    if (rank === 3) return <FaAward />;
    return <FaStar />;
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredContributors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentContributors = filteredContributors.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Smooth scroll to contributors section with offset
    const contributorsSection = document.getElementById("contributors-section");
    if (contributorsSection) {
      const headerOffset = 100; // Adjust this value based on your header height
      const elementPosition = contributorsSection.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const getPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;

    if (totalPages <= maxVisibleButtons) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      // Show first page
      buttons.push(1);

      if (currentPage > 3) {
        buttons.push("...");
      }

      // Show current page and surrounding pages
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          buttons.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        buttons.push("...");
      }

      // Show last page
      if (totalPages > 1) {
        buttons.push(totalPages);
      }
    }

    return buttons;
  };

  // Calculate stats
  const totalResources = contributors.reduce(
    (sum, contributor) => sum + contributor.resources.length,
    0
  );

  return loading ? (
    <LoadingSpinner>
      <WaveLoader
        size="7em"
        primaryColor="hsl(220,90%,50%)"
        secondaryColor="hsl(300,90%,50%)"
      />
    </LoadingSpinner>
  ) : (
    <PageContainer>
      <Container>
        {/* Hero Section */}
        <HeroSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <MainTitle
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            Join Our Community
          </MainTitle>
          <Subtitle
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            Share your resources and help fellow students succeed. Every
            contribution makes a difference in building a stronger academic
            community.
          </Subtitle>
          <CTAButton
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whilehover={{ scale: 1.05 }}
            whiletap={{ scale: 0.95 }}
            onClick={() => {
              if (!isAuthenticated && !isLoading) {
                setShowAuthCard(!showAuthCard);
              } else {
                navigate("/contribute", { state: { userRank } });
              }
              // alert("Contributing will start soon!");
            }}
          >
            <FaHandshake />
            Start Contributing
          </CTAButton>
        </HeroSection>

        {/* Stats Section */}
        <StatsContainer>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <span className="stat-value">{contributors.length}</span>
            <div className="stat-label">Total Contributors</div>
          </StatCard>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <span className="stat-value">{totalResources}</span>
            <div className="stat-label">Resources Shared</div>
          </StatCard>
          <StatCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <span className="stat-value">{majorContributors.length}</span>
            <div className="stat-label">Major Contributors</div>
          </StatCard>
        </StatsContainer>

        {/* Major Contributors Section */}
        <Section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <SectionHeader>
            <SectionTitle
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FaTrophy />
              Major Contributors
            </SectionTitle>
            <SectionDescription
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              Recognizing the founding members who laid the foundation for our
              platform
            </SectionDescription>
          </SectionHeader>

          <MajorContributorsGrid>
            {majorContributors.map((contributor, idx) => (
              <MajorContributorCard
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: idx * 0.2,
                  type: "spring",
                  stiffness: 100,
                }}
                whilehover={{ y: -8 }}
              >
                <MajorContributorContent>
                  <MajorContributorName>
                    {contributor.name}
                  </MajorContributorName>
                  <MajorContributorDescription>
                    {contributor.description}
                  </MajorContributorDescription>
                  {contributor.github && (
                    <GitHubButton
                      href={contributor.github}
                      target="_blank"
                      whilehover={{ scale: 1.05 }}
                      whiletap={{ scale: 0.95 }}
                    >
                      <GitHub />
                      View GitHub
                    </GitHubButton>
                  )}
                </MajorContributorContent>
              </MajorContributorCard>
            ))}
          </MajorContributorsGrid>
        </Section>

        {/* Regular Contributors Section */}
        <Section
          id="contributors-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <SectionHeader>
            <SectionTitle
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FaUsers />
              Our Amazing Contributors
            </SectionTitle>
            <SectionDescription
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              Meet the dedicated community members who continuously help improve
              our platform
            </SectionDescription>
          </SectionHeader>

          {filteredContributors.length > 0 ? (
            <>
              <ContributorsGrid>
                {currentContributors.map((contributor, index) => {
                  const counts = getFileTypeCounts(contributor.resources);
                  const globalRank = startIndex + index + 1;

                  return (
                    <ContributorCard
                      key={`${contributor.name}-${globalRank}`} // Better key that includes rank
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.1,
                        type: "spring",
                        stiffness: 100,
                      }}
                      whilehover={{ y: -4 }}
                    >
                      <ContributorHeader>
                        <ContributorName>{contributor.name}</ContributorName>
                        <RankBadge rank={globalRank}>
                          {getRankIcon(globalRank)}#{globalRank}
                        </RankBadge>
                      </ContributorHeader>

                      <ContributionTags>
                        {fileTypeOrder.map((ft) =>
                          counts[ft] > 0 ? (
                            <ContributionTag key={ft} type={ft}>
                              {fileTypeLabels[ft]}: {counts[ft]}
                            </ContributionTag>
                          ) : null
                        )}
                      </ContributionTags>

                      <ContributionStats>
                        <StatItem>
                          <span className="value">
                            {contributor.resources.length}
                          </span>
                          <div className="label">Total Resources</div>
                        </StatItem>
                        {contributor.github && (
                          <GitHubButton
                            href={contributor.github}
                            target="_blank"
                            whilehover={{ scale: 1.05 }}
                            whiletap={{ scale: 0.95 }}
                          >
                            <GitHub />
                          </GitHubButton>
                        )}
                      </ContributionStats>
                    </ContributorCard>
                  );
                })}
              </ContributorsGrid>

              {/* Pagination */}
              {totalPages > 1 && (
                <PaginationWrapper>
                  <PaginationButton
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    whilehover={{ scale: 1.05 }}
                    whiletap={{ scale: 0.95 }}
                  >
                    <FaChevronLeft />
                  </PaginationButton>

                  {getPaginationButtons().map((button, index) => (
                    <PaginationButton
                      key={index}
                      active={button === currentPage}
                      onClick={() =>
                        typeof button === "number" && handlePageChange(button)
                      }
                      disabled={button === "..."}
                      whilehover={{ scale: button !== "..." ? 1.05 : 1 }}
                      whiletap={{ scale: button !== "..." ? 0.95 : 1 }}
                    >
                      {button}
                    </PaginationButton>
                  ))}

                  <PaginationButton
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    whilehover={{ scale: 1.05 }}
                    whiletap={{ scale: 0.95 }}
                  >
                    <FaChevronRight />
                  </PaginationButton>

                  <PaginationInfo>
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, filteredContributors.length)} of{" "}
                    {filteredContributors.length} contributors
                  </PaginationInfo>
                </PaginationWrapper>
              )}
            </>
          ) : (
            <EmptyState>
              <div className="empty-icon">
                <FaUsers />
              </div>
              <div className="empty-title">No Contributors Yet</div>
              <div className="empty-description">
                Be the first to contribute and help build our community!
              </div>
            </EmptyState>
          )}
        </Section>

        {/* Contact Section */}
        <ContactSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.2 }}
        >
          <ContactTitle>Want to Get in Touch?</ContactTitle>
          <ContactButton
            href="mailto:rvceutility@gmail.com"
            whilehover={{ scale: 1.05 }}
            whiletap={{ scale: 0.95 }}
          >
            Contact Us
          </ContactButton>
        </ContactSection>
      </Container>
    </PageContainer>
  );
};

export default Contributors;
