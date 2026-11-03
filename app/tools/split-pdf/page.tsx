
"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  FileText,
  Upload,
  Scissors,
  Download,
  CheckCircle2,
  Loader2,
  Trash2,
} from "lucide-react";

type SplitPage = {
  name: string;
  bytes: Uint8Array;
};

export default function SplitPDFPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<SplitPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a valid PDF file.");
      return;
    }

    setFile(selectedFile);
    setPages([]);
    setError("");
    setSuccess("");
  };

  const splitPDF = async () => {
    if (!file) {
      setError("Please upload a PDF file first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    setPages([]);

    try {
      const buffer = await file.arrayBuffer();
      const originalPDF = await PDFDocument.load(buffer);
      const totalPages = originalPDF.getPageCount();

      if (totalPages === 0) {
        throw new Error("This PDF does not contain any pages.");
      }

      const splitResults: SplitPage[] = [];

      for (let i = 0; i < totalPages; i++) {
        const newPDF = await PDFDocument.create();
        const copiedPages = await newPDF.copyPages(originalPDF, [i]);

        newPDF.addPage(copiedPages[0]);

        const pdfBytes = await newPDF.save();

        splitResults.push({
          name: `${file.name.replace(/\.pdf$/i, "")}-page-${i + 1}.pdf`,
          bytes: pdfBytes,
        });
      }

      setPages(splitResults);
      setSuccess(
        `Successfully split your PDF into ${totalPages} separate files.`
      );
    } catch (err) {
      console.error(err);
      setError(
        "Unable to split this PDF. The file may be damaged or password protected."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadPage = (page: SplitPage) => {
    const blob = new Blob([page.bytes.buffer as ArrayBuffer], {
      type: "application/pdf",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = page.name;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    pages.forEach((page, index) => {
      setTimeout(() => downloadPage(page), index * 300);
    });
  };

  const reset = () => {
    setFile(null);
    setPages([]);
    setError("");
    setSuccess("");
  };

  return (
    <main className="split-page">
      <section className="split-hero">
        <div className="split-icon">
          <Scissors size={30} />
        </div>

        <span className="split-eyebrow">PDFMASTER TOOL</span>

        <h1>Split PDF Files</h1>

        <p>
          Separate your PDF into individual pages. Upload your document,
          split it, and download each page as a separate PDF file.
        </p>
      </section>

      <section className="split-workspace">
        <div className="split-upload-area">
          {!file ? (
            <label className="split-dropzone">
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) =>
                  handleFile(event.target.files?.[0])
                }
                hidden
              />

              <div className="split-upload-icon">
                <Upload size={30} />
              </div>

              <h2>Choose a PDF file</h2>

              <p>Click here to browse your device</p>

              <span className="split-browse-button">
                Select PDF File
              </span>

              <small>PDF files only</small>
            </label>
          ) : (
            <div className="split-selected-file">
              <div className="split-file-icon">
                <FileText size={28} />
              </div>

              <div className="split-file-info">
                <strong>{file.name}</strong>
                <span>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </div>

              <button
                className="split-remove"
                onClick={reset}
                aria-label="Remove selected file"
              >
                <Trash2 size={19} />
              </button>
            </div>
          )}

          {error && <div className="split-error">{error}</div>}

          {success && (
            <div className="split-success">
              <CheckCircle2 size={19} />
              {success}
            </div>
          )}

          {file && pages.length === 0 && (
            <button
              className="split-main-button"
              onClick={splitPDF}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="split-spinner" size={20} />
                  Splitting PDF...
                </>
              ) : (
                <>
                  <Scissors size={20} />
                  Split PDF Now
                </>
              )}
            </button>
          )}
        </div>

        {pages.length > 0 && (
          <div className="split-results">
            <div className="split-results-heading">
              <div>
                <h2>Your PDF pages</h2>
                <p>{pages.length} separate PDF files are ready.</p>
              </div>

              <button
                className="split-download-all"
                onClick={downloadAll}
              >
                <Download size={18} />
                Download All
              </button>
            </div>

            <div className="split-file-list">
              {pages.map((page, index) => (
                <div className="split-result-item" key={page.name}>
                  <div className="split-result-icon">
                    <FileText size={22} />
                  </div>

                  <div className="split-result-info">
                    <strong>Page {index + 1}</strong>
                    <span>{page.name}</span>
                  </div>

                  <button
                    className="split-single-download"
                    onClick={() => downloadPage(page)}
                    aria-label={`Download page ${index + 1}`}
                  >
                    <Download size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button className="split-reset-button" onClick={reset}>
              Split Another PDF
            </button>
          </div>
        )}
      </section>

      <section className="split-features">
        <div>
          <CheckCircle2 size={22} />
          <h3>Easy to Use</h3>
          <p>Upload your PDF and split it with one click.</p>
        </div>

        <div>
          <FileText size={22} />
          <h3>Separate Pages</h3>
          <p>Every page becomes an individual PDF file.</p>
        </div>

        <div>
          <CheckCircle2 size={22} />
          <h3>Private Processing</h3>
          <p>Your PDF is processed locally in your browser.</p>
        </div>
      </section>

      <style jsx>{`
        .split-page {
          min-height: 80vh;
          padding: 65px 20px 80px;
          background: #f7f8fc;
          color: #101a35;
        }

        .split-hero {
          max-width: 760px;
          margin: 0 auto 38px;
          text-align: center;
        }

        .split-icon {
          width: 65px;
          height: 65px;
          display: grid;
          place-items: center;
          margin: 0 auto 18px;
          border-radius: 20px;
          color: #7255e8;
          background: #eeeaff;
        }

        .split-eyebrow {
          color: #7255e8;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .split-hero h1 {
          margin: 12px 0;
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 900;
          letter-spacing: -1.8px;
        }

        .split-hero p {
          max-width: 620px;
          margin: 0 auto;
          color: #69738d;
          font-size: 15px;
          line-height: 1.8;
        }

        .split-workspace {
          max-width: 820px;
          margin: 0 auto;
          padding: 25px;
          border: 1px solid #e3e8f2;
          border-radius: 23px;
          background: white;
          box-shadow: 0 18px 55px rgba(22, 34, 70, 0.07);
        }

        .split-dropzone {
          min-height: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 2px dashed #cfc6f8;
          border-radius: 17px;
          background: #faf9ff;
          cursor: pointer;
          transition: 0.2s;
        }

        .split-dropzone:hover {
          border-color: #7255e8;
          background: #f4f1ff;
        }

        .split-upload-icon {
          width: 60px;
          height: 60px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background: #eeeaff;
          color: #7255e8;
        }

        .split-dropzone h2 {
          margin: 18px 0 5px;
          font-size: 21px;
        }

        .split-dropzone p {
          margin: 0 0 18px;
          color: #69738d;
          font-size: 13px;
        }

        .split-browse-button,
        .split-main-button,
        .split-download-all {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 13px 23px;
          border: 0;
          border-radius: 11px;
          background: #7255e8;
          color: white;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s;
        }

        .split-browse-button:hover,
        .split-main-button:hover,
        .split-download-all:hover {
          background: #5940c7;
          transform: translateY(-2px);
        }

        .split-dropzone small {
          margin-top: 15px;
          color: #929bb0;
          font-size: 11px;
        }

        .split-selected-file {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 20px;
          border: 1px solid #e3e8f2;
          border-radius: 14px;
          background: #faf9ff;
        }

        .split-file-icon,
        .split-result-icon {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #eeeaff;
          color: #7255e8;
        }

        .split-file-info,
        .split-result-info {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .split-file-info strong,
        .split-result-info strong {
          overflow-wrap: anywhere;
          font-size: 14px;
        }

        .split-file-info span,
        .split-result-info span {
          overflow-wrap: anywhere;
          color: #8992a8;
          font-size: 12px;
        }

        .split-remove,
        .split-single-download {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 11px;
          background: #eeeaff;
          color: #7255e8;
          cursor: pointer;
        }

        .split-remove {
          background: #fff0f0;
          color: #d64b5b;
        }

        .split-main-button {
          width: 100%;
          margin-top: 20px;
          padding: 16px;
          font-size: 15px;
        }

        .split-main-button:disabled {
          cursor: wait;
          opacity: 0.7;
        }

        .split-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .split-error,
        .split-success {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 16px;
          padding: 13px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.5;
        }

        .split-error {
          background: #fff0f0;
          color: #c0394b;
        }

        .split-success {
          background: #edfaf2;
          color: #21834a;
        }

        .split-results {
          margin-top: 25px;
        }

        .split-results-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 17px;
        }

        .split-results-heading h2 {
          margin: 0 0 5px;
          font-size: 20px;
        }

        .split-results-heading p {
          margin: 0;
          color: #69738d;
          font-size: 12px;
        }

        .split-download-all {
          padding: 11px 15px;
          white-space: nowrap;
        }

        .split-file-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .split-result-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e3e8f2;
          border-radius: 13px;
        }

        .split-result-icon {
          width: 42px;
          height: 42px;
        }

        .split-reset-button {
          width: 100%;
          margin-top: 18px;
          padding: 13px;
          border: 1px solid #d9d1fa;
          border-radius: 11px;
          background: white;
          color: #7255e8;
          font-weight: 800;
          cursor: pointer;
        }

        .split-reset-button:hover {
          background: #f4f1ff;
        }

        .split-features {
          max-width: 950px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 45px auto 0;
        }

        .split-features > div {
          padding: 22px;
          border: 1px solid #e3e8f2;
          border-radius: 16px;
          background: white;
        }

        .split-features svg {
          color: #7255e8;
        }

        .split-features h3 {
          margin: 12px 0 6px;
          font-size: 15px;
        }

        .split-features p {
          margin: 0;
          color: #69738d;
          font-size: 12px;
          line-height: 1.7;
        }

        @media (max-width: 600px) {
          .split-page {
            padding: 40px 13px 55px;
          }

          .split-workspace {
            padding: 13px;
          }

          .split-dropzone {
            min-height: 260px;
          }

          .split-results-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .split-features {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
