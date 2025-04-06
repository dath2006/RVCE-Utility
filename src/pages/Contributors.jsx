import { useState, React, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GitHub } from "@mui/icons-material";
import { FaUsers } from "react-icons/fa";
import { FaHandshake } from "react-icons/fa";
import ViewContribution from "../components/ViewContribution";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";

const Container = styled.div`
  padding: 2rem;
  width: 70%;
  margin: 0 auto;
  height: fit-content;
  background: ${(props) => props.theme.background};
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  z-index: 1;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: radial-gradient(
      circle at top right,
      ${(props) => props.theme.primary}15,
      transparent 50%
    );
    pointer-events: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 1rem;
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  color: ${(props) => props.theme.text};
  margin-bottom: 3rem;
  text-align: center;
  font-weight: 800;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  svg {
    font-size: 2.5rem;
    color: ${(props) => props.theme.primary};
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: ${(props) => props.theme.gradient};
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  color: ${(props) => props.theme.text}80;
  font-size: 1.1rem;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
  padding: 1rem;
  position: relative;
  z-index: 1;
`;

const Card = styled(motion.div)`
  background: ${(props) => props.theme.surface};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 30px 32px ${(props) => props.theme.shadow}15;
  border: 1px solid ${(props) => props.theme.border};
  backdrop-filter: blur(10px);
  position: relative;
  transition: all 0.3s ease;
  z-index: -1;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${(props) => props.theme.gradient};
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }

  &:hover::before {
    transform: scaleX(1);
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px ${(props) => props.theme.shadowHover}25;
  }
`;

const Content = styled.div`
  padding: 2.5rem;
  text-align: center;
  position: relative;
`;

const Name = styled.h2`
  font-size: 2rem;
  margin-bottom: 1.5rem;
  background: ${(props) => props.theme.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
  position: relative;
  z-index: 1;
`;

const Description = styled.p`
  color: ${(props) => props.theme.text}80;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const Stats = styled.div`
  background: ${(props) => props.theme.background};
  padding: 1.25rem;
  border-radius: 12px;
  margin: 1.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  border: 1px solid ${(props) => props.theme.border};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px ${(props) => props.theme.shadow}10;
  }

  .stat-value {
    font-size: 1.4rem;
    font-weight: 700;
    color: ${(props) => props.theme.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 30px;
  }

  .stat-label {
    color: ${(props) => props.theme.text};
    opacity: 0.8;
    font-size: 1.1rem;
    text-align: left;
  }
`;

const Footer = styled.div`
  margin-top: 5rem;
  text-align: center;
  padding: 3rem 2rem;
  background: ${(props) => props.theme.surface};
  border-radius: 16px;
  border: 1px solid ${(props) => props.theme.border};
  box-shadow: 0 8px 32px ${(props) => props.theme.shadow}15;
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 1;
`;

const CallToAction = styled.a`
  display: inline-block;
  padding: 0.8rem 2rem;
  background: ${(props) => props.theme.gradient};
  color: white;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  box-shadow: 0 4px 15px ${(props) => props.theme.shadow}20;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px ${(props) => props.theme.shadow}30;
  }
`;

const IconLink = styled.a`
  color: ${(props) => props.theme.text};
  opacity: 0.7;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  background: ${(props) => props.theme.background};
  border: 1px solid ${(props) => props.theme.border};

  &:hover {
    opacity: 1;
    color: ${(props) => props.theme.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 15px ${(props) => props.theme.shadow}10;
  }

  svg {
    font-size: 1.75rem;
  }
`;

const Button = styled(motion.NavLink)`
  background: ${(props) => props.theme.surface};
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px ${(props) => props.theme.shadow}15;
  text-align: center;
  border: 1px solid ${(props) => props.theme.border};
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${(props) => props.theme.gradient};
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }

  &:hover::before {
    transform: scaleX(1);
  }

  h2 {
    font-size: 1.5rem;
    color: ${(props) => props.theme.text};
    margin: 0;
    font-weight: 600;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
    position: relative;
    z-index: 1000;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px ${(props) => props.theme.shadow}25;
  }

  @media (max-width: 768px) {
    padding: 1.25rem;

    h2 {
      font-size: 1.25rem;
    }
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 1.5rem;
  background: ${(props) => {
    if (props.rank === 1) return "linear-gradient(45deg, #FFD700, #FDB931)";
    if (props.rank === 2) return "linear-gradient(45deg, #C0C0C0, #A8A8A8)";
    if (props.rank === 3) return "linear-gradient(45deg, #CD7F32, #B87333)";
    return "transparent";
  }};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1));
`;

const LoadingSpinner = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;

  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const BadgeSVG = ({ rank }) => {
  // Different colors based on rank
  const colors = {
    1: {
      primary: "#FFD700",
      secondary: "#FDB931",
      shadow: "rgba(253, 185, 49, 0.6)",
    },
    2: {
      primary: "#C0C0C0",
      secondary: "#A8A8A8",
      shadow: "rgba(168, 168, 168, 0.6)",
    },
    3: {
      primary: "#CD7F32",
      secondary: "#B87333",
      shadow: "rgba(184, 115, 51, 0.6)",
    },
  };

  const { primary, secondary, shadow } = colors[rank];

  return (
    <svg width="30" height="30" viewBox="0 0 30 30">
      <defs>
        <linearGradient
          id={`badge-gradient-${rank}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor={primary} />
          <stop offset="100%" stopColor={secondary} />
        </linearGradient>
        <filter
          id={`glow-${rank}`}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feFlood floodColor={shadow} result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feComposite in="SourceGraphic" in2="shadow" operator="over" />
        </filter>
      </defs>
      <path
        d="M15 2.5L18.5 9.5L26 10.8L20.5 16.2L22 24L15 20.5L8 24L9.5 16.2L4 10.8L11.5 9.5L15 2.5Z"
        fill={`url(#badge-gradient-${rank})`}
        filter={`url(#glow-${rank})`}
      >
        <animate
          attributeName="opacity"
          values="1;0.8;1"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
};

const Contributors = ({
  setShowAuthCard,
  showAuthCard,
  setDisableWorkSpace,
}) => {
  const [showContribute, setShowContribute] = useState(false);
  const { isSignedIn, isLoaded } = useUser();
  const [contributors, setContributors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const setShow = () => {
      setDisableWorkSpace(false);
    };
    setShow();
  }, []);

  useEffect(() => {
    getContributors();
  }, []);

  const getContributors = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/contribute/fetch`
      );
      if (res.data.success) {
        setContributors(res.data.contributors);
      } else {
        toast.error("Error fetching contributors");
      }
    } catch (error) {
      console.error("Error fetching contributors:", error);
      toast.error("Error fetching contributors");
    } finally {
      setIsLoading(false);
    }
  };

  return isLoading ? (
    <LoadingSpinner animate={{ y: 0.1 }} exit={{ opacity: 0 }}>
      <div className="spinner" />
    </LoadingSpinner>
  ) : (
    <div className="flex flex-col flex-wrap max-w-[100vw] mt-24 justify-center items-center gap-8">
      <Container>
        <Title
          as={motion.h1}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FaHandshake />
          Want to contribute?
        </Title>
        <div className="flex justify-around gap-4">
          <Button
            className={
              isLoaded && !isSignedIn ? "cursor-pointer" : "cursor-pointer"
            }
            onClick={() => {
              if (!isSignedIn && isLoaded) {
                setShowAuthCard(!showAuthCard);
              } else {
                navigate("/contribute");
              }
            }}
          >
            Contribute Here
          </Button>
          {isSignedIn && (
            <Button
              className={"cursor-pointer"}
              onClick={() => setShowContribute(true)}
            >
              Your Contributations
            </Button>
          )}
        </div>
      </Container>
      {showContribute && (
        <div className="flex justify-center">
          <ViewContribution
            onClose={setShowContribute}
            isOpen={showContribute}
          />
        </div>
      )}
      <Container>
        <Title
          as={motion.h1}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FaUsers />
          Meet Our Contributors
        </Title>

        <Subtitle
          as={motion.p}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Our amazing community of contributors who have helped make this
          platform better. Join us in building a better learning experience for
          everyone.
        </Subtitle>

        <Grid>
          {contributors.length > 0 &&
            [...contributors]
              .sort((a, b) => {
                // Always keep "Adithya Bhandari" first
                if (a.name === "Adithya Bhandari") return -1;
                if (b.name === "Adithya Bhandari") return 1;
                // Sort others by resource count
                return b.resources - a.resources;
              })
              .map((contributor, index) => (
                <Card
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: index * 0.1,
                  }}
                >
                  <Content>
                    {index < 3 && (
                      <Badge>
                        <BadgeSVG rank={index + 1} />
                      </Badge>
                    )}
                    <Name>{contributor.name}</Name>
                    {contributor.description && (
                      <Description>{contributor.description}</Description>
                    )}
                    <Stats>
                      <div className="stat-value">
                        {contributor.name === "Adithya Bhandari" ? (
                          <AllInclusiveIcon />
                        ) : (
                          contributor.resources
                        )}
                      </div>
                      <div className="stat-label">Resources Contributed</div>
                    </Stats>
                    {contributor.github && (
                      <IconLink href={contributor.github} target="_blank">
                        <GitHub />
                      </IconLink>
                    )}
                  </Content>
                </Card>
              ))}
        </Grid>

        <Footer>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3
              style={{
                marginBottom: "1.5rem",
                fontSize: "1.75rem",
                color: (props) => props.theme.text,
                fontWeight: 600,
              }}
            >
              Reach me out here
            </h3>
            <CallToAction
              href="mailto:rvceutility@gmail.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get in Touch
            </CallToAction>
          </motion.div>
        </Footer>
      </Container>
    </div>
  );
};

export default Contributors;
