import React from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus, ArrowRight } from "lucide-react";
import { Button } from "@mui/material";
import { useState } from "react";
import FileViewer from "./FileViewer";
import FeaturesSection from "./FeaturesSection";
import { useUser } from "@clerk/clerk-react";

const HeroSection = styled.div`
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.primary} 0%,
    ${(props) => props.theme.secondary} 100%
  );
  padding: 4rem 2rem;
  border-radius: 20px;
  margin-bottom: 4rem;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
  }
`;

const Section = styled(motion.section)`
  padding: 1.5rem;
  margin-bottom: 3rem;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      ${(props) => props.theme.border || "rgba(0,0,0,0.1)"},
      transparent
    );
  }
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const NewsCard = styled(motion.div)`
  background: ${(props) => props.theme.surface};
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px ${(props) => props.theme.shadow}15;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid ${(props) => props.theme.border || "rgba(0,0,0,0.1)"};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: ${(props) => props.theme.gradient};
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.4s ease;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px ${(props) => props.theme.shadow}25;

    &::before {
      transform: scaleX(1);
    }
  }

  h3 {
    color: ${(props) => props.theme.text};
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    line-height: 1.3;
  }

  .date {
    color: ${(props) => props.theme.text}99;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .content {
    color: ${(props) => props.theme.text}CC;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
  }
`;

const SuggestionsSection = styled(motion.div)`
  background: linear-gradient(
    135deg,
    ${(props) => props.theme.surface} 0%,
    ${(props) => props.theme.surface}ee 100%
  );
  padding: 3rem 1.5rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px ${(props) => props.theme.shadow}15;
  border: 1px solid ${(props) => props.theme.border || "rgba(0,0,0,0.1)"};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at top right,
      ${(props) => props.theme.primary}10,
      transparent 70%
    );
    pointer-events: none;
  }
`;

const SuggestButton = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  padding: 0.875rem 2rem;
  background: ${(props) => props.theme.gradient};
  color: white;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  gap: 0.75rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px ${(props) => props.theme.primary}30;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${(props) => props.theme.primary}50;
  }
`;

const Resources = styled(NavLink)`
  display: inline-flex;
  align-items: center;
  margin-top: 1.5rem;
  padding: 0.875rem 2rem;
  background: white;
  color: ${(props) => props.theme.primary};
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  gap: 0.75rem;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${(props) => props.theme.primary}10;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);

    &::before {
      transform: translateX(0);
    }
  }

  @media (max-width: 726px) {
    font-size: 0.6rem;
    padding: 0.3rem 1.5rem;
  }
`;

const newsItems = [
  {
    title: "Resourse Contribution is Open !",
    date: "April 06, 2025",
    content: "Contibute college resources to the portal.",
  },
  {
    title: "Code Contribution is Open !",
    date: "Febraury 06, 2025",
    content: "Welcome developers to contribute to RVCE Utility Portal.",
    url: "https://github.com/dath2006/RVCE-Utility",
  },
  {
    title: "Campus Placement Updates",
    date: "January 15, 2025",
    content: "......",
    url: "https://rvce-placements.vercel.app/placements/2025",
  },
];

export default function AfterVisit({ showAuthCard, setShowAuthCard }) {
  const [viewerFile, setViewerFile] = useState(null);
  const { isLoaded, isSignedIn } = useUser();
  const [showAlert, setShowAlert] = useState(false);

  return (
    <div className="max-w-7xl mx-auto mt-[6rem] px-4 py-6">
      <HeroSection>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
        >
          Welcome Back to RVCE Utility Portal
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto"
        >
          Your one-stop destination for all college resources and information
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-7 justify-center"
        >
          <Resources
            to="/resources"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Resources
            <ArrowRight size={20} />
          </Resources>

          <Resources
            to={isSignedIn && isLoaded && "/attendance"}
            onClick={() => {
              if (!isSignedIn) {
                setShowAuthCard(!showAuthCard);
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Attendance
            <ArrowRight size={20} />
          </Resources>
        </motion.div>
      </HeroSection>

      <Section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Latest Updates
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">
            Stay informed with the latest news and announcements
          </p>
        </motion.div>
        <NewsGrid>
          {newsItems.map((news, index) => (
            <NewsCard
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h3>{news.title}</h3>
              <p className="date">
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                {news.date}
              </p>
              <p className="content">{news.content}</p>
              {news.url && (
                <Button
                  variant="contained"
                  size="small"
                  className="mt-2"
                  onClick={() => {
                    index === 2
                      ? setViewerFile(news.url)
                      : window.open(news.url);
                  }}
                >
                  Learn More
                </Button>
              )}
            </NewsCard>
          ))}
        </NewsGrid>
      </Section>

      <AnimatePresence>
        {viewerFile && (
          <FileViewer url={viewerFile} onClose={() => setViewerFile(null)} />
        )}
      </AnimatePresence>
      <div className="container mx-auto px-4 py-6">
        <FeaturesSection />
      </div>

      <SuggestionsSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Help Us Improve</h2>
        <p className="mb-6 text-base md:text-lg opacity-75 max-w-2xl mx-auto">
          We value your feedback! Help us make the RVCE Utility Portal better.
        </p>
        <SuggestButton
          href="https://docs.google.com/forms/d/121pZXqbozy2gAB2wo7KoadCt5MHWC3yZ7ZxzQmgtI3M/preview"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageSquarePlus size={20} />
          Give Suggestions
        </SuggestButton>
      </SuggestionsSection>
    </div>
  );
}
