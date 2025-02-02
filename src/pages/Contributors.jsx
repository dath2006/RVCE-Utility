import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { GitHub, LinkedIn, Language } from "@mui/icons-material";

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  margin-top: 5rem;
`;

const Title = styled(motion.h1)`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 3rem;
  color: ${(props) => props.theme.text};

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 1rem;
`;
const Card = styled(motion.div)`
  background: ${(props) => props.theme.surface};
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 30px ${(props) => props.theme.shadow}15;
  border: 1px solid ${(props) => props.theme.border};
  backdrop-filter: blur(10px);
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 200px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Content = styled.div`
  padding: 2rem;
  text-align: center;
  position: relative;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${(props) => props.theme.gradient};
  }
`;

const Name = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  background: ${(props) => props.theme.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
`;

const Role = styled.p`
  color: ${(props) => props.theme.primary};
  margin-bottom: 1rem;
  font-weight: 500;
`;

const Description = styled.p`
  color: ${(props) => props.theme.text};
  line-height: 1.8;
  margin: 1.5rem 0;
  font-size: 1.1rem;
  opacity: 0.9;
`;

const Footer = styled.div`
  margin-top: 4rem;
  text-align: center;
  padding: 2rem;
  background: ${(props) => props.theme.surface};
  border-top: 1px solid ${(props) => props.theme.border};
`;

const CallToAction = styled.a`
  display: inline-block;
  padding: 0.8rem 2rem;
  background: ${(props) => props.theme.gradient};
  color: white;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px ${(props) => props.theme.shadow}40;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const IconLink = styled.a`
  color: ${(props) => props.theme.text};
  opacity: 0.7;
  transition: all 0.2s ease;

  &:hover {
    opacity: 1;
    color: ${(props) => props.theme.primary};
  }
`;

const contributors = [
  {
    name: "Adithya bhandari",
    description:
      "A shotout to this person and for all those who contributed the resources at github",
    github: "https://github.com",
  },
  // Add more contributors here
];

const Contributors = () => {
  return (
    <Container>
      <Title
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        Meet Our Contributors
      </Title>
      <Grid>
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.3 }}
        >
          <Content>
            <Name>Adithya Bhandari</Name>
            <Description>
              A shotout to this person and for all those who contributed the
              resources at github
            </Description>
            <IconLink
              href="https://github.com/aditya-bhandari-cd23"
              target="_blank"
            >
              <GitHub style={{ fontSize: "2rem" }} />
            </IconLink>
          </Content>
        </Card>
      </Grid>

      <Footer>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>
            Want to contribute?
          </h3>
          <CallToAction
            href="https://docs.google.com/forms/d/e/1FAIpQLSdkXHB8g1byUNuY6Qrj3Hzkhnz2BM2Z9n_QnKMmHJvBpw3ygQ/viewform?usp=header"
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
