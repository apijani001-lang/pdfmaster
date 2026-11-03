
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
} from "lucide-react";

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
    <main
      style={{
        minHeight: "100vh",
        padding: "35px 18px 70px",
        background:
          "radial-gradient(ellipse at 50% 0%, #f0eaff 0%, #f8f7fc 48%, #f8f7fc 100%)",
        color: "#211b32",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            color: "#7542d8",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 38,
          }}
        >
          <ArrowLeft size={18} />
          Back to PDFMaster
        </Link>

        <header
          style={{
            textAlign: "center",
            marginBottom: 34,
            width: "100%",
          }}
        >
          <div
            style={{
              width: 76,
              height: 76,
              margin: "0 auto 19px",
              borderRadius: 23,
              background:
                "linear-gradient(135deg, #eee5ff, #e4d7ff)",
              color: "#7542d8",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 8px 25px rgba(117,66,216,0.10)",
            }}
          >
            <FileType size={35} />
          </div>

          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: 30,
              background: "#eee7fb",
              color: "#7542d8",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.2,
              marginBottom: 13,
            }}
          >
            PDF CONVERTER
          </div>

          <h1
            style={{
              fontSize: "clamp(29px, 5vw, 42px)",
              lineHeight: 1.15,
              letterSpacing: -1.2,
              fontWeight: 800,
              margin: "0 0 13px",
              color: "#211b32",
              textAlign: "center",
            }}
          >
            Word to PDF Converter
          </h1>

          <p
            style={{
              maxWidth: 570,
              margin: "0 auto",
              color: "#777184",
              fontSize: 15,
              lineHeight: 1.8,
              textAlign: "center",
            }}
          >
            Convert your Word DOCX documents into PDF files.
            Upload your document and download the converted PDF.
          </p>
        </header>

        <section
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "#fff",
            border: "1px solid #e9e3f1",
            borderRadius: 22,
            padding: "clamp(18px, 4vw, 32px)",
            boxShadow: "0 15px 45px rgba(40,20,80,0.07)",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: 22,
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                margin: 0,
                color: "#282039",
                textAlign: "center",
              }}
            >
              Upload Word Document
            </h2>

            <p
              style={{
                color: "#888195",
                fontSize: 13,
                margin: "7px 0 0",
                textAlign: "center",
              }}
            >
              Select a DOCX file from your device
            </p>
          </div>

          {!file ? (
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleFile(event.dataTransfer.files?.[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              style={{
                minHeight: 190,
                boxSizing: "border-box",
                border: "2px dashed #cbb8ed",
                borderRadius: 16,
                cursor: "pointer",
                background: "#fbf9ff",
                padding: "28px 18px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 17,
                  background: "#eee5ff",
                  color: "#7542d8",
                  display: "grid",
                  placeItems: "center",
                  marginBottom: 13,
                }}
              >
                <Upload size={28} />
              </div>

              <strong
                style={{
                  fontSize: 16,
                  color: "#302641",
                  textAlign: "center",
                }}
              >
                Click to select Word file
              </strong>

              <span
                style={{
                  color: "#888195",
                  fontSize: 13,
                  marginTop: 7,
                  textAlign: "center",
                }}
              >
                Or drag and drop your DOCX document here
              </span>

              <span
                style={{
                  display: "inline-block",
                  marginTop: 15,
                  padding: "9px 18px",
                  borderRadius: 10,
                  background: "#7542d8",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Browse Files
              </span>

              <span
                style={{
                  color: "#9991a5",
                  fontSize: 11,
                  marginTop: 12,
                }}
              >
                Supported format: .DOCX
              </span>
            </div>
          ) : (
            <div
              style={{
                border: "1px solid #eee9f5",
                borderRadius: 15,
                padding: 16,
                background: "#fbf9ff",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "#eee5ff",
                    color: "#7542d8",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <FileText size={25} />
                </div>

                <div
                  style={{
                    flex: "1 1 180px",
                    minWidth: 0,
                    textAlign: "center",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      color: "#302641",
                      fontSize: 13,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {file.name}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      color: "#888195",
                      fontSize: 12,
                      marginTop: 5,
                    }}
                  >
                    {formatSize(file.size)} · DOCX document
                  </span>
                </div>

                <button
                  type="button"
                  onClick={reset}
                  disabled={loading}
                  aria-label="Remove file"
                  style={{
                    width: 36,
                    height: 36,
                    border: "1px solid #eee9f5",
                    borderRadius: 9,
                    background: "#fff",
                    color: "#dc4444",
                    display: "grid",
                    placeItems: "center",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.4 : 1,
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {loading && (
                <div style={{ marginTop: 22 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: "#7542d8",
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 9,
                    }}
                  >
                    <span>Converting document...</span>
                    <span>{progress}%</span>
                  </div>

                  <div
                    style={{
                      height: 8,
                      overflow: "hidden",
                      borderRadius: 20,
                      background: "#eee7fb",
                    }}
                  >
                    <div
                      style={{
                        width: `${progress}%`,
                        height: "100%",
                        borderRadius: 20,
                        background:
                          "linear-gradient(90deg, #7542d8, #9b6bea)",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              )}

              {success && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 9,
                    marginTop: 18,
                    padding: 13,
                    borderRadius: 11,
                    background: "#ecfdf3",
                    border: "1px solid #bbf7d0",
                    color: "#167344",
                    fontSize: 13,
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                >
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
            <div
              role="alert"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: 13,
                marginTop: 20,
                borderRadius: 12,
                background: "#fff1f2",
                border: "1px solid #fecdd3",
                color: "#be123c",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              <AlertCircle size={19} />
              {error}
            </div>
          )}

          {file && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 11,
                marginTop: 22,
              }}
            >
              <button
                type="button"
                onClick={convertFile}
                disabled={loading}
                style={primaryButton}
              >
                {loading ? (
                  <>
                    <RefreshCw size={19} />
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
                style={{
                  width: "100%",
                  minHeight: 47,
                  border: "1px solid #e9e2f3",
                  borderRadius: 12,
                  background: "#fff",
                  color: "#7542d8",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                Reset
              </button>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              marginTop: 19,
              color: "#898195",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            <ShieldCheck size={15} color="#269b68" />
            Your document is processed in your browser.
          </div>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 13,
            marginTop: 22,
          }}
        >
          {[
            {
              icon: ShieldCheck,
              title: "Privacy focused",
              description: "Your document is processed in your browser.",
            },
            {
              icon: Zap,
              title: "Quick conversion",
              description: "Convert your document in a few simple steps.",
            },
            {
              icon: FileText,
              title: "Simple workflow",
              description: "Upload your Word file and download your PDF.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                style={{
                  background: "#fff",
                  border: "1px solid #eee9f5",
                  borderRadius: 14,
                  padding: 18,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 43,
                    height: 43,
                    margin: "0 auto 11px",
                    borderRadius: 12,
                    background: "#f1eaff",
                    color: "#7542d8",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Icon size={22} />
                </div>

                <strong
                  style={{
                    display: "block",
                    color: "#302641",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  {item.title}
                </strong>

                <p
                  style={{
                    color: "#888195",
                    fontSize: 12,
                    lineHeight: 1.6,
                    margin: "7px 0 0",
                    textAlign: "center",
                  }}
                >
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        <section
          style={{
            marginTop: 22,
            padding: "23px",
            borderRadius: 15,
            background: "#fff",
            border: "1px solid #eee9f5",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "#302641",
              margin: "0 0 18px",
              textAlign: "center",
            }}
          >
            How to Convert Word to PDF
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 18,
            }}
          >
            {[
              {
                number: "01",
                title: "Upload Word File",
                description: "Choose your DOCX document.",
              },
              {
                number: "02",
                title: "Convert Document",
                description: "Start the PDF conversion.",
              },
              {
                number: "03",
                title: "Download PDF",
                description: "Save the converted PDF file.",
              },
            ].map((step) => (
              <div
                key={step.number}
                style={{
                  textAlign: "center",
                  padding: 10,
                }}
              >
                <div
                  style={{
                    width: 43,
                    height: 43,
                    margin: "0 auto 11px",
                    borderRadius: 13,
                    background: "#eee5ff",
                    color: "#7542d8",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  {step.number}
                </div>

                <strong
                  style={{
                    display: "block",
                    color: "#302641",
                    fontSize: 13,
                  }}
                >
                  {step.title}
                </strong>

                <p
                  style={{
                    color: "#888195",
                    fontSize: 12,
                    lineHeight: 1.6,
                    margin: "6px 0 0",
                  }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div
          style={{
            marginTop: 22,
            padding: 20,
            borderRadius: 15,
            background: "#fff9eb",
            border: "1px solid #f3dfb1",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              color: "#8a5a12",
              fontSize: 14,
              fontWeight: 800,
              margin: "0 0 8px",
              textAlign: "center",
            }}
          >
            Important conversion note
          </h3>

          <p
            style={{
              color: "#876b3e",
              fontSize: 12,
              lineHeight: 1.8,
              margin: 0,
              textAlign: "center",
            }}
          >
            This version extracts readable text from DOCX documents.
            Complex formatting, pictures, tables, headers and footers
            may not be preserved exactly. Documents requiring exact
            Word layout need a full document-rendering conversion engine.
          </p>
        </div>
      </div>
    </main>
  );
}
