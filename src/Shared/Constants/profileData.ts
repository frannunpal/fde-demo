export const PROFILE = {
  name: 'Francisco Núñez Palomares',
  title: 'Fullstack Developer & DevOps',
  email: 'frannunpal@gmail.com',
  phone: '+34 600 275 210',
  location: 'Spain',
  linkedin: 'https://www.linkedin.com/in/francisco-núñez-palomares-74a484171/',
  github: 'https://github.com/frannunpal',
  cvUrls: {
    en: 'Desktop/CV_2026_EN_v4.pdf',
    es: 'Desktop/CV_2026_ES_v4.pdf',
  },
};

export const EXPERIENCE = [
  {
    company: 'MyNexoria',
    role: 'Fullstack Developer & DevOps',
    period: '2025 - Present',
    description: 'MVP solo: React, NestJS, PostgreSQL. 50 beta users, 2 pilots.',
    logo: '/Images/logos/mynexoria.png',
  },
  {
    company: 'Grupo MasMovil',
    role: 'Frontend Developer & DevOps',
    period: '2024 - 2025',
    description: 'Customer service management for MasOrange group (React, Kubernetes).',
    logo: '/Images/logos/masmovil.png',
  },
  {
    company: 'Ericsson',
    role: 'DevOps & Frontend Developer',
    period: '2022 - 2024',
    description: 'Microservices migration to Kubernetes/GCP for 5G deployment.',
    logo: '/Images/logos/ericsson.png',
  },
  {
    company: 'Kenmei Technologies',
    role: 'R&D Frontend Developer',
    period: '2019 - 2021',
    description: 'Data visualization for telecom with React & deck.gl.',
    logo: '/Images/logos/kenmei.png',
  },
  {
    company: 'Lexcontrol',
    role: 'Project Leader',
    period: '2016 - 2019',
    description: 'Compliance system, 85% frontend code, Scrum Master.',
    logo: '/Images/logos/lexcontrol.png',
  },
  {
    company: 'Grupo Criptana',
    role: 'Systems Admin & Odoo',
    period: '2016 - 2019',
    description: 'ERP implementation, React app, system administration.',
    logo: '/Images/logos/grupocriptana.png',
  },
  {
    company: 'Creatikos Estudio Creativo',
    role: 'Wordpress developer and Systems admin',
    period: '2012 - 2016',
    description: 'PHP. UI/UX Development, LAMP Stack',
    logo: '/Images/logos/creatikos.png',
  },
  {
    company: 'Ti53. S.L.',
    role: 'Web Designer and Systems admin',
    period: '2008 - 2012',
    description: 'Wordpress, Javascript. UI/UX Development, LAMP Stack',
    logo: '/Images/logos/ti53.png',
  },
];

export const SKILL_YEARS = [2008, 2010, 2012, 2014, 2016, 2018, 2019, 2021, 2022, 2024, 2025, 2026];

export const SKILLS = {
  technical: [
    {
      name: 'React / TypeScript',
      level: 95,
      history: [0, 0, 0, 0, 20, 50, 65, 80, 88, 93, 95, 95],
    },
    {
      name: 'Node / NestJS',
      level: 85,
      history: [0, 0, 0, 0, 15, 25, 30, 40, 60, 78, 85, 85],
    },
    {
      name: 'Kubernetes / Docker',
      level: 90,
      history: [0, 0, 0, 0, 10, 30, 42, 55, 72, 88, 90, 90],
    },
    {
      name: 'GCP / AWS',
      level: 80,
      history: [0, 0, 0, 0, 0, 5, 10, 20, 55, 74, 80, 80],
    },
    {
      name: 'SQLs',
      level: 85,
      history: [25, 35, 45, 52, 58, 63, 67, 73, 76, 83, 85, 85],
    },
    {
      name: 'Python / Django',
      level: 75,
      history: [0, 0, 0, 0, 8, 22, 32, 48, 58, 70, 75, 75],
    },
    {
      name: 'PHP',
      level: 20,
      history: [70, 80, 85, 82, 75, 50, 35, 25, 20, 20, 20, 20],
    },
    {
      name: 'WordPress / jQuery',
      level: 15,
      history: [60, 72, 80, 78, 70, 40, 25, 18, 15, 15, 15, 15],
    },
    {
      name: 'Odoo',
      level: 10,
      history: [0, 0, 0, 10, 40, 60, 55, 15, 10, 10, 10, 10],
    },
  ],
  soft: [
    {
      name: 'Team Leadership',
      level: 90,
      // Grew from Project Leader at Lexcontrol (2016) onwards
      history: [10, 20, 30, 45, 62, 72, 76, 82, 84, 88, 90, 90],
    },
    {
      name: 'Scrum Master',
      level: 95,
      // Scrum from Lexcontrol (2016), consolidated at MasMovil
      history: [0, 0, 0, 10, 42, 66, 76, 83, 88, 92, 95, 95],
    },
    {
      name: 'Product Owner',
      level: 85,
      // PO mindset from Kenmei (2019), peak at MyNexoria (solo MVP)
      history: [0, 0, 0, 0, 18, 38, 52, 64, 70, 78, 85, 85],
    },
    {
      name: 'Problem Solving',
      level: 90,
      // Constant growth since early career
      history: [40, 50, 60, 65, 70, 75, 78, 83, 85, 88, 90, 90],
    },
  ],
};

export const LANGUAGES = [
  { code: 'es', name: 'Spanish', level: 95, native: true },
  { code: 'en', name: 'English', level: 72, cert: 'B2' },
];

export const TECH_STACK = [
  { name: 'React', url: 'https://react.dev' },
  { name: 'TypeScript', url: 'https://www.typescriptlang.org' },
  { name: 'Mantine', url: 'https://mantine.dev' },
  { name: 'Node.js', url: 'https://nodejs.org/en' },
  { name: 'NestJS', url: 'https://nestjs.com' },
  { name: 'Python', url: 'https://www.python.org' },
  { name: 'Django', url: 'https://www.djangoproject.com' },
  { name: 'Kubernetes', url: 'https://kubernetes.io' },
  { name: 'Docker', url: 'https://www.docker.com' },
  { name: 'Helm', url: 'https://helm.sh' },
  { name: 'Jenkins', url: 'https://www.jenkins.io' },
  { name: 'GCP', url: 'https://cloud.google.com' },
  { name: 'AWS', url: 'https://aws.amazon.com' },
  { name: 'PostgreSQL', url: 'https://www.postgresql.org' },
  { name: 'MySQL', url: 'https://www.mysql.com' },
  { name: 'Firebase', url: 'https://firebase.google.com' },
  { name: 'Jest', url: 'https://jestjs.io' },
  { name: 'Testing Library', url: 'https://testing-library.com' },
  { name: 'SCSS', url: 'https://sass-lang.com' },
  { name: 'Tailwind', url: 'https://tailwindcss.com' },
  { name: 'Mantine', url: 'https://mantine.dev' },
  { name: 'deck.gl', url: 'https://deck.gl' },
  { name: 'Git', url: 'https://git-scm.com' },
  { name: 'Jira', url: 'https://www.atlassian.com/software/jira' },
];
