import React from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus } from "lucide-react";
import { Button } from "@mui/material";
import { useState } from "react";
import FileViewer from "./FileViewer";
import FeaturesSection from "./FeaturesSection";

const Section = styled(motion.section)`
  padding: 2rem;
  margin-bottom: 3rem;
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const NewsCard = styled(motion.div)`
  background: ${(props) => props.theme.surface};
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px ${(props) => props.theme.shadow}15;

  h3 {
    color: ${(props) => props.theme.text};
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .date {
    color: ${(props) => props.theme.text}99;
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  .content {
    color: ${(props) => props.theme.text}CC;
    line-height: 1.6;
  }
`;

const SuggestionsSection = styled(motion.div)`
  background: ${(props) => props.theme.surface};
  padding: 3rem 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 15px ${(props) => props.theme.shadow}15;
`;

const SuggestButton = styled(motion.a)`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 2rem;
  background: ${(props) => props.theme.gradient};
  color: white;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Resources = styled(NavLink)`
  display: inline-flex;
  align-items: center;
  margin-top: 2rem;
  padding: 0.75rem 2rem;
  background: ${(props) => props.theme.gradient};
  color: white;
  font-weight: 600;
  border-radius: 8px;
  text-decoration: none;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
  }
`;

const newsItems = [
  {
    title: "Code Contribution is Open !",
    date: "Febraury 06, 2025",
    content: "Welcome developers to contribute to RVCE Utility Portal.",
    url: "https://github.com/dath2006/RVCE-Utility",
  },
  {
    title: "Resources Contribution is Open.",
    date: "Febraury 02, 2025",
    content:
      "For temporary purpose upload, required files in the Google forms.",
    url: "https://docs.google.com/forms/d/e/1FAIpQLSdkXHB8g1byUNuY6Qrj3Hzkhnz2BM2Z9n_QnKMmHJvBpw3ygQ/viewform?usp=header",
  },
  {
    title: "Campus Placement Updates",
    date: "January 15, 2025",
    content: "......",
    url: "https://rvce-placements.vercel.app/placements/2025",
  },
];

export default function AfterVisit() {
  const [viewerFile, setViewerFile] = useState(null);
  return (
    <div className="max-w-7xl mx-auto mt-[8rem] px-4 py-8">
      {/* Welcome Section */}
      <div className="text-center mb-12">
        <h1 className={"text-4xl font-bold  mb-4"}>
          Welcome Back to RVCE Utility Portal
        </h1>
        <p className="text-xl text-gray-600">
          Your one-stop destination for all college resources and information
        </p>
        <Resources
          to="/resources"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Get Resources
        </Resources>
      </div>
      <Section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold mb-6">Latest Updates</h2>
        <NewsGrid>
          {newsItems.map((news, index) => (
            <NewsCard
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h3>{news.title}</h3>
              <p className="date">{news.date}</p>
              <p className="content">{news.content}</p>
              {news.url && (
                <Button
                  className="mt-1"
                  onClick={() => {
                    index === 2
                      ? setViewerFile(news.url)
                      : window.open(news.url);
                  }}
                >
                  Check Out !
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
      <div className="container mx-auto px-4 py-8">
        <FeaturesSection />
      </div>

      <SuggestionsSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-4">Help Us Improve</h2>
        <p className="mb-6 opacity-75">
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
