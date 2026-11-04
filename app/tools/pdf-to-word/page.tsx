
"use client";

import { useRef, useState } from "react";
import type { DragEvent } from "react";
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import {
  FileText,
  Upload,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Zap,
  ShieldCheck,
  ScanText,
  FolderOpen,
  ArrowRight,
  Sparkles,
  FileCheck2,
  LockKeyhole,
} from "lucide-react";

type OCRWorker = {
  recognize: (image: HTMLCanvasElement) => Promise<{
    data: { text: string };
  }>;
  terminate: () => Promise<unknown>;
};

export default function PdfToWordPage() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [wordBlob, setWordBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);

  const selectFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    setError("");
    setSuccess(false);
    setWordBlob(null);
    setProgress("");

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setFile(null);
      setError("Please select a valid PDF file.");
      return;
    }

    if (selectedFile.size === 0) {
      setFile(null);
      setError("The selected PDF file is empty.");
      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setWordBlob(null);
    setError("");
    setSuccess(false);
    setProgress("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const downloadWord = () => {
    if (!wordBlob || !file) return;

    const url = URL.createObjectURL(wordBlob);
    const link = window.document.createElement("a");

    link.href = url;
    link.download = `${file.name.replace(/\.pdf$/i, "")}.docx`;

    window.document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  const convertPdf = async () => {
    if (!file || loading) {
      if (!file) setError("Please select a PDF file first.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);
    setWordBlob(null);

    let ocrWorker: OCRWorker | null = null;

    try {
      setProgress("Loading PDF reader...");

      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

      const inputBytes = new Uint8Array(await file.arrayBuffer());

      const loadingTask = pdfjs.getDocument({
        data: inputBytes,
      });

      const pdf = await loadingTask.promise;

      if (pdf.numPages > 50) {
        throw new Error(
          "This version supports up to 50 pages per conversion. Please split your PDF into smaller files."
        );
      }

      setProgress("Starting OCR engine...");

      const { createWorker } = await import("tesseract.js");

      ocrWorker = (await createWorker("eng")) as unknown as OCRWorker;

      const paragraphs: Paragraph[] = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        setProgress(
          `Reading page ${pageNumber} of ${pdf.numPages} with OCR...`
        );

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.8 });

        const canvas = window.document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Could not prepare the PDF page for OCR.");
        }

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        const result = await ocrWorker.recognize(canvas);

        const extractedText = result.data.text
          .replace(/\r/g, "")
          .trim();

        canvas.width = 0;
        canvas.height = 0;

        if (extractedText) {
          const lines = extractedText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

          for (const line of lines) {
            paragraphs.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    size: 22,
                  }),
                ],
                spacing: {
                  after: 100,
                },
              })
            );
          }
        }

        if (pageNumber < pdf.numPages) {
          paragraphs.push(
            new Paragraph({
              children: [],
              pageBreakBefore: true,
            })
          );
        }
      }

      if (paragraphs.length === 0) {
        throw new Error(
          "OCR could not recognize readable text in this PDF. Please try a clearer PDF."
        );
      }

      setProgress("Creating your Word document...");

      const wordDocument = new DocxDocument({
        creator: "PDFMaster",
        title: file.name.replace(/\.pdf$/i, ""),
        sections: [
          {
            properties: {},
            children: paragraphs,
          },
        ],
      });

      const generatedBlob = await Packer.toBlob(wordDocument);

      setWordBlob(generatedBlob);
      setSuccess(true);
      setProgress("Your Word document is ready!");

    } catch (err) {
      console.error("PDF OCR conversion error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Conversion failed. Please try another PDF."
      );

      setProgress("");
    } finally {
      if (ocrWorker) {
        await ocrWorker.terminate().catch(console.error);
      }

      setLoading(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);

    if (!loading) {
      selectFile(event.dataTransfer.files?.[0]);
    }
  };

  return (
    <main className="pdfword-page">
      <div className="pdfword-glow pdfword-glow-one" />
      <div className="pdfword-glow pdfword-glow-two" />

      <div className="pdfword-container">

        {/* HERO */}
        <header className="pdfword-hero">
          <div className="pdfword-badge">
            <Sparkles size={15} />
            <span>PDFMASTER PREMIUM TOOL</span>
          </div>

          <h1>
            PDF to <span>Word</span>
            <br />
            <span className="pdfword-heading-second">
              Converter
            </span>
          </h1>

          <p className="pdfword-subtitle">
            Transform your PDF documents into editable Word files.
            Even scanned documents can be processed with OCR technology.
          </p>

          <div className="pdfword-trust">
            <span><ShieldCheck size={16} /> Browser processing</span>
            <span><Zap size={16} /> Simple conversion</span>
            <span><FileCheck2 size={16} /> DOCX download</span>
          </div>
        </header>

        {/* CONVERTER */}
        <section className="pdfword-workspace">

          <div className="pdfword-workspace-heading">
            <div>
              <div className="pdfword-small-label">CONVERSION WORKSPACE</div>
              <h2>Upload your PDF</h2>
              <p>Select a document to get started.</p>
            </div>

            <div className="pdfword-heading-icon">
              <FileText size={28} />
            </div>
          </div>

          {/* UPLOAD */}
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => {
              if (!loading) inputRef.current?.click();
            }}
            className={`pdfword-dropzone ${
              dragging ? "pdfword-drag-active" : ""
            } ${file ? "pdfword-has-file" : ""}`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="pdfword-hidden-input"
              disabled={loading}
              onChange={(event) => {
                selectFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />

            <div className="pdfword-upload-icon">
              <Upload size={34} />
            </div>

            <h3>
              {dragging
                ? "Drop your PDF here"
                : file
                  ? "Choose another PDF"
                  : "Drag & drop your PDF"}
            </h3>

            <p>
              Drop your file here or browse your computer
            </p>

            <span className="pdfword-browse-button">
              <FolderOpen size={17} />
              Browse PDF Files
            </span>

            <div className="pdfword-format">
              <span>PDF</span>
              <span>Secure browser processing</span>
            </div>
          </div>

          {/* SELECTED FILE */}
          {file && (
            <div className="pdfword-selected">
              <div className="pdfword-file-icon">
                <FileText size={26} />
              </div>

              <div className="pdfword-file-info">
                <strong>{file.name}</strong>
                <span>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB · PDF document
                </span>
              </div>

              <button
                type="button"
                onClick={removeFile}
                disabled={loading}
                className="pdfword-remove"
              >
                <X size={17} />
                Remove
              </button>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="pdfword-message pdfword-error">
              <AlertCircle size={21} />
              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="pdfword-message pdfword-success">
              <CheckCircle2 size={21} />
              <span>Your Word document is ready to download!</span>
            </div>
          )}

          {/* PROGRESS */}
          {loading && (
            <div className="pdfword-progress">
              <div className="pdfword-progress-title">
                <RefreshCw size={18} className="pdfword-spin" />
                <span>{progress}</span>
              </div>

              <div className="pdfword-progress-track">
                <div className="pdfword-progress-bar" />
              </div>

              <p>
                Please keep this tab open while your document is being processed.
              </p>
            </div>
          )}

          {/* ACTIONS */}
          <div className="pdfword-actions">
            <button
              type="button"
              onClick={convertPdf}
              disabled={!file || loading}
              className="pdfword-convert-button"
            >
              {loading ? (
                <RefreshCw size={20} className="pdfword-spin" />
              ) : (
                <Zap size={20} />
              )}
              {loading ? "Converting..." : "Convert PDF to Word"}
            </button>

            <button
              type="button"
              onClick={downloadWord}
              disabled={!wordBlob || loading}
              className="pdfword-download-button"
            >
              <Download size={20} />
              Download Word
            </button>
          </div>

          <div className="pdfword-workspace-footer">
            <LockKeyhole size={14} />
            Your PDF is processed in your browser.
          </div>
        </section>

        {/* FEATURES */}
        <section className="pdfword-features-section">
          <div className="pdfword-section-heading">
            <div className="pdfword-small-label">WHY PDFMASTER?</div>
            <h2>Everything you need for conversion</h2>
            <p>A simple workflow with useful conversion features.</p>
          </div>

          <div className="pdfword-features-grid">

            <article className="pdfword-feature-card">
              <div className="pdfword-feature-icon feature-blue">
                <FileText size={25} />
              </div>
              <h3>Editable Text</h3>
              <p>
                Extract text from PDF documents and create an editable Word file.
              </p>
            </article>

            <article className="pdfword-feature-card">
              <div className="pdfword-feature-icon feature-purple">
                <ScanText size={25} />
              </div>
              <h3>OCR Technology</h3>
              <p>
                Recognize printed text from scanned PDF page images.
              </p>
            </article>

            <article className="pdfword-feature-card">
              <div className="pdfword-feature-icon feature-green">
                <ShieldCheck size={25} />
              </div>
              <h3>Browser Processing</h3>
              <p>
                Process your PDF in your browser without uploading it to our server.
              </p>
            </article>

          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="pdfword-steps-section">
          <div className="pdfword-section-heading">
            <div className="pdfword-small-label">THREE SIMPLE STEPS</div>
            <h2>How to convert PDF to Word</h2>
            <p>Get your editable document in a few easy steps.</p>
          </div>

          <div className="pdfword-steps-grid">
            <article className="pdfword-step">
              <div className="pdfword-step-number">01</div>
              <div>
                <h3>Upload PDF</h3>
                <p>Select a PDF file from your device.</p>
              </div>
            </article>

            <article className="pdfword-step">
              <div className="pdfword-step-number">02</div>
              <div>
                <h3>Convert Document</h3>
                <p>Our converter extracts and recognizes the text.</p>
              </div>
            </article>

            <article className="pdfword-step">
              <div className="pdfword-step-number">03</div>
              <div>
                <h3>Download Word</h3>
                <p>Save your new editable DOCX document.</p>
              </div>
            </article>
          </div>
        </section>
        {/* SEO CONTENT */}
        <section className="pdfword-seo-section">
          <div className="pdfword-section-heading">
            <div className="pdfword-small-label">PDF TO WORD GUIDE</div>
            <h2>Convert PDF to Editable Word Documents</h2>
            <p>
              PDFMaster helps you turn PDF documents into editable DOCX
              files using text recognition technology. Upload your PDF,
              convert its readable content and download the Word document.
            </p>
          </div>

          <div className="pdfword-seo-content">
            <article>
              <h3>What is PDF to Word conversion?</h3>
              <p>
                PDF to Word conversion changes the readable text in a PDF
                document into a Microsoft Word compatible DOCX file.
                You can then edit the extracted text in a compatible
                word processor.
              </p>
            </article>

            <article>
              <h3>Can I convert scanned PDF files?</h3>
              <p>
                Yes. This tool uses OCR (Optical Character Recognition)
                to recognize printed English text from scanned PDF pages.
                Clear scans generally produce better text recognition.
              </p>
            </article>

            <article>
              <h3>Is my PDF uploaded to a server?</h3>
              <p>
                PDF processing takes place in your browser. Your selected
                document is processed locally rather than uploaded to
                the PDFMaster server for conversion.
              </p>
            </article>
          </div>
        </section>

        {/* FAQ */}
        <section className="pdfword-faq-section">
          <div className="pdfword-section-heading">
            <div className="pdfword-small-label">COMMON QUESTIONS</div>
            <h2>Frequently Asked Questions</h2>
            <p>Helpful answers about converting PDF files to Word.</p>
          </div>

          <div className="pdfword-faq-list">
            <article>
              <h3>1. How do I convert PDF to Word online?</h3>
              <p>
                Select your PDF file, click Convert PDF to Word, wait
                for processing to finish and download your DOCX file.
              </p>
            </article>

            <article>
              <h3>2. Can I convert scanned PDFs to Word?</h3>
              <p>
                Yes. The converter uses OCR technology to recognize
                printed English text in scanned PDF documents.
              </p>
            </article>

            <article>
              <h3>3. Is the PDF to Word converter free?</h3>
              <p>
                You can use the PDFMaster converter to process supported
                PDF documents without paying for an online conversion.
              </p>
            </article>

            <article>
              <h3>4. Will the original PDF formatting be preserved?</h3>
              <p>
                This tool extracts recognized text and creates a Word
                document. Exact layouts, images, complex tables and
                original formatting are not preserved.
              </p>
            </article>

            <article>
              <h3>5. Which languages does OCR support?</h3>
              <p>
                The current OCR configuration recognizes English text.
                Other languages may not be recognized correctly.
              </p>
            </article>

            <article>
              <h3>6. What is the maximum PDF page limit?</h3>
              <p>
                The current converter supports up to 50 pages per
                conversion. Larger documents can be split into
                smaller PDF files first.
              </p>
            </article>
          </div>
        </section>

        {/* RELATED TOOLS */}
        <section className="pdfword-related-section">
          <div className="pdfword-section-heading">
            <div className="pdfword-small-label">EXPLORE PDFMASTER</div>
            <h2>More Free PDF Tools</h2>
            <p>Explore other tools to manage and convert your documents.</p>
          </div>

          <div className="pdfword-related-grid">
            <a href="/tools/merge-pdf">Merge PDF <ArrowRight size={16} /></a>
            <a href="/tools/split-pdf">Split PDF <ArrowRight size={16} /></a>
            <a href="/tools/compress-pdf">Compress PDF <ArrowRight size={16} /></a>
            <a href="/tools/pdf-to-jpg">PDF to JPG <ArrowRight size={16} /></a>
            <a href="/tools/jpg-to-pdf">JPG to PDF <ArrowRight size={16} /></a>
            <a href="/tools/word-to-pdf">Word to PDF <ArrowRight size={16} /></a>
            <a href="/tools/protect-pdf">Protect PDF <ArrowRight size={16} /></a>
          </div>
        </section>
        {/* NOTICE */}
        <div className="pdfword-notice">
          <AlertCircle size={20} />
          <p>
            <strong>Conversion note:</strong> OCR currently recognizes English
            printed text. Results may vary with blurry scans, mathematical
            formulas and unusual fonts. Original images, exact page layout and
            complex tables are not preserved.
          </p>
        </div>

      </div>

      {/* PAGE-SCOPED STYLING */}
      <style jsx global>{`
        .pdfword-page {
          position: relative;
          isolation: isolate;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          padding: 75px 20px 100px;
          background:
            radial-gradient(ellipse at 50% 0%, rgba(60, 103, 255, 0.16), transparent 42%),
            linear-gradient(180deg, #080d1b 0%, #0b1020 48%, #080d1b 100%);
          color: #f8fafc;
          font-family: inherit;
        }

        .pdfword-page *,
        .pdfword-page *::before,
        .pdfword-page *::after {
          box-sizing: border-box;
        }

        .pdfword-container {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
        }

        .pdfword-glow {
          position: absolute;
          z-index: 0;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          filter: blur(110px);
          opacity: 0.13;
          pointer-events: none;
        }

        .pdfword-glow-one {
          top: 300px;
          left: -200px;
          background: #2563eb;
        }

        .pdfword-glow-two {
          top: 850px;
          right: -200px;
          background: #9333ea;
        }

        .pdfword-hero {
          width: 100%;
          text-align: center;
          margin: 0 auto 48px;
        }

        .pdfword-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 9px 16px;
          border: 1px solid rgba(96, 165, 250, 0.25);
          border-radius: 50px;
          background: rgba(37, 99, 235, 0.12);
          color: #93c5fd;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.8px;
          margin-bottom: 24px;
        }

        .pdfword-hero h1 {
          margin: 0;
          color: #f8fafc;
          font-size: clamp(42px, 7vw, 76px);
          font-weight: 900;
          line-height: 1.06;
          letter-spacing: -3.5px;
        }

        .pdfword-hero h1 > span:first-child {
          background: linear-gradient(100deg, #60a5fa, #818cf8, #c084fc);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }

        .pdfword-hero h1 .pdfword-heading-second {
          color: #f8fafc;
          background: none;
          -webkit-text-fill-color: #f8fafc;
        }

        .pdfword-subtitle {
          max-width: 660px;
          margin: 22px auto 24px;
          color: #a5b4cf;
          font-size: 16px;
          line-height: 1.85;
        }

        .pdfword-trust {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 12px 26px;
          color: #94a3b8;
          font-size: 12px;
        }

        .pdfword-trust span {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .pdfword-trust svg {
          color: #60a5fa;
        }

        .pdfword-workspace {
          width: 100%;
          padding: 30px;
          border: 1px solid rgba(148, 163, 184, 0.17);
          border-radius: 25px;
          background: linear-gradient(145deg, rgba(22, 34, 58, 0.97), rgba(13, 22, 40, 0.98));
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.28);
        }

        .pdfword-workspace-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 23px;
        }

        .pdfword-small-label {
          color: #60a5fa;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .pdfword-workspace-heading h2 {
          margin: 8px 0 5px;
          color: #f8fafc;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: -0.7px;
        }

        .pdfword-workspace-heading p {
          margin: 0;
          color: #94a3b8;
          font-size: 13px;
        }

        .pdfword-heading-icon {
          display: flex;
          width: 54px;
          height: 54px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(96, 165, 250, 0.22);
          border-radius: 16px;
          background: rgba(37, 99, 235, 0.13);
          color: #60a5fa;
        }

        .pdfword-dropzone {
          display: flex;
          min-height: 270px;
          width: 100%;
          cursor: pointer;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px 18px;
          border: 2px dashed #354766;
          border-radius: 19px;
          background: rgba(5, 12, 27, 0.55);
          text-align: center;
          transition: border-color 0.25s, background 0.25s, transform 0.25s;
        }

        .pdfword-dropzone:hover,
        .pdfword-drag-active {
          border-color: #60a5fa;
          background: rgba(37, 99, 235, 0.08);
        }

        .pdfword-drag-active {
          transform: scale(0.995);
        }

        .pdfword-has-file {
          border-color: rgba(96, 165, 250, 0.5);
        }

        .pdfword-hidden-input {
          display: none;
        }

        .pdfword-upload-icon {
          display: flex;
          width: 72px;
          height: 72px;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          border: 1px solid rgba(96, 165, 250, 0.22);
          border-radius: 21px;
          background: linear-gradient(145deg, rgba(37, 99, 235, 0.25), rgba(99, 102, 241, 0.12));
          color: #60a5fa;
          box-shadow: 0 12px 35px rgba(37, 99, 235, 0.13);
        }

        .pdfword-dropzone h3 {
          margin: 0 0 9px;
          color: #f8fafc;
          font-size: 20px;
          font-weight: 800;
        }

        .pdfword-dropzone p {
          margin: 0 0 20px;
          color: #94a3b8;
          font-size: 13px;
        }

        .pdfword-browse-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 12px 22px;
          border-radius: 11px;
          background: linear-gradient(100deg, #2563eb, #6366f1);
          color: white;
          font-size: 13px;
          font-weight: 800;
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.24);
        }

        .pdfword-format {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 18px;
          color: #64748b;
          font-size: 11px;
        }

        .pdfword-format span:first-child {
          padding: 4px 9px;
          border: 1px solid rgba(96, 165, 250, 0.2);
          border-radius: 6px;
          background: rgba(37, 99, 235, 0.1);
          color: #93c5fd;
          font-weight: 800;
        }

        .pdfword-selected {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 18px;
          padding: 16px;
          border: 1px solid rgba(96, 165, 250, 0.2);
          border-radius: 15px;
          background: rgba(5, 12, 27, 0.6);
        }

        .pdfword-file-icon {
          display: flex;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(37, 99, 235, 0.16);
          color: #60a5fa;
        }

        .pdfword-file-info {
          display: flex;
          min-width: 0;
          flex: 1;
          flex-direction: column;
          gap: 6px;
        }

        .pdfword-file-info strong {
          overflow-wrap: anywhere;
          color: #e2e8f0;
          font-size: 13px;
        }

        .pdfword-file-info span {
          color: #94a3b8;
          font-size: 11px;
        }

        .pdfword-remove {
          display: inline-flex;
          flex-shrink: 0;
          align-items: center;
          gap: 6px;
          padding: 9px 12px;
          border: 1px solid rgba(248, 113, 113, 0.22);
          border-radius: 9px;
          background: rgba(239, 68, 68, 0.07);
          color: #fca5a5;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
        }

        .pdfword-remove:hover {
          background: rgba(239, 68, 68, 0.15);
        }

        .pdfword-message {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          margin-top: 18px;
          padding: 14px 16px;
          border-radius: 12px;
          font-size: 13px;
          line-height: 1.6;
        }

        .pdfword-error {
          border: 1px solid rgba(248, 113, 113, 0.3);
          background: rgba(239, 68, 68, 0.09);
          color: #fca5a5;
        }

        .pdfword-success {
          border: 1px solid rgba(74, 222, 128, 0.25);
          background: rgba(34, 197, 94, 0.08);
          color: #86efac;
        }

        .pdfword-message svg {
          flex-shrink: 0;
        }

        .pdfword-progress {
          margin-top: 20px;
          padding: 17px;
          border: 1px solid rgba(96, 165, 250, 0.22);
          border-radius: 13px;
          background: rgba(37, 99, 235, 0.07);
        }

        .pdfword-progress-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #bfdbfe;
          font-size: 13px;
          font-weight: 700;
        }

        .pdfword-progress-track {
          height: 7px;
          overflow: hidden;
          margin-top: 14px;
          border-radius: 50px;
          background: #25334d;
        }

        .pdfword-progress-bar {
          width: 65%;
          height: 100%;
          border-radius: 50px;
          background: linear-gradient(90deg, #2563eb, #818cf8, #c084fc);
          animation: pdfword-loading 1.8s ease-in-out infinite alternate;
        }

        .pdfword-progress p {
          margin: 10px 0 0;
          color: #8293ad;
          font-size: 11px;
          line-height: 1.6;
        }

        .pdfword-spin {
          animation: pdfword-rotate 1s linear infinite;
        }

        @keyframes pdfword-rotate {
          to { transform: rotate(360deg); }
        }

        @keyframes pdfword-loading {
          from { width: 30%; }
          to { width: 95%; }
        }

        .pdfword-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
          margin-top: 23px;
        }

        .pdfword-actions button {
          display: inline-flex;
          min-height: 56px;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 18px;
          border-radius: 12px;
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          font-weight: 800;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
        }

        .pdfword-actions button:not(:disabled):hover {
          transform: translateY(-2px);
        }

        .pdfword-actions button:disabled {
          cursor: not-allowed;
          opacity: 0.38;
        }

        .pdfword-convert-button {
          border: 1px solid #477df5;
          background: linear-gradient(105deg, #2563eb, #6366f1);
          color: white;
          box-shadow: 0 9px 25px rgba(37, 99, 235, 0.2);
        }

        .pdfword-convert-button:not(:disabled):hover {
          box-shadow: 0 12px 30px rgba(37, 99, 235, 0.35);
        }

        .pdfword-download-button {
          border: 1px solid rgba(74, 222, 128, 0.35);
          background: rgba(34, 197, 94, 0.09);
          color: #86efac;
        }

        .pdfword-download-button:not(:disabled):hover {
          background: rgba(34, 197, 94, 0.16);
        }

        .pdfword-workspace-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 18px;
          color: #71829d;
          font-size: 11px;
        }

        .pdfword-workspace-footer svg {
          color: #4ade80;
        }

        .pdfword-features-section {
          margin-top: 90px;
        }

        .pdfword-section-heading {
          margin-bottom: 28px;
          text-align: center;
        }

        .pdfword-section-heading h2 {
          margin: 11px 0 9px;
          color: #f8fafc;
          font-size: clamp(24px, 4vw, 34px);
          font-weight: 850;
          letter-spacing: -1px;
          line-height: 1.2;
        }

        .pdfword-section-heading p {
          margin: 0;
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.7;
        }

        .pdfword-features-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .pdfword-feature-card {
          min-width: 0;
          padding: 25px;
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 19px;
          background: linear-gradient(145deg, #131e33, #10192b);
          transition: transform 0.25s, border-color 0.25s;
        }

        .pdfword-feature-card:hover {
          transform: translateY(-5px);
          border-color: rgba(96, 165, 250, 0.4);
        }

        .pdfword-feature-icon {
          display: flex;
          width: 49px;
          height: 49px;
          align-items: center;
          justify-content: center;
          margin-bottom: 19px;
          border-radius: 14px;
        }

        .feature-blue {
          background: rgba(59, 130, 246, 0.14);
          color: #60a5fa;
        }

        .feature-purple {
          background: rgba(168, 85, 247, 0.14);
          color: #c084fc;
        }

        .feature-green {
          background: rgba(34, 197, 94, 0.12);
          color: #4ade80;
        }

        .pdfword-feature-card h3 {
          margin: 0 0 9px;
          color: #f1f5f9;
          font-size: 16px;
          font-weight: 800;
        }

        .pdfword-feature-card p {
          margin: 0;
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.8;
        }

        .pdfword-steps-section {
          margin-top: 85px;
          padding: 38px 30px;
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 22px;
          background: linear-gradient(135deg, rgba(20, 31, 53, 0.95), rgba(13, 21, 38, 0.95));
        }

        .pdfword-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 25px;
        }

        .pdfword-step {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }

        .pdfword-step-number {
          display: flex;
          width: 45px;
          height: 45px;
          flex-shrink: 0;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(96, 165, 250, 0.24);
          border-radius: 13px;
          background: rgba(37, 99, 235, 0.13);
          color: #93c5fd;
          font-size: 14px;
          font-weight: 900;
        }

        .pdfword-step h3 {
          margin: 2px 0 7px;
          color: #f1f5f9;
          font-size: 14px;
          font-weight: 800;
        }

        .pdfword-step p {
          margin: 0;
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.7;
        }

        .pdfword-notice {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-top: 28px;
          padding: 17px 19px;
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 13px;
          background: rgba(245, 158, 11, 0.055);
          color: #fbbf24;
        }

        .pdfword-notice svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .pdfword-notice p {
          margin: 0;
          color: #aebbd0;
          font-size: 11px;
          line-height: 1.8;
        }

        .pdfword-notice strong {
          color: #fcd34d;
        }
        .pdfword-seo-section,
        .pdfword-faq-section,
        .pdfword-related-section {
          margin-top: 80px;
        }

        .pdfword-seo-content {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .pdfword-seo-content article,
        .pdfword-faq-list article {
          padding: 23px;
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 16px;
          background: linear-gradient(145deg, #131e33, #10192b);
        }

        .pdfword-seo-content h3,
        .pdfword-faq-list h3 {
          margin: 0 0 12px;
          color: #f1f5f9;
          font-size: 15px;
          line-height: 1.5;
        }

        .pdfword-seo-content p,
        .pdfword-faq-list p {
          margin: 0;
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.8;
        }

        .pdfword-faq-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
        }

        .pdfword-related-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 13px;
        }

        .pdfword-related-grid a {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 17px;
          border: 1px solid rgba(96, 165, 250, 0.2);
          border-radius: 12px;
          background: rgba(37, 99, 235, 0.07);
          color: #bfdbfe;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: 0.2s;
        }

        .pdfword-related-grid a:hover {
          border-color: #60a5fa;
          background: rgba(37, 99, 235, 0.15);
          transform: translateY(-2px);
        }

        @media (max-width: 760px) {
          .pdfword-seo-content,
          .pdfword-faq-list {
            grid-template-columns: 1fr;
          }

          .pdfword-related-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 480px) {
          .pdfword-related-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 760px) {
          .pdfword-page {
            padding: 55px 15px 75px;
          }

          .pdfword-workspace {
            padding: 21px;
          }

          .pdfword-features-grid {
            grid-template-columns: 1fr;
          }

          .pdfword-feature-card {
            padding: 22px;
          }

          .pdfword-steps-grid {
            grid-template-columns: 1fr;
            gap: 22px;
          }

          .pdfword-steps-section {
            padding: 27px 21px;
          }
        }

        @media (max-width: 520px) {
          .pdfword-page {
            padding: 42px 12px 65px;
          }

          .pdfword-hero {
            margin-bottom: 32px;
          }

          .pdfword-hero h1 {
            font-size: 43px;
            letter-spacing: -2px;
          }

          .pdfword-subtitle {
            font-size: 13px;
            line-height: 1.8;
          }

          .pdfword-trust {
            gap: 10px 15px;
            font-size: 10px;
          }

          .pdfword-workspace {
            padding: 17px;
            border-radius: 19px;
          }

          .pdfword-workspace-heading h2 {
            font-size: 21px;
          }

          .pdfword-dropzone {
            min-height: 235px;
            padding: 22px 12px;
          }

          .pdfword-dropzone h3 {
            font-size: 17px;
          }

          .pdfword-selected {
            flex-wrap: wrap;
          }

          .pdfword-remove {
            margin-left: 62px;
          }

          .pdfword-actions {
            grid-template-columns: 1fr;
          }

          .pdfword-actions button {
            min-height: 52px;
          }

          .pdfword-features-section {
            margin-top: 65px;
          }

          .pdfword-steps-section {
            margin-top: 65px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .pdfword-page *,
          .pdfword-page *::before,
          .pdfword-page *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}
