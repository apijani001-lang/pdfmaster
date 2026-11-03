"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Merge,
  Scissors,
  Minimize2,
  Image as ImageIcon,
  FileType,
  FileImage,
  FileOutput,
  ShieldCheck,
  Sparkles,
  Search,
  Moon,
  Sun,
  ArrowRight,
  Zap,
  LockKeyhole,
  Globe,
  Menu,
  X,
  WandSparkles,
} from "lucide-react";

const tools = [
  {
    name: "Merge PDF",
    description: "Combine multiple PDF files into one document.",
    icon: Merge,
    category: "Organize",
    color: "purple",
    href: "/tools/merge-pdf",
  },
  {
    name: "Split PDF",
    description: "Separate pages into individual PDF files.",
    icon: Scissors,
    category: "Organize",
    color: "blue",
    href: "/tools/split-pdf",
  },
  {
    name: "Compress PDF",
    description: "Reduce PDF file size while preserving quality.",
    icon: Minimize2,
    category: "Optimize",
    color: "green",
    href: "/tools/compress-pdf",
  },
  {
    name: "PDF to Word",
    description: "Convert PDF documents into editable Word files.",
    icon: FileType,
    category: "Convert",
    color: "orange",
    href: "/tools/pdf-to-word",
  },
  {
    name: "JPG to PDF",
    description: "Turn your images into professional PDF documents.",
    icon: ImageIcon,
    category: "Convert",
    color: "pink",
    href: "/tools/jpg-to-pdf",
  },
  {
    name: "PDF to JPG",
    description: "Convert PDF pages into high-quality JPG images.",
    icon: FileImage,
    category: "Convert",
    color: "blue",
    href: "/tools/pdf-to-jpg",
  },
  {
    name: "Word to PDF",
    description: "Convert Word documents into PDF files.",
    icon: FileOutput,
    category: "Convert",
    color: "indigo",
    href: "/tools/word-to-pdf",
  },
  {
    name: "Protect PDF",
    description: "Add password protection to your documents.",
    icon: ShieldCheck,
    category: "Security",
    color: "indigo",
    href: "/tools/protect-pdf",
  },
];

const categories = [
  "All Tools",
  "Organize",
  "Optimize",
  "Convert",
  "Security",
];

export default function Home() {
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Tools");
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All Tools" || tool.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <main>
      <header className="navbar">
        <Link href="/" className="brand">
          <span className="brand-icon">
            <FileText size={23} />
          </span>
          <span>
            PDF<span className="brand-purple">Master</span>
          </span>
        </Link>

        <nav className={`nav-links ${mobileMenu ? "mobile-open" : ""}`}>
          <a href="#tools" onClick={() => setMobileMenu(false)}>
            All Tools
          </a>
          <a href="#features" onClick={() => setMobileMenu(false)}>
            Features
          </a>
          <a href="#about" onClick={() => setMobileMenu(false)}>
            About
          </a>
          <a href="#footer" onClick={() => setMobileMenu(false)}>
            Contact
          </a>
        </nav>

        <div className="nav-actions">
          <button
            className="theme-button"
            onClick={() => setDark((current) => !current)}
            aria-label="Toggle dark mode"
            type="button"
          >
            {dark ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <button
            className="menu-button"
            onClick={() => setMobileMenu((current) => !current)}
            aria-label="Toggle menu"
            type="button"
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>

          <a href="#tools" className="nav-cta">
            Explore Tools <ArrowRight size={16} />
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-badge">
          <Sparkles size={15} />
          Your All-in-One PDF Workspace
        </div>

        <h1>
          Everything You Need
          <br />
          To Work With <span>PDFs.</span>
        </h1>

        <p className="hero-description">
          Edit, convert, merge and manage your PDF documents.
          Powerful tools with a simple and beautiful experience.
        </p>

        <div className="hero-search">
          <Search size={21} />

          <input
            type="search"
            placeholder="Search for a PDF tool..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCategory("All Tools");
              document.getElementById("tools")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          />

          <button
            type="button"
            onClick={() =>
              document.getElementById("tools")?.scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            Search Tools
          </button>
        </div>

        <div className="hero-trust">
          <span>
            <ShieldCheck size={16} /> Privacy-focused
          </span>
          <span>
            <Zap size={16} /> Simple workflow
          </span>
          <span>
            <LockKeyhole size={16} /> Secure processing
          </span>
        </div>
      </section>

      <section className="tools-section" id="tools">
        <div className="section-heading">
          <div>
            <span className="eyebrow">OUR PDF TOOLKIT</span>
            <h2>Explore PDF Tools</h2>
            <p>Everything you need, organized in one place.</p>
          </div>

          <span className="tool-count">{filteredTools.length} Tools</span>
        </div>

        <div className="category-list">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`category-button ${
                category === item ? "active" : ""
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="tool-grid">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;

            return (
              <article className="tool-card" key={tool.name}>
                <div className={`tool-icon ${tool.color}`}>
                  <Icon size={24} />
                </div>

                <span className="tool-category">{tool.category}</span>

                <h3>{tool.name}</h3>
                <p>{tool.description}</p>

                <Link href={tool.href} className="tool-coming">
                  Open Tool <ArrowRight size={15} />
                </Link>
              </article>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <div className="empty-state">
            <Search size={32} />
            <h3>No tools found</h3>
            <p>Try another search term.</p>
          </div>
        )}
      </section>

      <section className="features-section" id="features">
        <div className="section-heading centered">
          <span className="eyebrow">WHY PDFMASTER?</span>
          <h2>A Better Way to Work With PDFs</h2>
          <p>
            Designed around simplicity, privacy and productivity.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon">
              <Zap />
            </div>
            <h3>Fast Experience</h3>
            <p>Optimized tools designed for a smooth workflow.</p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">
              <LockKeyhole />
            </div>
            <h3>Privacy First</h3>
            <p>Browser-based processing wherever possible.</p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">
              <Globe />
            </div>
            <h3>Work Anywhere</h3>
            <p>A responsive experience across desktop and mobile.</p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">
              <WandSparkles />
            </div>
            <h3>Smart Features</h3>
            <p>
              Advanced PDF and AI capabilities planned for future stages.
            </p>
          </article>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-content">
          <span className="eyebrow">ONE COMPLETE WORKSPACE</span>
          <h2>Your Documents. Your Workflow.</h2>
          <p>
            PDFMaster aims to bring essential PDF utilities,
            intelligent document features and secure processing
            into one convenient platform.
          </p>

          <a href="#tools" className="primary-button">
            Discover Tools <ArrowRight size={17} />
          </a>
        </div>

        <div className="about-visual">
          <div className="about-file">
            <FileText size={65} />
            <strong>PDF</strong>
            <span>Your documents, simplified.</span>
          </div>

          <div className="floating-icon">
            <Sparkles />
          </div>
        </div>
      </section>

      <footer className="footer" id="footer">
        <Link href="/" className="brand">
          <span className="brand-icon">
            <FileText size={22} />
          </span>
          <span>
            PDF<span className="brand-purple">Master</span>
          </span>
        </Link>

        <p>Making document management simpler.</p>

        <div className="footer-bottom">
          © 2026 PDFMaster. All rights reserved.
        </div>
      </footer>
    </main>
  );
}