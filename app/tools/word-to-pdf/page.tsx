
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  FileType,
  X,
  ArrowLeft,
  ArrowRight,
  Layers,
  HelpCircle,
} from "lucide-react";

const faqs = [
  {
    question: "How do I convert Word to PDF online?",
    answer:
      "Select your DOCX Word document, click Convert & Download PDF, and wait for the conversion to finish. Your PDF file will then be downloaded to your device.",
  },
  {
    question: "Which Word file format is supported?",
    answer:
      "This converter currently supports DOCX files. Older DOC files are not supported by this version.",
  },
  {
    question: "Is this Word to PDF converter free?",
    answer:
      "Yes. PDFMaster provides this Word to PDF conversion tool free to use without requiring an account.",
  },
  {
    question: "Are my Word documents uploaded to a server?",
    answer:
      "The conversion is performed in your browser. The selected DOCX file is processed locally by the conversion libraries used on this page.",
  },
  {
    question: "Will the original Word formatting be preserved?",
    answer:
      "This version extracts readable text from your DOCX document and creates a PDF from that text. Complex formatting, images, tables, headers and footers may not be preserved exactly.",
  },
  {
    question: "Can I convert a DOCX file on my phone?",
    answer:
      "You can use this page in a supported mobile browser. Select a DOCX document from your device and start the conversion.",
  },
  {
    question: "What happens if my Word document has no readable text?",
    answer:
      "The converter will display an error if it cannot find readable text in the document. Check that your DOCX file contains text and try again.",
  },
  {
    question: "Can I edit the PDF after conversion?",
    answer:
      "The downloaded PDF can be opened with a PDF reader. Editing its contents depends on the PDF editing software you use.",
  },
];

const relatedTools = [
  {
    title: "PDF to Word",
    description: "Convert PDF documents into Word files.",
    href: "/tools/pdf-to-word",
  },
  {
    title: "JPG to PDF",
    description: "Combine JPG and PNG images into a PDF.",
    href: "/tools/jpg-to-pdf",
  },
  {
    title: "PDF to JPG",
    description: "Convert PDF pages into JPG images.",
    href: "/tools/pdf-to-jpg",
  },
  {
    title: "Merge PDF",
    description: "Combine multiple PDF files into one.",
    href: "/tools/merge-pdf",
  },
  {
    title: "Split PDF",
    description: "Separate pages from a PDF document.",
    href: "/tools/split-pdf",
  },
  {
    title: "Compress PDF",
    description: "Reduce the size of PDF documents.",
    href: "/tools/compress-pdf",
  },
  {
    title: "Protect PDF",
    description: "Add password protection to PDF files.",
    href: "/tools/protect-pdf",
  },
];

export default function WordToPdfPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith(".docx")) {
      setError("Please select a valid Word DOCX file.");
      return;
    }

    setFile(selectedFile);
    setError("");
    setSuccess(false);
    setProgress(0);
  };

  const convertFile = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setSuccess(false);
    setProgress(15);

    try {
      const mammoth = await import("mammoth");
      const { jsPDF } = await import("jspdf");

      const arrayBuffer = await file.arrayBuffer();

      setProgress(35);

      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value?.trim();

      if (!text) {
        throw new Error(
          "No readable text was found in this Word document."
        );
      }

      setProgress(55);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 18;
      const usableWidth = pageWidth - margin * 2;
      const lineHeight = 7;

      let y = 20;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(11);
      pdf.setTextColor(35, 45, 65);

      const paragraphs = text.split(/\n+/);

      for (const paragraph of paragraphs) {
        const trimmed = paragraph.trim();

        if (!trimmed) {
          y += 4;
          continue;
        }

        const lines = pdf.splitTextToSize(trimmed, usableWidth);

        for (const line of lines) {
          if (y + lineHeight > pageHeight - margin) {
            pdf.addPage();
            y = 20;
          }

          pdf.text(line, margin, y);
          y += lineHeight;
        }

        y += 3;
      }

      setProgress(90);

      const outputName =
        file.name.replace(/\.docx$/i, "") + ".pdf";

      pdf.save(outputName);

      setProgress(100);
      setSuccess(true);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Conversion failed. Please try another DOCX file."
      );
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setError("");
    setSuccess(false);
    setProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const primaryButton: React.CSSProperties = {
    width: "100%",
    minHeight: 54,
    padding: "14px 20px",
    border: "none",
    borderRadius: 13,
    background: loading
      ? "#b9a4dc"
      : "linear-gradient(135deg, #7542d8, #6030c4)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: loading ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    boxShadow: "0 7px 18px rgba(117,66,216,0.18)",
  };

  return (
    <main className="word-page">
      <div className="word-container">
        <Link href="/" className="word-back-link">
          <ArrowLeft size={18} />
          Back to PDFMaster
        </Link>

        <header className="word-hero">
          <div className="word-hero-icon">
            <FileType size={35} />
          </div>

          <div className="word-eyebrow">FREE ONLINE PDF TOOL</div>

          <h1>Word to PDF Converter</h1>

          <p>
            Convert Word DOCX documents into PDF files online.
            Select your document, create a PDF and download it
            directly to your device with our easy-to-use converter.
          </p>
        </header>

        <section className="word-workspace">
          <div className="word-workspace-heading">
            <h2>Upload Word Document</h2>
            <p>Select a DOCX file from your device</p>
          </div>

          {!file ? (
            <div
              className="word-upload-box"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleFile(event.dataTransfer.files?.[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Select or drop a Word DOCX document"
            >
              <div className="word-upload-icon">
                <Upload size={28} />
              </div>

              <strong>Click to select Word file</strong>

              <span>
                Or drag and drop your DOCX document here
              </span>

              <span className="word-browse-button">
                Browse Files
              </span>

              <small>Supported format: .DOCX</small>
            </div>
          ) : (
            <div className="word-selected-file">
              <div className="word-file-details">
                <div className="word-file-icon">
                  <FileText size={25} />
                </div>

                <div className="word-file-name">
                  <strong>{file.name}</strong>
                  <span>
                    {formatSize(file.size)} · DOCX document
                  </span>
                </div>

                <button
                  type="button"
                  onClick={reset}
                  disabled={loading}
                  aria-label="Remove file"
                  className="word-remove-button"
                >
                  <X size={18} />
                </button>
              </div>

              {loading && (
                <div className="word-progress">
                  <div className="word-progress-label">
                    <span>Converting document...</span>
                    <span>{progress}%</span>
                  </div>

                  <div className="word-progress-track">
                    <div
                      className="word-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {success && (
                <div className="word-success">
                  <CheckCircle2 size={19} />
                  PDF downloaded successfully!
                </div>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".docx"
            hidden
            onChange={(event) => {
              handleFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />

          {error && (
            <div className="word-error" role="alert">
              <AlertCircle size={19} />
              {error}
            </div>
          )}

          {file && (
            <div className="word-action-buttons">
              <button
                type="button"
                onClick={convertFile}
                disabled={loading}
                style={primaryButton}
              >
                {loading ? (
                  <>
                    <RefreshCw className="word-spinner" size={19} />
                    Converting...
                  </>
                ) : (
                  <>
                    <Download size={19} />
                    Convert & Download PDF
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={reset}
                disabled={loading}
                className="word-reset-button"
              >
                Reset
              </button>
            </div>
          )}

          <div className="word-privacy-note">
            <ShieldCheck size={15} />
            Your document is processed in your browser.
          </div>
        </section>

        <section className="word-features">
          <article>
            <ShieldCheck size={24} />
            <h3>Browser Processing</h3>
            <p>
              Your selected document is processed locally in your browser.
            </p>
          </article>

          <article>
            <Zap size={24} />
            <h3>Simple Conversion</h3>
            <p>
              Convert your DOCX document through a straightforward workflow.
            </p>
          </article>

          <article>
            <FileText size={24} />
            <h3>PDF Download</h3>
            <p>
              Save the generated PDF document directly to your device.
            </p>
          </article>
        </section>

        <section className="word-seo-content">
          <div className="word-section-heading">
            <span>PDFMASTER DOCUMENT CONVERTER</span>
            <h2>Convert Word to PDF Online for Free</h2>
            <p>
              Need to turn a Word document into a PDF? PDFMaster
              provides a simple online Word to PDF converter for
              supported DOCX files. Select a document, start the
              conversion and download the generated PDF without
              installing desktop conversion software.
            </p>
          </div>

          <div className="word-info-grid">
            <article className="word-info-card">
              <div className="word-info-icon">
                <FileType size={22} />
              </div>
              <h3>DOCX to PDF Conversion</h3>
              <p>
                Convert supported Microsoft Word DOCX documents
                into PDF format. The converter extracts readable
                text and places it into a downloadable PDF file.
              </p>
            </article>

            <article className="word-info-card">
              <div className="word-info-icon">
                <Zap size={22} />
              </div>
              <h3>Easy Online Workflow</h3>
              <p>
                Choose your Word document, start conversion and
                download the result. The simple interface makes
                the process easy to follow.
              </p>
            </article>

            <article className="word-info-card">
              <div className="word-info-icon">
                <ShieldCheck size={22} />
              </div>
              <h3>Local Browser Processing</h3>
              <p>
                The conversion libraries process the selected
                document in your browser. This page does not
                upload your DOCX file to a conversion server.
              </p>
            </article>

            <article className="word-info-card">
              <div className="word-info-icon">
                <Download size={22} />
              </div>
              <h3>Download Your PDF</h3>
              <p>
                Once conversion is complete, the generated PDF
                is saved through your browser's download feature.
              </p>
            </article>
          </div>

          <div className="word-how-to">
            <h2>How to Convert Word to PDF</h2>
            <p>
              Follow these steps to convert a DOCX document into PDF format.
            </p>

            <div className="word-steps">
              <article className="word-step">
                <span>01</span>
                <div>
                  <h3>Upload Your Word Document</h3>
                  <p>
                    Click Browse Files or drag and drop a supported
                    DOCX document into the upload area.
                  </p>
                </div>
              </article>

              <article className="word-step">
                <span>02</span>
                <div>
                  <h3>Start the Conversion</h3>
                  <p>
                    Click Convert & Download PDF. The converter
                    extracts readable text and prepares your PDF.
                  </p>
                </div>
              </article>

              <article className="word-step">
                <span>03</span>
                <div>
                  <h3>Download Your PDF File</h3>
                  <p>
                    When conversion finishes, your generated PDF
                    is downloaded to your device.
                  </p>
                </div>
              </article>
            </div>
          </div>

          <div className="word-uses">
            <h2>Why Convert Word Documents to PDF?</h2>
            <p>
              PDF files are commonly used when sharing documents
              across different devices and operating systems.
              A PDF can be convenient for distributing a document
              in a widely supported file format.
            </p>

            <ul>
              <li>Share text documents in a widely supported format.</li>
              <li>Keep a separate PDF copy of a Word document.</li>
              <li>Prepare text-based documents for digital distribution.</li>
              <li>Open PDF documents with common PDF reader applications.</li>
              <li>Organize converted documents for convenient sharing.</li>
            </ul>
          </div>

          <div className="word-limitations">
            <div className="word-limitations-icon">
              <HelpCircle size={22} />
            </div>
            <div>
              <h3>Important: Understand This Converter</h3>
              <p>
                This version extracts readable text from DOCX documents
                and creates a PDF from that text. Complex formatting,
                pictures, tables, headers and footers may not be
                preserved exactly. The output is not intended to be
                a pixel-perfect copy of the original Word document.
              </p>
            </div>
          </div>

          <div className="word-faq-section">
            <div className="word-section-heading">
              <span>HELP & SUPPORT</span>
              <h2>Frequently Asked Questions</h2>
              <p>
                Common questions about converting Word DOCX files
                into PDF documents.
              </p>
            </div>

            <div className="word-faq-list">
              {faqs.map((faq, index) => (
                <details className="word-faq-item" key={index}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="word-related">
          <div className="word-section-heading">
            <span>MORE PDFMASTER TOOLS</span>
            <h2>Explore More Free PDF Tools</h2>
            <p>
              Use other PDFMaster tools to work with your documents
              and images online.
            </p>
          </div>

          <div className="word-related-grid">
            {relatedTools.map((tool) => (
              <Link
                href={tool.href}
                className="word-related-card"
                key={tool.href}
              >
                <div>
                  <h3>{tool.title}</h3>
                  <p>{tool.description}</p>
                </div>
                <ArrowRight size={19} />
              </Link>
            ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        .word-page {
          min-height: 100vh;
          padding: 35px 18px 80px;
          background: radial-gradient(
            ellipse at 50% 0%,
            #f0eaff 0%,
            #f8f7fc 48%,
            #f8f7fc 100%
          );
          color: #211b32;
        }

        .word-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .word-back-link {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #7542d8;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 38px;
        }

        .word-hero {
          text-align: center;
          margin-bottom: 34px;
        }

        .word-hero-icon {
          width: 76px;
          height: 76px;
          margin: 0 auto 19px;
          border-radius: 23px;
          background: linear-gradient(135deg, #eee5ff, #e4d7ff);
          color: #7542d8;
          display: grid;
          place-items: center;
          box-shadow: 0 8px 25px rgba(117, 66, 216, 0.1);
        }

        .word-eyebrow {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 30px;
          background: #eee7fb;
          color: #7542d8;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.2px;
          margin-bottom: 13px;
        }

        .word-hero h1 {
          font-size: clamp(29px, 5vw, 42px);
          line-height: 1.15;
          letter-spacing: -1.2px;
          font-weight: 800;
          margin: 0 0 13px;
          color: #211b32;
        }

        .word-hero p {
          max-width: 620px;
          margin: 0 auto;
          color: #777184;
          font-size: 15px;
          line-height: 1.8;
        }

        .word-workspace {
          box-sizing: border-box;
          width: 100%;
          background: #fff;
          border: 1px solid #e9e3f1;
          border-radius: 22px;
          padding: clamp(18px, 4vw, 32px);
          box-shadow: 0 15px 45px rgba(40, 20, 80, 0.07);
        }

        .word-workspace-heading {
          text-align: center;
          margin-bottom: 22px;
        }

        .word-workspace-heading h2 {
          font-size: 18px;
          font-weight: 800;
          margin: 0;
          color: #282039;
        }

        .word-workspace-heading p {
          color: #888195;
          font-size: 13px;
          margin: 7px 0 0;
        }

        .word-upload-box {
          min-height: 190px;
          box-sizing: border-box;
          border: 2px dashed #cbb8ed;
          border-radius: 16px;
          cursor: pointer;
          background: #fbf9ff;
          padding: 28px 18px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: 0.2s;
        }

        .word-upload-box:hover {
          border-color: #7542d8;
          background: #f7f2ff;
        }

        .word-upload-icon {
          width: 58px;
          height: 58px;
          border-radius: 17px;
          background: #eee5ff;
          color: #7542d8;
          display: grid;
          place-items: center;
          margin-bottom: 13px;
        }

        .word-upload-box strong {
          font-size: 16px;
          color: #302641;
        }

        .word-upload-box > span:not(.word-browse-button) {
          color: #888195;
          font-size: 13px;
          margin-top: 7px;
        }

        .word-browse-button {
          display: inline-block;
          margin-top: 15px;
          padding: 9px 18px;
          border-radius: 10px;
          background: #7542d8;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
        }

        .word-upload-box small {
          color: #9991a5;
          font-size: 11px;
          margin-top: 12px;
        }

        .word-selected-file {
          border: 1px solid #eee9f5;
          border-radius: 15px;
          padding: 16px;
          background: #fbf9ff;
        }

        .word-file-details {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .word-file-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #eee5ff;
          color: #7542d8;
          display: grid;
          place-items: center;
        }

        .word-file-name {
          flex: 1 1 180px;
          min-width: 0;
          text-align: left;
        }

        .word-file-name strong {
          display: block;
          color: #302641;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .word-file-name span {
          display: block;
          color: #888195;
          font-size: 12px;
          margin-top: 5px;
        }

        .word-remove-button {
          width: 36px;
          height: 36px;
          border: 1px solid #eee9f5;
          border-radius: 9px;
          background: #fff;
          color: #dc4444;
          display: grid;
          place-items: center;
          cursor: pointer;
        }

        .word-remove-button:disabled {
          cursor: not-allowed;
          opacity: 0.4;
        }

        .word-progress {
          margin-top: 22px;
        }

        .word-progress-label {
          display: flex;
          justify-content: space-between;
          color: #7542d8;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 9px;
        }

        .word-progress-track {
          height: 8px;
          overflow: hidden;
          border-radius: 20px;
          background: #eee7fb;
        }

        .word-progress-fill {
          height: 100%;
          border-radius: 20px;
          background: linear-gradient(90deg, #7542d8, #9b6bea);
          transition: width 0.3s ease;
        }

        .word-success,
        .word-error {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          margin-top: 18px;
          padding: 13px;
          border-radius: 11px;
          font-size: 13px;
          text-align: center;
        }

        .word-success {
          background: #ecfdf3;
          border: 1px solid #bbf7d0;
          color: #167344;
          font-weight: 700;
        }

        .word-error {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: #be123c;
          margin-top: 20px;
        }

        .word-action-buttons {
          display: flex;
          flex-direction: column;
          gap: 11px;
          margin-top: 22px;
        }

        .word-reset-button {
          width: 100%;
          min-height: 47px;
          border: 1px solid #e9e2f3;
          border-radius: 12px;
          background: #fff;
          color: #7542d8;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .word-reset-button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .word-privacy-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 19px;
          color: #898195;
          font-size: 12px;
          text-align: center;
        }

        .word-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 13px;
          margin-top: 22px;
        }

        .word-features article {
          background: #fff;
          border: 1px solid #eee9f5;
          border-radius: 14px;
          padding: 20px 17px;
          text-align: center;
        }

        .word-features article > svg {
          color: #7542d8;
        }

        .word-features h3 {
          display: block;
          color: #302641;
          font-size: 13px;
          margin: 11px 0 7px;
        }

        .word-features p {
          color: #888195;
          font-size: 12px;
          line-height: 1.7;
          margin: 0;
        }

        .word-seo-content {
          margin-top: 70px;
        }

        .word-section-heading {
          max-width: 760px;
          margin: 0 auto 28px;
          text-align: center;
        }

        .word-section-heading > span {
          color: #7542d8;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.7px;
        }

        .word-section-heading h2 {
          color: #211b32;
          font-size: clamp(24px, 4vw, 33px);
          font-weight: 850;
          letter-spacing: -0.7px;
          margin: 12px 0;
        }

        .word-section-heading p {
          color: #777184;
          font-size: 14px;
          line-height: 1.9;
          margin: 0;
        }

        .word-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .word-info-card {
          padding: 23px;
          border: 1px solid #eee9f5;
          border-radius: 16px;
          background: #fff;
        }

        .word-info-icon {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #f1eaff;
          color: #7542d8;
        }

        .word-info-card h3 {
          color: #302641;
          font-size: 16px;
          margin: 15px 0 8px;
        }

        .word-info-card p {
          color: #777184;
          font-size: 13px;
          line-height: 1.8;
          margin: 0;
        }

        .word-how-to,
        .word-uses,
        .word-faq-section {
          margin-top: 40px;
          padding: 27px;
          border: 1px solid #eee9f5;
          border-radius: 17px;
          background: #fff;
        }

        .word-how-to > h2,
        .word-uses > h2 {
          color: #211b32;
          font-size: 23px;
          font-weight: 850;
          margin: 0 0 9px;
        }

        .word-how-to > p,
        .word-uses > p {
          color: #777184;
          font-size: 13px;
          line-height: 1.8;
          margin: 0 0 22px;
        }

        .word-steps {
          display: grid;
          gap: 18px;
        }

        .word-step {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }

        .word-step > span {
          flex: 0 0 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #eee5ff;
          color: #7542d8;
          font-size: 13px;
          font-weight: 900;
        }

        .word-step h3 {
          color: #302641;
          font-size: 15px;
          margin: 2px 0 5px;
        }

        .word-step p {
          color: #777184;
          font-size: 13px;
          line-height: 1.8;
          margin: 0;
        }

        .word-uses ul {
          display: grid;
          gap: 11px;
          padding-left: 22px;
          margin: 0;
          color: #555066;
          font-size: 13px;
          line-height: 1.7;
        }

        .word-limitations {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          margin-top: 25px;
          padding: 22px;
          border: 1px solid #f3dfb1;
          border-radius: 15px;
          background: #fff9eb;
        }

        .word-limitations-icon {
          color: #a16a1a;
          flex-shrink: 0;
        }

        .word-limitations h3 {
          color: #8a5a12;
          font-size: 14px;
          font-weight: 800;
          margin: 0 0 8px;
        }

        .word-limitations p {
          color: #876b3e;
          font-size: 12px;
          line-height: 1.8;
          margin: 0;
        }

        .word-faq-section {
          padding: 27px;
        }

        .word-faq-section .word-section-heading {
          margin-bottom: 23px;
        }

        .word-faq-list {
          display: grid;
          gap: 11px;
        }

        .word-faq-item {
          padding: 16px 18px;
          border: 1px solid #e9e3f1;
          border-radius: 12px;
          background: #fcfbff;
        }

        .word-faq-item summary {
          color: #302641;
          font-size: 14px;
          font-weight: 750;
          line-height: 1.6;
          cursor: pointer;
        }

        .word-faq-item p {
          color: #777184;
          font-size: 13px;
          line-height: 1.8;
          margin: 12px 0 0;
        }

        .word-related {
          margin-top: 70px;
        }

        .word-related-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 13px;
        }

        .word-related-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px;
          border: 1px solid #eee9f5;
          border-radius: 14px;
          background: #fff;
          color: #302641;
          text-decoration: none;
          transition: 0.2s;
        }

        .word-related-card:hover {
          border-color: #cbb8ed;
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(40, 20, 80, 0.06);
        }

        .word-related-card h3 {
          font-size: 14px;
          margin: 0 0 5px;
        }

        .word-related-card p {
          color: #888195;
          font-size: 12px;
          line-height: 1.6;
          margin: 0;
        }

        .word-related-card > svg {
          color: #7542d8;
          flex-shrink: 0;
        }

        .word-spinner {
          animation: word-spin 1s linear infinite;
        }

        @keyframes word-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 650px) {
          .word-page {
            padding: 28px 13px 55px;
          }

          .word-features,
          .word-info-grid,
          .word-related-grid {
            grid-template-columns: 1fr;
          }

          .word-how-to,
          .word-uses,
          .word-faq-section {
            padding: 20px 16px;
          }

          .word-limitations {
            padding: 17px;
          }

          .word-file-name {
            flex-basis: calc(100% - 110px);
          }
        }
      `}</style>
    </main>
  );
}
