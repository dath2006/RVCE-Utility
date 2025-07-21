import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus, ArrowRight } from "lucide-react";
import { Button } from "@mui/material";
import FileViewer from "./FileViewer";
import FeaturesSection from "./FeaturesSection";

import { useAuth0 } from "@auth0/auth0-react";
import Help from "./Help";
import axios from "axios";

// --- Aurora styled for theme ---
const AuroraBgStyled = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  .aurora__item {
    position: absolute;
    border-radius: 37% 29% 27% 27% / 28% 25% 41% 37%;
    filter: blur(80px);
    opacity: 0.4;
    mix-blend-mode: lighten;
    transition: background 0.3s, opacity 0.3s, filter 0.3s;
  }
  .aurora__item:nth-of-type(1) {
    top: -20%;
    left: -10%;
    width: 40vw;
    height: 40vw;
    background: ${({ theme }) => theme.primary};
    animation: aurora1 12s ease-in-out infinite alternate;
  }
  .aurora__item:nth-of-type(2) {
    top: -10%;
    right: -10%;
    width: 30vw;
    height: 30vw;
    background: ${({ theme }) => theme.secondary};
    animation: aurora2 14s ease-in-out infinite alternate;
  }
  .aurora__item:nth-of-type(3) {
    bottom: -20%;
    left: 0;
    width: 35vw;
    height: 35vw;
    background: ${({ theme }) => theme.gradient};
    animation: aurora3 10s ease-in-out infinite alternate;
  }
  .aurora__item:nth-of-type(4) {
    bottom: -30%;
    right: 0;
    width: 45vw;
    height: 45vw;
    background: ${({ theme }) => theme.surface};
    opacity: 0.2;
    animation: aurora4 18s ease-in-out infinite alternate;
  }
  @media (max-width: 640px) {
    .aurora__item {
      filter: blur(120px);
      opacity: 0.7;
    }
  }
  @keyframes aurora1 {
    0% {
      top: -20%;
      left: -10%;
    }
    100% {
      top: 10%;
      left: 10%;
    }
  }
  @keyframes aurora2 {
    0% {
      top: -10%;
      right: -10%;
    }
    100% {
      top: 20%;
      right: 20%;
    }
  }
  @keyframes aurora3 {
    0% {
      bottom: -20%;
      left: 0;
    }
    100% {
      bottom: 10%;
      left: 20%;
    }
  }
  @keyframes aurora4 {
    0% {
      bottom: -30%;
      right: 0;
    }
    100% {
      bottom: 0;
      right: 20%;
    }
  }
`;

const HeroSection = styled.div`
  background: ${({ theme }) =>
    `linear-gradient(120deg, ${theme.surface}cc 60%, ${theme.background}ee 100%)`};
  padding: 4rem 2rem;
  border-radius: 20px;
  margin-bottom: 4rem;
  color: ${({ theme }) => theme.text};
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px 0 ${({ theme }) => theme.shadow}22;
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
    padding: 0.6rem 1rem;
  }
`;

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  z-index: 2;
  display: flex;
  align-items: center;
`;
const CarouselTrack = styled.div`
  display: flex;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
`;
const CarouselSlide = styled(motion.div)`
  min-width: 100%;
  padding: 0 0.5rem;
  display: flex;
  justify-content: center;
`;
// News card: solid bg in light, semi in dark
const CarouselCard = styled.div`
  border-radius: 2rem;
  background: ${({ theme }) => theme.cardTheme};
  box-shadow: 0 4px 24px ${({ theme }) => theme.shadow}18;
  border: 1px solid ${({ theme }) => theme.border};
  padding: 2rem 1.5rem;
  margin: 0.5rem 0;
  position: relative;
  min-height: 220px;
  max-width: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  box-sizing: border-box;
`;
const Badge = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${({ theme }) => theme.primary};
  color: #fff;
  font-size: 0.8rem;
  padding: 0.3rem 0.9rem;
  border-radius: 999px;
  box-shadow: 0 2px 8px ${({ theme }) => theme.primary}44;
  z-index: 10;
`;
const DatePill = styled.span`
  display: inline-block;
  background: ${({ theme }) => theme.secondary + "22"};
  color: ${({ theme }) => theme.primary};
  font-weight: 600;
  font-size: 0.9rem;
  padding: 0.3rem 1rem;
  border-radius: 999px;
  margin-bottom: 0.7rem;
`;
const CarouselDot = styled.button`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ active, theme }) => (active ? theme.primary : theme.border)};
  margin: 0 0.2rem;
  border: none;
  transition: background 0.3s, transform 0.3s;
  transform: ${({ active }) => (active ? "scale(1.2)" : "scale(1)")};
`;
const CarouselArrow = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: ${({ theme }) => theme.surface + "cc"};
  color: ${({ theme }) => theme.text};
  border: none;
  border-radius: 50%;
  padding: 0.7rem;
  box-shadow: 0 2px 8px ${({ theme }) => theme.shadow}22;
  z-index: 10;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.primary + "cc"};
    color: #fff;
  }
  @media (max-width: 640px) {
    display: none;
  }
`;

const newsItems = [
  {
    title: "New Essentials Page",
    date: "April 06, 2025",
    content:
      "Here you will get all the necessities like quiz, grade calculator, holiday list and more",
  },
  {
    title: "Resourse Contribution is Open !",
    date: "April 06, 2025",
    content:
      "Goto contribute section and upload any notes, PYQ, etc.. which could be helpful for other.",
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

// --- Typewriter Effect ---
function useTypewriter(text, speed = 50, delay = 0) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    if (!text) return;
    let timeout;
    let i = 0;
    const type = () => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
        timeout = setTimeout(type, speed);
      }
    };
    timeout = setTimeout(type, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);
  return displayed;
}

// --- Aurora component using styled ---
const AuroraBg = () => (
  <AuroraBgStyled>
    <div className="aurora__item" />
    <div className="aurora__item" />
    <div className="aurora__item" />
    <div className="aurora__item" />
  </AuroraBgStyled>
);

// --- News Carousel using styled ---
const NewsCarousel = ({ newsItems }) => {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef();
  const carouselRef = useRef();
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;

  // Auto-slide
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % newsItems.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [newsItems.length]);

  // Swipe support (always enabled, but only arrows on desktop)
  useEffect(() => {
    const node = carouselRef.current;
    if (!node) return;
    let startX = null;
    const onTouchStart = (e) => {
      startX = e.touches[0].clientX;
    };
    const onTouchEnd = (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (dx > 40)
        setCurrent((prev) => (prev - 1 + newsItems.length) % newsItems.length);
      if (dx < -40) setCurrent((prev) => (prev + 1) % newsItems.length);
      startX = null;
    };
    node.addEventListener("touchstart", onTouchStart);
    node.addEventListener("touchend", onTouchEnd);
    return () => {
      node.removeEventListener("touchstart", onTouchStart);
      node.removeEventListener("touchend", onTouchEnd);
    };
  }, [newsItems.length]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {!isMobile && (
        <CarouselArrow
          style={{ left: 0, position: "static", marginRight: 12 }}
          onClick={() =>
            setCurrent(
              (prev) => (prev - 1 + newsItems.length) % newsItems.length
            )
          }
          aria-label="Previous news"
        >
          <ArrowRight style={{ transform: "rotate(180deg)" }} />
        </CarouselArrow>
      )}
      <CarouselContainer ref={carouselRef}>
        <div className="overflow-hidden" style={{ width: "100%" }}>
          <CarouselTrack
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {newsItems.map((news, idx) => (
              <CarouselSlide
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <CarouselCard>
                  {idx === 0 && <Badge>New</Badge>}
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <span role="img" aria-label="news">
                      📰
                    </span>{" "}
                    {news.title}
                  </h3>
                  <DatePill>{news.date}</DatePill>
                  <p style={{ color: "inherit", marginBottom: "1.2rem" }}>
                    {news.content}
                  </p>
                  {news.url && (
                    <Button
                      variant="contained"
                      size="small"
                      style={{ marginTop: 8 }}
                      onClick={() => window.open(news.url)}
                    >
                      Learn More
                    </Button>
                  )}
                </CarouselCard>
              </CarouselSlide>
            ))}
          </CarouselTrack>
        </div>
      </CarouselContainer>
      {!isMobile && (
        <CarouselArrow
          style={{ right: 0, position: "static", marginLeft: 12 }}
          onClick={() => setCurrent((prev) => (prev + 1) % newsItems.length)}
          aria-label="Next news"
        >
          <ArrowRight />
        </CarouselArrow>
      )}
      {/* Carousel Dots below */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: -28,
          display: "flex",
          justifyContent: "center",
          gap: 4,
        }}
      >
        {newsItems.map((_, idx) => (
          <CarouselDot
            key={idx}
            active={idx === current}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to news ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default function AfterVisit({ showAuthCard, setShowAuthCard }) {
  const [viewerFile, setViewerFile] = useState(null);
  const { isAuthenticated, isLoading, user } = useAuth0();
  const [msgId, setMsgId] = useState(
    localStorage.getItem("msgId") ? localStorage.getItem("msgId") : ""
  );
  const [data, setData] = useState(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const getMsg = async () => {
      const res = await axios.get(
        "https://raw.githubusercontent.com/RVCE-Utility/rvce-utility-file/refs/heads/main/infoCard.json"
      );
      setData(res.data[0]);
    };
    getMsg();
  }, []);

  const onClose = () => {
    setIsOpen(false);
    setMsgId(data.id);
    localStorage.setItem("msgId", data.id);
  };

  // Typewriter for headline
  const headline = useTypewriter(
    isAuthenticated && user?.name
      ? `Welcome back, ${user.name.split(" ")[0]}! 🚀`
      : "Welcome Back to RVCE Utility Portal",
    40,
    200
  );

  return (
    <div className="max-w-7xl mx-auto mt-[6rem] px-4 py-6">
      <HeroSection>
        <AuroraBg />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-6 leading-tight relative z-10"
        >
          {headline}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto relative z-10"
        >
          Your one-stop destination for all college resources and information
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 flex-wrap justify-center relative z-10"
        >
          <Resources
            to="/resources"
            whilehover={{ scale: 1.05 }}
            whiletap={{ scale: 0.95 }}
          >
            Get Resources
            <ArrowRight size={20} />
          </Resources>

          <Resources
            to={isAuthenticated && !isLoading && "/attendance"}
            onClick={() => {
              if (!isAuthenticated) {
                setShowAuthCard(!showAuthCard);
              }
            }}
            whilehover={{ scale: 1.05 }}
            whiletap={{ scale: 0.95 }}
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
        <NewsCarousel newsItems={newsItems} />
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
          whilehover={{ scale: 1.05 }}
          whiletap={{ scale: 0.95 }}
        >
          <MessageSquarePlus size={20} />
          Give Suggestions
        </SuggestButton>
      </SuggestionsSection>

      {data && msgId !== data.id && (
        <Help text={data.content} isOpen={isOpen} onClose={onClose} />
      )}
    </div>
  );
}
