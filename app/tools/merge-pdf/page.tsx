
"use client";

import { useState } from "react";
import Link from "next/link";
import { PDFDocument } from "pdf-lib";
import {
  FileText,
  Upload,
  X,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Download,
  Merge,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type NoticeProps = {
  type: "error" | "success";
  children: React.ReactNode;
};

function Notice({ type, children }: NoticeProps) {
  const success = type === "success";

  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "13px 15px",
        marginTop: 20,
        borderRadius: 12,
        background: success ? "#ecfdf3" : "#fff1f2",
        border: `1px solid ${success ? "#bbf7d0" : "#fecdd3"}`,
        color: success ? "#167344" : "#be123c",
        fontSize: 14,
        lineHeight: 1.5,
      }}
    >
      {success ? <CheckCircle2 size={19} /> : <AlertCircle size={19} />}
      <span>{children}</span>
    </div>
  );
}

export default function MergePDFPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function addFiles(selectedFiles: FileList | null) {
    if (!selectedFiles) return;

    const selected = Array.from(selectedFiles);
    const pdfFiles = selected.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
    );

    if (pdfFiles.length !== selected.length) {
      setError("Please select PDF files only. Invalid files were skipped.");
    } else {
      setError("");
    }

    if (pdfFiles.length > 0) {
      setFiles((previous) => [...previous, ...pdfFiles]);
      setMessage("");
    }
  }

  function removeFile(index: number) {
    setFiles((previous) =>
      previous.filter((_, fileIndex) => fileIndex !== index)
    );
    setMessage("");
    setError("");
  }

  function moveFile(index: number, direction: number) {
    const newFiles = [...files];
    const target = index + direction;

    if (target < 0 || target >= newFiles.length) return;

    [newFiles[index], newFiles[target]] = [
      newFiles[target],
      newFiles[index],
    ];

    setFiles(newFiles);
  }

  async function mergePDFs() {
    if (files.length < 2) {
      setError("Please select at least 2 PDF files.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const mergedPDF = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);

        const pages = await mergedPDF.copyPages(
          pdf,
          pdf.getPageIndices()
        );

        pages.forEach((page) => mergedPDF.addPage(page));
      }

      const mergedBytes = await mergedPDF.save();

      const blob = new Blob([mergedBytes as BlobPart], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "PDFMaster-Merged.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      setMessage("Your PDF files have been merged successfully!");
    } catch (err) {
      console.error(err);
      setError(
        "Could not merge these PDFs. Please check that the files are valid and not password-protected."
      );
    } finally {
      setLoading(false);
    }
  }

  const totalSize = files.reduce((total, file) => total + file.size, 0);

  const primaryButton: React.CSSProperties = {
    width: "100%",
    minHeight: 54,
    marginTop: 24,
    padding: "14px 20px",
    border: "none",
    borderRadius: 13,
    background:
      loading || files.length < 2
        ? "#b9a4dc"
        : "linear-gradient(135deg, #7542d8, #6030c4)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: loading || files.length < 2 ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    boxShadow:
      loading || files.length < 2
        ? "none"
        : "0 7px 18px rgba(117,66,216,0.2)",
  };

  const smallButton: React.CSSProperties = {
    width: 36,
    height: 36,
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    border: "1px solid #e9e2f3",
    borderRadius: 9,
    background: "#fff",
    color: "#7542d8",
    cursor: "pointer",
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

        <header style={{ textAlign: "center", marginBottom: 34 }}>
          <div
            style={{
              width: 76,
              height: 76,
              margin: "0 auto 19px",
              borderRadius: 23,
              background: "linear-gradient(135deg, #eee5ff, #e4d7ff)",
              color: "#7542d8",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 8px 25px rgba(117,66,216,0.10)",
            }}
          >
            <Merge size={35} />
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
            PDF ORGANIZER
          </div>

          <h1
            style={{
              fontSize: "clamp(29px, 5vw, 42px)",
              lineHeight: 1.15,
              letterSpacing: -1.2,
              fontWeight: 800,
              margin: "0 0 13px",
              color: "#211b32",
            }}
          >
            Merge PDF Files
          </h1>

          <p
            style={{
              maxWidth: 570,
              margin: "0 auto",
              color: "#777184",
              fontSize: 15,
              lineHeight: 1.8,
            }}
          >
            Combine multiple PDF documents into one file. Arrange
            your documents in the order you want before downloading.
          </p>
        </header>

        <section
          style={{
            background: "#fff",
            border: "1px solid #e9e3f1",
            borderRadius: 22,
            padding: "clamp(18px, 4vw, 32px)",
            boxShadow: "0 15px 45px rgba(40,20,80,0.07)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 17,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  margin: 0,
                  color: "#282039",
                }}
              >
                Upload PDF Files
              </h2>
              <p
                style={{
                  color: "#888195",
                  fontSize: 13,
                  margin: "5px 0 0",
                }}
              >
                Select at least two PDF documents
              </p>
            </div>

            <span
              style={{
                padding: "7px 11px",
                borderRadius: 30,
                background: "#f3edff",
                color: "#7542d8",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              PDF files only
            </span>
          </div>

          <label
            style={{
              minHeight: 190,
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
              transition: "background 0.2s ease",
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

            <strong style={{ fontSize: 16, color: "#302641" }}>
              Click to select PDF files
            </strong>

            <span
              style={{
                color: "#888195",
                fontSize: 13,
                marginTop: 7,
              }}
            >
              Choose two or more PDF documents from your device
            </span>

            <input
              type="file"
              accept=".pdf,application/pdf"
              multiple
              hidden
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>

          {files.length > 0 && (
            <div style={{ marginTop: 29 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 15,
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      margin: 0,
                      color: "#282039",
                    }}
                  >
                    Selected Files ({files.length})
                  </h3>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#888195",
                      margin: "5px 0 0",
                    }}
                  >
                    Total size: {(totalSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <span
                  style={{
                    fontSize: 12,
                    color: "#7542d8",
                    fontWeight: 700,
                  }}
                >
                  Arrange file order below
                </span>
              </div>

              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    padding: "13px",
                    marginBottom: 10,
                    border: "1px solid #eee9f5",
                    borderRadius: 13,
                    background: "#fff",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 45,
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 10,
                      background: "#f1eaff",
                      color: "#7542d8",
                    }}
                  >
                    <FileText size={23} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong
                      style={{
                        display: "block",
                        color: "#302641",
                        fontSize: 13,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {file.name}
                    </strong>

                    <small
                      style={{
                        display: "block",
                        color: "#91899e",
                        fontSize: 11,
                        marginTop: 5,
                      }}
                    >
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </small>
                  </div>

                  <span
                    style={{
                      color: "#a39bad",
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => moveFile(index, -1)}
                    disabled={index === 0}
                    title="Move up"
                    aria-label={`Move ${file.name} up`}
                    style={{
                      ...smallButton,
                      opacity: index === 0 ? 0.35 : 1,
                      cursor: index === 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    <ArrowUp size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => moveFile(index, 1)}
                    disabled={index === files.length - 1}
                    title="Move down"
                    aria-label={`Move ${file.name} down`}
                    style={{
                      ...smallButton,
                      opacity: index === files.length - 1 ? 0.35 : 1,
                      cursor:
                        index === files.length - 1
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    <ArrowDown size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    title="Remove file"
                    aria-label={`Remove ${file.name}`}
                    style={{
                      ...smallButton,
                      color: "#dc4444",
                    }}
                  >
                    <X size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <Notice type="error">{error}</Notice>}
          {message && <Notice type="success">{message}</Notice>}

          <button
            type="button"
            onClick={mergePDFs}
            disabled={loading || files.length < 2}
            style={primaryButton}
          >
            {loading ? (
              <>
                <Loader2
                  size={20}
                  style={{ animation: "spin 1s linear infinite" }}
                />
                Merging PDFs...
              </>
            ) : (
              <>
                <Download size={19} />
                Merge & Download PDF
              </>
            )}
          </button>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 7,
              marginTop: 18,
              color: "#898195",
              fontSize: 12,
              textAlign: "center",
            }}
          >
            <ShieldCheck size={15} color="#269b68" />
            Your files are processed locally in your browser.
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
              title: "Easy to use",
              description: "Select and arrange your PDF files.",
            },
            {
              title: "Quick processing",
              description: "Combine documents in a few steps.",
            },
            {
              title: "Privacy focused",
              description: "Files stay in your browser during processing.",
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                background: "#fff",
                border: "1px solid #eee9f5",
                borderRadius: 14,
                padding: "17px",
              }}
            >
              <strong
                style={{
                  display: "block",
                  color: "#302641",
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                {item.title}
              </strong>
              <span
                style={{
                  color: "#888195",
                  fontSize: 12,
                  lineHeight: 1.6,
                }}
              >
                {item.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
