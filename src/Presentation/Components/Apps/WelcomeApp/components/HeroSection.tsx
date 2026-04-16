import { type FC } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Box, Text, Group, Button, Avatar, Image } from "@mantine/core";
import { FiLinkedin, FiGithub } from "react-icons/fi";
import { PROFILE } from "@/Shared/Constants/profileData";
import classes from "./HeroSection.module.css";
import Yo from "@public/Yo.jpg";

const HeroSection: FC = () => {
  const { t, i18n } = useTranslation("welcome");

  const handleDownloadCV = () => {
    const cvPath =
      i18n.language === "es" ? PROFILE.cvUrls.es : PROFILE.cvUrls.en;
    const base = import.meta.env.BASE_URL;
    window.open(`${base}${cvPath}`, "_blank");
  };

  const handleContactMe = () => {
    window.location.href = `mailto:${PROFILE.email}`;
  };

  return (
    <Box className={classes.hero} data-testid="hero-section">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <Avatar size={120} radius="xl" className={classes.avatar}>
          <Image src={Yo} />
        </Avatar>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <Text fw={700} size="xl" className={classes.name}>
          {PROFILE.name}
        </Text>
        <Text c="dimmed" size="lg">
          {t("hero.title")}
        </Text>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        <Group className={classes.links}>
          <a
            href={PROFILE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className={classes.iconLink}
          >
            <FiLinkedin size={28} />
          </a>
          <a
            href={PROFILE.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className={classes.iconLink}
          >
            <FiGithub size={26} />
          </a>
        </Group>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
      >
        <Group className={classes.actions}>
          <Button variant="filled" onClick={handleDownloadCV}>
            {t("hero.downloadCV")}
          </Button>
          <Button variant="light" onClick={handleContactMe}>
            {t("hero.contactMe")}
          </Button>
        </Group>
      </motion.div>
    </Box>
  );
};

export default HeroSection;
