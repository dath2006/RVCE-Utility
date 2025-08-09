import React, { useState } from "react";
import styled, { useTheme } from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Calculator,
  Calendar,
  Code,
  Heart,
  Scale,
  Play,
  Github,
  Mail,
  Star,
  Award,
  Languages,
  BookA,
} from "lucide-react";

import FileViewer from "../components/FileViewer";
import { useOverlay } from "../contexts/NavigationContext";

const EssentialsContainer = styled.div`
  min-height: 100vh;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.text};
  padding: 1.5rem;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  padding-top: 8rem;

  @media (max-width: 768px) {
    padding: 1rem;
    padding-top: 5rem;
    padding-bottom: 5rem;
  }
`;

const HeaderSection = styled(motion.div)`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  background: ${(props) => props.theme.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.text};
  opacity: 0.7;
  max-width: 500px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const Card = styled(motion.div)`
  background: ${(props) => props.theme.glassbgc};
  backdrop-filter: blur(10px);
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 25px ${(props) => props.theme.shadow}15;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 35px ${(props) => props.theme.shadowHover}25;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const CardIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${(props) => props.theme.gradient};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const CardDescription = styled.p`
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
  opacity: 0.8;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const QuizGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SubjectCard = styled(motion.div)`
  background: ${(props) =>
    props.selected ? props.theme.primary : props.theme.secondary};
  color: ${(props) => (props.selected ? "white" : props.theme.text)};
  padding: 1.25rem;
  border-radius: 12px;
  border: 2px solid
    ${(props) => (props.selected ? props.theme.primary : props.theme.border)};
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px ${(props) => props.theme.shadowHover}25;
    border-color: ${(props) => props.theme.primary};
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: ${(props) => props.theme.gradient};
    opacity: ${(props) => (props.selected ? 1 : 0)};
    transition: opacity 0.3s ease;
  }
`;

const SubjectIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.selected ? "white" : props.theme.primary)};
`;

const SubjectName = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const ChapterCount = styled.div`
  font-size: 0.75rem;
  opacity: 0.7;
  font-weight: 500;
`;

const ChaptersContainer = styled(motion.div)`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${(props) => props.theme.border};
`;

const ChaptersTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${(props) => props.theme.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChaptersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ChapterItem = styled(motion.div)`
  background: ${(props) => props.theme.surface};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 5px 15px ${(props) => props.theme.shadowHover}20;
    border-color: ${(props) => props.theme.primary};
  }

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: ${(props) => props.theme.gradient};
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const ChapterInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

const ChapterNumber = styled.div`
  width: 32px;
  height: 32px;
  background: ${(props) => props.theme.primary}20;
  color: ${(props) => props.theme.primary};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  flex-shrink: 0;
`;

const ChapterName = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${(props) => props.theme.text};
`;

const AttemptButton = styled(motion.button)`
  background: ${(props) => props.theme.primary};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &:hover {
    background: ${(props) => props.theme.accent};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const ActionButton = styled(motion.button)`
  width: 100%;
  background: ${(props) => props.theme.gradient};
  color: white;
  border: none;
  padding: 0.875rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px ${(props) => props.theme.shadowHover}30;
  }
`;

const ContributorInfo = styled.div`
  font-size: 0.8rem;
  color: ${(props) => props.theme.text};
  opacity: 0.7;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ContributorLink = styled(motion.a)`
  color: ${(props) => props.theme.primary};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const DeveloperSection = styled(motion.div)`
  grid-column: 1 / -1;
  background: ${(props) => props.theme.glassbgc};
  backdrop-filter: blur(10px);
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  margin-top: 1.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${(props) => props.theme.gradient};
  }
`;

const DeveloperTitle = styled(motion.h2)`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: ${(props) => props.theme.text};

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const DeveloperAvatar = styled(motion.div)`
  width: 70px;
  height: 70px;
  background: ${(props) => props.theme.gradient};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    font-size: 1.3rem;
  }
`;

const DeveloperName = styled(motion.h3)`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  background: ${(props) => props.theme.gradient};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const AnimatedName = styled(motion.span)`
  display: inline-block;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(270deg, #357abd, #8b5cf6, #ffb300, #357abd);
  background-size: 800% 800%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
`;

const DeveloperDept = styled.p`
  color: ${(props) => props.theme.primary};
  font-weight: 500;
  margin-bottom: 1rem;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const DeveloperMessage = styled.p`
  margin-bottom: 1.5rem;
  opacity: 0.8;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-size: 0.9rem;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const SecondaryButton = styled(motion.button)`
  background: transparent;
  color: ${(props) => props.theme.primary};
  border: 2px solid ${(props) => props.theme.primary};
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  font-size: 0.9rem;

  &:hover {
    background: ${(props) => props.theme.primary};
    color: white;
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.6rem 1rem;
  }
`;

const PrimaryButton = styled(ActionButton)`
  width: auto;
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.6rem 1rem;
  }
`;

const BASE_URL = "https://rvceutility-quizzes.netlify.app";

const subjects = {
  "Indian Constitution": {
    slug: "indian-constitution",
    icon: <Scale size={20} />,
    chapters: [
      { slug: "unit1", title: "Unit - 1" },
      { slug: "unit2", title: "Unit - 2" },
      { slug: "unit3", title: "Unit - 3" },
    ],
  },
  "Balake Kannada": {
    slug: "balake-kannada",
    icon: <BookA size={20} />,
    chapters: [
      { slug: "module1", title: "Module - 1" },
      { slug: "module2", title: "Module - 2" },
      { slug: "module3", title: "Module - 3" },
    ],
  },
  "Samskruthika Kannada": {
    slug: "samskruthika-kannada",
    icon: <Languages size={20} />,
    chapters: [
      { slug: "mankutimmana-kagga", title: "ಮಂಕುತಿಮ್ಮನ ಕಗ್ಗ" },
      { slug: "vachanagalu", title: "ವಚನಗಳು" },
      { slug: "kara-kusha", title: "ಕರಕುಶ" },
      {
        slug: "karnatakada-yekikarana",
        title: "ಕರ್ನಾಟಕದ ಏಕೀಕರಣ ಒಂದು ಅಪೂರ್ವ ಚರಿತ್",
      },
      { slug: "adalitha-bhashe-kannada", title: "ಆಡಳಿತ ಭಾಷೆಯಾಗಿ ಕನ್ನಡ" },
      { slug: "keertanegalu", title: "ಕೀರ್ತನೆಗಳು" },
      {
        slug: "vishveshwarayya",
        title: "ಡಾ. ವಿಶ್ವೇಶ್ವರಯ್ಯ: ವ್ಯಕ್ತಿ ಮತ್ತು ಐತಿಹ್ಯ",
      },
      { slug: "hosa-balina-geethe", title: "ಹೊಸ ಬಾಳಿನ ಗೀತೆ" },
      { slug: "pravasa-kathana", title: "ಪ್ರವಾಸ ಕಥನ" },
      { slug: "kurudu-kanchana", title: "ಕುರುಡು ಕಾಂಚಾಣಾ" },
    ],
  },
};

const Essentials = ({ theme }) => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedUrl, setSelectedUrl] = useState(null);

  useOverlay("essentials", !!selectedUrl);

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(selectedSubject === subject ? "" : subject);
  };

  const handleAttempt = (subjectSlug, chapterSlug) => {
    const url = `${BASE_URL}/${subjectSlug}/${chapterSlug}`;
    setSelectedUrl(url);
  };

  const handleGradeCalculator = () => {
    setSelectedUrl("https://rvce-grade-calculator.vercel.app");
  };

  const handleHolidayList = () => {
    setSelectedUrl(
      "https://drive.google.com/file/d/114-VW6q_W_XjTslyc90vCeFZV7oVdjUi/preview"
    );
  };

  const handleGithubStar = () => {
    window.open("https://github.com/dath2006/RVCE-Utility", "_blank");
  };

  const handleMailDeveloper = () => {
    window.open(
      "mailto:sathishdathds.cs24@rvce.edu.in?subject=Contributing to the site&body=Hi Sathish, I would like to contribute to the site...",
      "_blank"
    );
  };

  const handleContributorGithub = () => {
    window.open("https://github.com/VivaanHooda", "_blank");
  };

  return (
    <EssentialsContainer theme={theme}>
      <HeaderSection
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title theme={theme}>Essentials</Title>
        <Subtitle theme={theme}>
          Everything you need for academic success
        </Subtitle>
      </HeaderSection>

      <GridContainer>
        {/* Quiz Card occupies full row */}
        <Card
          theme={theme}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ gridColumn: "1 / -1" }}
        >
          <CardHeader>
            <CardIcon theme={theme}>
              <BookOpen size={20} />
            </CardIcon>
            <CardTitle>Subject Quizzes</CardTitle>
          </CardHeader>
          <CardDescription theme={theme}>
            Select a subject to explore available chapter quizzes and practice
            tests
          </CardDescription>

          <QuizGrid>
            {Object.entries(subjects).map(([subject, data]) => (
              <SubjectCard
                key={subject}
                theme={theme}
                selected={selectedSubject === subject}
                onClick={() => handleSubjectSelect(subject)}
                whilehover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <SubjectIcon
                  selected={selectedSubject === subject}
                  theme={theme}
                >
                  {data.icon}
                </SubjectIcon>
                <SubjectName>{subject}</SubjectName>
                <ChapterCount>{data.chapters.length} chapters</ChapterCount>
              </SubjectCard>
            ))}
          </QuizGrid>

          <AnimatePresence>
            {selectedSubject && (
              <ChaptersContainer
                theme={theme}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
              >
                <ChaptersTitle theme={theme}>
                  <BookOpen size={18} />
                  {selectedSubject} - Chapters
                </ChaptersTitle>

                <ChaptersList>
                  {subjects[selectedSubject].chapters.map((chapter, index) => (
                    <ChapterItem
                      key={index}
                      theme={theme}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <ChapterInfo>
                        <ChapterNumber theme={theme}>{index + 1}</ChapterNumber>
                        <ChapterName theme={theme}>{chapter.title}</ChapterName>
                      </ChapterInfo>

                      <AttemptButton
                        theme={theme}
                        onClick={() =>
                          handleAttempt(
                            subjects[selectedSubject].slug,
                            chapter.slug
                          )
                        }
                        whilehover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play size={14} />
                        Attempt
                      </AttemptButton>
                    </ChapterItem>
                  ))}
                </ChaptersList>
              </ChaptersContainer>
            )}
          </AnimatePresence>
        </Card>

        <Card
          theme={theme}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <CardHeader>
            <CardIcon theme={theme}>
              <Calculator size={20} />
            </CardIcon>
            <CardTitle>Grade Calculator</CardTitle>
          </CardHeader>
          <CardDescription theme={theme}>
            Calculate your GPA and track academic performance
          </CardDescription>
          <ContributorInfo theme={theme}>
            <Heart size={14} />
            <span>Contributed by</span>
            <ContributorLink
              theme={theme}
              href="#"
              onClick={handleContributorGithub}
              whilehover={{ scale: 1.05 }}
            >
              Vivaan Hooda
              <Github size={12} />
            </ContributorLink>
          </ContributorInfo>
          <ActionButton
            theme={theme}
            onClick={handleGradeCalculator}
            whileTap={{ scale: 0.98 }}
          >
            <Calculator size={16} />
            Calculate Grades
          </ActionButton>
        </Card>

        <Card
          theme={theme}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <CardHeader>
            <CardIcon theme={theme}>
              <Calendar size={20} />
            </CardIcon>
            <CardTitle>2025 Holiday List</CardTitle>
          </CardHeader>
          <CardDescription theme={theme}>
            View important holidays and academic breaks
          </CardDescription>
          <ActionButton
            theme={theme}
            onClick={handleHolidayList}
            whileTap={{ scale: 0.98 }}
          >
            <Calendar size={16} />
            View Holidays
          </ActionButton>
        </Card>

        <Card
          theme={theme}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <CardHeader>
            <CardIcon theme={theme}>
              <Award size={20} />
            </CardIcon>
            <CardTitle>Quick Tools</CardTitle>
          </CardHeader>
          <CardDescription theme={theme}>
            Access additional academic resources and tools
          </CardDescription>
          <ActionButton
            theme={theme}
            onClick={() => alert("More tools coming soon!")}
            whileTap={{ scale: 0.98 }}
          >
            <Award size={16} />
            Explore Tools
          </ActionButton>
        </Card>
      </GridContainer>

      <DeveloperSection
        theme={theme}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <DeveloperTitle
          theme={theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <Code
            size={24}
            style={{ display: "inline", marginRight: "0.5rem" }}
          />
          Developer Info
        </DeveloperTitle>

        <DeveloperAvatar
          theme={theme}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
          whilehover={{ scale: 1.1, rotate: 360 }}
        >
          SD
        </DeveloperAvatar>

        <DeveloperName
          theme={theme}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AnimatedName
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "linear",
            }}
          >
            Sathish Dath
          </AnimatedName>
        </DeveloperName>

        <DeveloperDept theme={theme}>
          Computer Science Engineering
        </DeveloperDept>

        <DeveloperMessage theme={theme}>
          If you appreciate my work and find this platform helpful, please
          consider giving a star to the GitHub project! I'm always looking for
          passionate contributors to help make this platform even better.
        </DeveloperMessage>

        <ButtonGroup>
          <SecondaryButton
            theme={theme}
            onClick={handleGithubStar}
            whileTap={{ scale: 0.95 }}
            whilehover={{ scale: 1.05 }}
          >
            <Github size={16} />
            <Star size={14} />
            Star Project
          </SecondaryButton>
          <PrimaryButton
            theme={theme}
            onClick={handleMailDeveloper}
            whileTap={{ scale: 0.95 }}
            whilehover={{ scale: 1.05 }}
          >
            <Mail size={16} />
            Join Contributors
          </PrimaryButton>
        </ButtonGroup>
      </DeveloperSection>

      <AnimatePresence>
        {selectedUrl && (
          <FileViewer url={selectedUrl} onClose={() => setSelectedUrl(null)} />
        )}
      </AnimatePresence>
    </EssentialsContainer>
  );
};

export default Essentials;
