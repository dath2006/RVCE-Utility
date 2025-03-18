import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { GitHub } from "@mui/icons-material";
import { FaUsers } from "react-icons/fa";

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 10rem;
  min-height: 100vh;
  background: ${(props) => props.theme.background};
  position: relative;
  overflow: hidden;

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
    margin-top: 5rem;
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
  box-shadow: 0 8px 32px ${(props) => props.theme.shadow}15;
  border: 1px solid ${(props) => props.theme.border};
  backdrop-filter: blur(10px);
  position: relative;
  transition: all 0.3s ease;

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
    box-shadow: 0 12px 40px ${(props) => props.theme.shadow}25;
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
  gap: 0.75rem;
  border: 1px solid ${(props) => props.theme.border};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px ${(props) => props.theme.shadow}10;
  }

  span {
    font-size: 1.4rem;
    font-weight: 700;
    color: ${(props) => props.theme.primary};
  }

  label {
    color: ${(props) => props.theme.text};
    opacity: 0.8;
    font-size: 1.1rem;
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
  padding: 1rem 2.5rem;
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

const contributors = [
  {
    name: "Adithya Bhandari",
    github: "https://github.com/aditya-bhandari-cd23",
  },
  {
    name: "Sreeharsha M S",
    resources: 21,
  },
  {
    name: "Anup Kothari",
    resources: 11,
  },
  {
    name: "Rahul H S",
    resources: 3,
  },
  {
    name: "Anarghya Hatti",
    resources: 1,
  },
];

const Contributors = () => {
  return (
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
        Our amazing community of contributors who have helped make this platform
        better. Join us in building a better learning experience for everyone.
      </Subtitle>

      <Grid>
        {contributors.map((contributor, index) => (
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
              <Name>{contributor.name}</Name>
              {contributor.description && (
                <Description>{contributor.description}</Description>
              )}
              <Stats>
                <span>{contributor.resources}</span>
                <label>Resources Contributed</label>
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
            Want to contribute?
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
  );
};

export default Contributors;
