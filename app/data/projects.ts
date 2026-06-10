export type ProjectStatus = "pending" | "approved" | "rejected";
export type ProjectVisibility = "public" | "private";

export type Project = {
  id: string;
  title: string;
  tags: string[];
  owner: string;
  ownerType: "individual" | "team";
  date: string;
  coverImage: string;
  description: string;
  demoLink?: string;
  pdf?: string;
  sourceZip?: string;
  dataset?: string;
  projectImages?: string[];
  status: ProjectStatus;
  reviewComment?: string;
  visibility: ProjectVisibility;
};

export const projects: Project[] = [
  {
    id: "1",
    title: "Distributed Sensor Network for Urban Monitoring",
    tags: ["Research", "IoT", "Sustainability"],
    owner: "Dr. Elena Rossi",
    ownerType: "individual",
    date: "Oct 12, 2023",
    coverImage:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    description:
      "A comprehensive study on deploying low-cost environmental sensors across metropolitan areas to monitor air quality, noise levels, and traffic patterns in real time.",
    pdf: "sensor-network-paper.pdf",
    sourceZip: "sensor-network-src.zip",
    dataset: "sensor-data.csv",
    status: "approved",
    visibility: "public",
  },
  {
    id: "2",
    title: "RaDiCe WMS: Core Architecture Redesign",
    tags: ["Development", "Database"],
    owner: "Marco Silva",
    ownerType: "individual",
    date: "Sep 28, 2023",
    coverImage:
      "https://images.unsplash.com/photo-1492724441997-5dc865305da7",
    description:
      "Optimizing system performance and implementing scalable microservice architecture for the RaDiCe warehouse management system, cutting query latency by 60%.",
    pdf: "radice-wms-paper.pdf",
    sourceZip: "radice-wms-src.zip",
    status: "approved",
    visibility: "public",
  },
  {
    id: "3",
    title: "Machine Learning in Logistics Optimization",
    tags: ["AI", "Logistics"],
    owner: "Sarah Chen",
    ownerType: "individual",
    date: "Aug 15, 2023",
    coverImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
    description:
      "Using gradient-boosted ML models to optimize warehouse routing and reduce operational costs. Deployed on a pilot warehouse and achieved a 22% reduction in pick-path distance.",
    pdf: "ml-logistics-paper.pdf",
    sourceZip: "ml-logistics-src.zip",
    dataset: "logistics-data.csv",
    status: "approved",
    visibility: "public",
  },
  {
    id: "4",
    title: "Blockchain-Based Academic Credential Verification",
    tags: ["Blockchain", "Security", "Web"],
    owner: "Lina Park / Kevin Torres / Mei Ling",
    ownerType: "team",
    date: "Apr 22, 2026",
    coverImage:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0",
    description:
      "A decentralized credential verification platform built on Ethereum smart contracts. Universities issue tamper-proof digital diplomas and employers verify credentials without intermediaries, reducing fraud by over 80% in simulated tests.",
    pdf: "blockchain-credentials.pdf",
    sourceZip: "blockchain-credentials-src.zip",
    status: "approved",
    reviewComment:
      "Excellent work. Well-documented and the smart contract code is clean.",
    visibility: "public",
  },
  {
    id: "5",
    title: "AI-Powered Inventory Forecasting System",
    tags: ["AI", "Logistics", "Research"],
    owner: "James Nguyen",
    ownerType: "individual",
    date: "Apr 28, 2026",
    coverImage:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d",
    description:
      "An AI-driven forecasting system to predict inventory shortages 30 days in advance using historical sales data, seasonal trends, and external market signals. Validated on a real warehouse dataset with 94% accuracy.",
    demoLink: "https://example.com/demo-inventory",
    pdf: "inventory-forecasting.pdf",
    sourceZip: "inventory-forecasting-src.zip",
    dataset: "inventory-data.csv",
    status: "pending",
    visibility: "private",
  },
  {
    id: "6",
    title: "Real-Time Sign Language Recognition via CNN",
    tags: ["AI", "Computer Vision", "Accessibility"],
    owner: "Priya Sharma",
    ownerType: "individual",
    date: "Apr 18, 2026",
    coverImage:
      "https://images.unsplash.com/photo-1509099652299-30938b0aeb63",
    description:
      "A CNN trained on 50,000 hand gesture images that translates ASL signs into text in real-time through a webcam feed. Achieves 91% top-1 accuracy on the test set.",
    demoLink: "https://example.com/sign-demo",
    pdf: "sign-language-cnn.pdf",
    sourceZip: "sign-language-src.zip",
    dataset: "gesture-dataset.zip",
    status: "rejected",
    reviewComment:
      "The concept is strong but the dataset documentation is incomplete. Please include data provenance and re-submit.",
    visibility: "private",
  },
  {
    id: "7",
    title: "IoT-Based Smart Campus Energy Management",
    tags: ["IoT", "Sustainability", "Embedded"],
    owner: "Ali Hassan / Sara Kim",
    ownerType: "team",
    date: "May 1, 2026",
    coverImage:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
    description:
      "A network of low-power sensors monitors electricity consumption across campus buildings in real-time. A web dashboard surfaces anomalies and recommends optimizations, projecting a 20% energy reduction.",
    pdf: "smart-campus-energy.pdf",
    sourceZip: "smart-campus-src.zip",
    dataset: "energy-readings.csv",
    status: "pending",
    visibility: "private",
  },
  {
    id: "8",
    title: "Adaptive E-Learning Platform with NLP Feedback",
    tags: ["NLP", "Education", "Web"],
    owner: "Marcus Webb",
    ownerType: "individual",
    date: "Apr 30, 2026",
    coverImage:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173",
    description:
      "An intelligent tutoring platform that analyzes student written responses with NLP models, identifies knowledge gaps, and automatically adjusts exercise difficulty. Pilot tested with 120 students over two semesters.",
    demoLink: "https://example.com/elearn-demo",
    pdf: "adaptive-elearning.pdf",
    sourceZip: "elearning-src.zip",
    dataset: "student-responses.csv",
    status: "pending",
    visibility: "private",
  },
];

export const publicProjects = projects.filter(
  (p) => p.visibility === "public",
);
export const privateProjects = projects.filter(
  (p) => p.visibility === "private",
);
