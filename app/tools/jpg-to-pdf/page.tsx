
"use client";

import { useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import {
  Image as ImageIcon,
  Upload,
  FileText,
  Download,
  Trash2,
  Loader2,
  CheckCircle2,
  X,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
} from "lucide-react";

type ImageFile = {
  id: string;
  file: File;
  preview: string;
};

const relatedTools = [
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
    description: "Reduce the size of your PDF files.",
    href: "/tools/compress-pdf",
  },
  {
    title: "PDF to Word",
    description: "Convert PDF documents into Word files.",
    href: "/tools/pdf-to-word",
  },
  {
    title: "Word to PDF",
    description: "Convert Word documents into PDF format.",
    href: "/tools/word-to-pdf",
  },
  {
    title: "Protect PDF",
    description: "Add password protection to PDF documents.",
    href: "/tools/protect-pdf",
  },
];

const faqs = [
  {
    question: "How do I convert JPG images to PDF?",
    answer:
      "Upload your JPG, JPEG or PNG images using the image selector. Arrange the images in the order you want, then click Convert to PDF. When processing finishes, download your PDF document.",
  },
  {
    question: "Can I convert multiple images into one PDF?",
    answer:
      "Yes. You can select multiple supported images and combine them into a single PDF document. Each image is placed on its own PDF page.",
  },
  {
    question: "Does JPG to PDF support PNG images?",
    answer:
      "Yes. PDFMaster supports JPG, JPEG and PNG image formats for conversion into PDF.",
  },
  {
    question: "Will my images keep their upload order?",
    answer:
      "Yes. Images are added to the PDF in the same order they appear in your selected image list. Select your images in the preferred order when uploading.",
  },
  {
    question: "Will the image fit on the PDF page?",
    answer:
      "The converter scales each image proportionally to fit within an A4-sized PDF page with margins. It keeps the image proportions instead of stretching it.",
  },
  {
    question: "Are my images uploaded to a server?",
    answer:
      "The conversion is performed locally in your browser using PDF processing technology. The page does not send your selected images to a PDF conversion server.",
  },
  {
    question: "Can I open the converted PDF on my phone?",
    answer:
      "Yes. The downloaded PDF can be opened with standard PDF reader apps on supported phones, tablets and computers.",
  },
  {
    question: "Is the JPG to PDF converter free?",
    answer:
      "PDFMaster provides this JPG to PDF conversion tool for free. You can combine supported images into a PDF without creating an account.",
  },
];

export default function JPGToPDFPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfName, setPdfName] = useState("converted-images.pdf");

  const imagesRef = useRef<ImageFile[]>([]);
  const pdfUrlRef = useRef("");

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });

      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
      }
    };
  }, []);

  const updateImages = (nextImages: ImageFile[]) => {
    imagesRef.current = nextImages;
    setImages(nextImages);
  };

  const updatePdfUrl = (url: string) => {
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
    }

    pdfUrlRef.current = url;
    setPdfUrl(url);
  };

  const addImages = (files: FileList | null) => {
    if (!files) return;

    setError("");
    setSuccess("");
    updatePdfUrl("");

    const selected = Array.from(files);
    const validImages = selected.filter((file) =>
      ["image/jpeg", "image/png"].includes(file.type)
    );

    if (validImages.length !== selected.length) {
      setError("Only JPG, JPEG and PNG images are supported.");
    }

    if (validImages.length === 0) return;

    const newImages = validImages.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    updateImages([...imagesRef.current, ...newImages]);
  };

  const removeImage = (id: string) => {
    const imageToRemove = imagesRef.current.find(
      (image) => image.id === id
    );

    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }

    updateImages(
      imagesRef.current.filter((image) => image.id !== id)
    );

    updatePdfUrl("");
    setSuccess("");
  };

  const clearImages = () => {
    imagesRef.current.forEach((image) => {
      URL.revokeObjectURL(image.preview);
    });

    updateImages([]);
    updatePdfUrl("");
    setSuccess("");
    setError("");
  };

  const convertToPDF = async () => {
    if (imagesRef.current.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    updatePdfUrl("");

    try {
      const selectedImages = [...imagesRef.current];
      const pdf = await PDFDocument.create();

      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const margin = 24;

      for (const image of selectedImages) {
        const bytes = await image.file.arrayBuffer();

        const embeddedImage =
          image.file.type === "image/png"
            ? await pdf.embedPng(bytes)
            : await pdf.embedJpg(bytes);

        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - margin * 2;

        const scale = Math.min(
          availableWidth / embeddedImage.width,
          availableHeight / embeddedImage.height
        );

        const width = embeddedImage.width * scale;
        const height = embeddedImage.height * scale;

        const page = pdf.addPage([pageWidth, pageHeight]);

        page.drawImage(embeddedImage, {
          x: (pageWidth - width) / 2,
          y: (pageHeight - height) / 2,
          width,
          height,
        });
      }

      const pdfBytes = await pdf.save();

      const blob = new Blob(
        [pdfBytes.buffer as ArrayBuffer],
        { type: "application/pdf" }
      );

      const url = URL.createObjectURL(blob);

      updatePdfUrl(url);
      setPdfName("converted-images.pdf");
      setSuccess(
        `Successfully converted ${selectedImages.length} image(s) into one PDF.`
      );
    } catch (err) {
      console.error(err);
      setError(
        "Conversion failed. Please check your images and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!pdfUrl) return;

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = pdfName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <main className="jpg-page">
      <section className="jpg-hero">
        <div className="jpg-hero-icon">
          <ImageIcon size={30} />
        </div>

        <span className="jpg-eyebrow">FREE ONLINE PDF TOOL</span>

        <h1>JPG to PDF Converter</h1>

        <p>
          Convert JPG, JPEG and PNG images into a PDF document online.
          Upload multiple images, combine them into one PDF file and
          download your document in seconds.
        </p>
      </section>

      <section className="jpg-workspace">
        <label className="jpg-upload-box">
          <input
            type="file"
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            multiple
            hidden
            onChange={(event) => {
              addImages(event.target.files);
              event.target.value = "";
            }}
          />

          <div className="jpg-upload-icon">
            <Upload size={28} />
          </div>

          <h2>Upload Your Images</h2>

          <p>Choose JPG, JPEG or PNG images from your device</p>

          <span className="jpg-upload-button">
            Select Images
          </span>

          <small>You can select multiple images</small>
        </label>

        {error && (
          <div className="jpg-error">
            <X size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="jpg-success">
            <CheckCircle2 size={19} />
            {success}
          </div>
        )}

        {images.length > 0 && (
          <div className="jpg-images-section">
            <div className="jpg-list-heading">
              <div>
                <h2>Your Images</h2>
                <p>{images.length} image(s) selected</p>
              </div>

              <button
                className="jpg-clear-button"
                onClick={clearImages}
              >
                <Trash2 size={16} />
                Clear All
              </button>
            </div>

            <div className="jpg-image-grid">
              {images.map((image, index) => (
                <div className="jpg-image-card" key={image.id}>
                  <div className="jpg-preview">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.preview} alt={image.file.name} />

                    <button
                      className="jpg-remove-image"
                      onClick={() => removeImage(image.id)}
                      aria-label={`Remove ${image.file.name}`}
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="jpg-image-details">
                    <strong>Image {index + 1}</strong>
                    <span>{image.file.name}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="jpg-convert-button"
              onClick={convertToPDF}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="jpg-spinner" size={20} />
                  Converting Images...
                </>
              ) : (
                <>
                  <FileText size={20} />
                  Convert to PDF
                </>
              )}
            </button>
          </div>
        )}

        {pdfUrl && (
          <div className="jpg-download-section">
            <div className="jpg-download-icon">
              <CheckCircle2 size={28} />
            </div>

            <div className="jpg-download-info">
              <h3>Your PDF is Ready!</h3>
              <p>{pdfName}</p>
            </div>

            <button
              className="jpg-download-button"
              onClick={downloadPDF}
            >
              <Download size={19} />
              Download PDF
            </button>
          </div>
        )}
      </section>

      <section className="jpg-features">
        <div>
          <ImageIcon size={23} />
          <h3>Multiple Images</h3>
          <p>
            Combine multiple JPG and PNG images into one PDF document.
          </p>
        </div>

        <div>
          <Layers size={23} />
          <h3>Original Order</h3>
          <p>
            Your images appear in the same order you upload them.
          </p>
        </div>

        <div>
          <ShieldCheck size={23} />
          <h3>Browser Processing</h3>
          <p>
            Your selected images are processed locally in your browser.
          </p>
        </div>
      </section>

      <section className="jpg-seo-content">
        <div className="jpg-content-heading">
          <span>PDFMASTER IMAGE CONVERTER</span>
          <h2>Convert JPG to PDF Online for Free</h2>
          <p>
            Turn your pictures into a convenient PDF document with
            PDFMaster. Our free JPG to PDF converter helps you combine
            multiple JPG, JPEG and PNG images into a single PDF file
            directly from your browser.
          </p>
        </div>

        <div className="jpg-info-grid">
          <article className="jpg-info-card">
            <div className="jpg-info-icon">
              <ImageIcon size={22} />
            </div>
            <h3>Convert JPG and PNG Images</h3>
            <p>
              Use common image formats including JPG, JPEG and PNG.
              Select several pictures and turn them into one organized
              PDF document without installing additional software.
            </p>
          </article>

          <article className="jpg-info-card">
            <div className="jpg-info-icon">
              <Layers size={22} />
            </div>
            <h3>Combine Multiple Pictures</h3>
            <p>
              Instead of sharing many separate image files, combine
              your selected pictures into one PDF. Each image is
              placed on its own page in the selected order.
            </p>
          </article>

          <article className="jpg-info-card">
            <div className="jpg-info-icon">
              <Zap size={22} />
            </div>
            <h3>Simple Online Conversion</h3>
            <p>
              No desktop installation is required. Open the converter
              in a supported browser, select your images and create
              your PDF document.
            </p>
          </article>

          <article className="jpg-info-card">
            <div className="jpg-info-icon">
              <ShieldCheck size={22} />
            </div>
            <h3>Local Browser Processing</h3>
            <p>
              Image conversion takes place in your browser using
              PDF processing technology. Your selected image files
              are not sent to a conversion server by this tool.
            </p>
          </article>
        </div>

        <div className="jpg-how-to">
          <h2>How to Convert JPG to PDF</h2>
          <p>
            Follow these simple steps to create a PDF from your images.
          </p>

          <div className="jpg-steps">
            <div className="jpg-step">
              <span>01</span>
              <div>
                <h3>Select Your Images</h3>
                <p>
                  Click Select Images and choose JPG, JPEG or PNG
                  files from your device. You can select multiple images.
                </p>
              </div>
            </div>

            <div className="jpg-step">
              <span>02</span>
              <div>
                <h3>Check Your Image List</h3>
                <p>
                  Review the selected images. Remove any image you
                  do not want included in your PDF document.
                </p>
              </div>
            </div>

            <div className="jpg-step">
              <span>03</span>
              <div>
                <h3>Convert and Download</h3>
                <p>
                  Select Convert to PDF. When the document is ready,
                  click Download PDF to save it to your device.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="jpg-uses">
          <h2>What Can You Use JPG to PDF For?</h2>
          <p>
            Converting pictures into PDF format can make everyday
            document sharing and organization easier.
          </p>

          <ul>
            <li>Combine scanned document pictures into one PDF.</li>
            <li>Organize multiple receipts in a single document.</li>
            <li>Prepare image-based notes for sharing.</li>
            <li>Put several photographs into one PDF file.</li>
            <li>Keep image pages together in a convenient format.</li>
          </ul>
        </div>

        <div className="jpg-faq-section">
          <h2>Frequently Asked Questions</h2>
          <p>
            Find answers to common questions about converting JPG
            and PNG images into PDF files.
          </p>

          <div className="jpg-faq-list">
            {faqs.map((faq, index) => (
              <details className="jpg-faq-item" key={index}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="jpg-related">
        <div className="jpg-related-heading">
          <span>MORE FREE PDF TOOLS</span>
          <h2>Explore Other PDF Tools</h2>
          <p>
            Continue working with your documents using these free
            PDFMaster tools.
          </p>
        </div>

        <div className="jpg-related-grid">
          {relatedTools.map((tool) => (
            <a
              href={tool.href}
              className="jpg-related-card"
              key={tool.href}
            >
              <div>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
              </div>
              <ArrowRight size={19} />
            </a>
          ))}
        </div>
      </section>

      <style jsx>{`
        .jpg-page {
          min-height: 80vh;
          padding: 65px 20px 80px;
          background: #f7f8fc;
          color: #101a35;
        }

        .jpg-hero {
          max-width: 760px;
          margin: 0 auto 38px;
          text-align: center;
        }

        .jpg-hero-icon {
          width: 65px;
          height: 65px;
          display: grid;
          place-items: center;
          margin: 0 auto 18px;
          border-radius: 20px;
          background: #eeeaff;
          color: #7255e8;
        }

        .jpg-eyebrow {
          color: #7255e8;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .jpg-hero h1 {
          margin: 12px 0;
          font-size: clamp(30px, 5vw, 48px);
          font-weight: 900;
          letter-spacing: -1.8px;
        }

        .jpg-hero p {
          max-width: 620px;
          margin: 0 auto;
          color: #69738d;
          font-size: 15px;
          line-height: 1.8;
        }

        .jpg-workspace {
          max-width: 900px;
          margin: 0 auto;
          padding: 25px;
          border: 1px solid #e3e8f2;
          border-radius: 23px;
          background: white;
          box-shadow: 0 18px 55px rgba(22, 34, 70, 0.07);
        }

        .jpg-upload-box {
          min-height: 270px;
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

        .jpg-upload-box:hover {
          border-color: #7255e8;
          background: #f4f1ff;
        }

        .jpg-upload-icon {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          border-radius: 17px;
          background: #eeeaff;
          color: #7255e8;
        }

        .jpg-upload-box h2 {
          margin: 17px 0 5px;
          font-size: 21px;
        }

        .jpg-upload-box p {
          margin: 0 0 17px;
          color: #69738d;
          font-size: 13px;
          text-align: center;
        }

        .jpg-upload-button,
        .jpg-convert-button,
        .jpg-download-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 13px 22px;
          border: 0;
          border-radius: 11px;
          background: #7255e8;
          color: white;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s;
        }

        .jpg-upload-button:hover,
        .jpg-convert-button:hover,
        .jpg-download-button:hover {
          background: #5940c7;
          transform: translateY(-2px);
        }

        .jpg-upload-box small {
          margin-top: 14px;
          color: #929bb0;
          font-size: 11px;
        }

        .jpg-images-section {
          margin-top: 28px;
        }

        .jpg-list-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
        }

        .jpg-list-heading h2 {
          margin: 0 0 5px;
          font-size: 20px;
        }

        .jpg-list-heading p {
          margin: 0;
          color: #69738d;
          font-size: 12px;
        }

        .jpg-clear-button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 12px;
          border: 1px solid #f2d5d8;
          border-radius: 9px;
          background: #fff5f5;
          color: #c0394b;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .jpg-image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(145px, 1fr));
          gap: 14px;
        }

        .jpg-image-card {
          overflow: hidden;
          border: 1px solid #e3e8f2;
          border-radius: 13px;
          background: white;
        }

        .jpg-preview {
          position: relative;
          height: 135px;
          display: grid;
          place-items: center;
          padding: 8px;
          background: #f4f5fa;
        }

        .jpg-preview img {
          max-width: 100%;
          max-height: 120px;
          object-fit: contain;
        }

        .jpg-remove-image {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 27px;
          height: 27px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 50%;
          background: #fff;
          color: #d64b5b;
          cursor: pointer;
          box-shadow: 0 2px 8px #00000015;
        }

        .jpg-image-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 10px;
        }

        .jpg-image-details strong {
          font-size: 12px;
        }

        .jpg-image-details span {
          overflow: hidden;
          color: #8992a8;
          font-size: 10px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .jpg-convert-button {
          width: 100%;
          margin-top: 22px;
          padding: 16px;
          font-size: 15px;
        }

        .jpg-convert-button:disabled {
          cursor: wait;
          opacity: 0.7;
        }

        .jpg-spinner {
          animation: jpg-spin 1s linear infinite;
        }

        @keyframes jpg-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .jpg-error,
        .jpg-success {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 16px;
          padding: 13px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.5;
        }

        .jpg-error {
          background: #fff0f0;
          color: #c0394b;
        }

        .jpg-success {
          background: #edfaf2;
          color: #21834a;
        }

        .jpg-download-section {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-top: 22px;
          padding: 18px;
          border: 1px solid #d8eddf;
          border-radius: 15px;
          background: #f5fcf7;
        }

        .jpg-download-icon {
          color: #21834a;
        }

        .jpg-download-info {
          flex: 1;
          min-width: 0;
        }

        .jpg-download-info h3 {
          margin: 0 0 5px;
          font-size: 15px;
        }

        .jpg-download-info p {
          margin: 0;
          color: #69738d;
          font-size: 12px;
        }

        .jpg-features {
          max-width: 950px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 45px auto 0;
        }

        .jpg-features > div {
          padding: 22px;
          border: 1px solid #e3e8f2;
          border-radius: 16px;
          background: white;
        }

        .jpg-features svg {
          color: #7255e8;
        }

        .jpg-features h3 {
          margin: 12px 0 6px;
          font-size: 15px;
        }

        .jpg-features p {
          margin: 0;
          color: #69738d;
          font-size: 12px;
          line-height: 1.7;
        }

        .jpg-seo-content {
          max-width: 950px;
          margin: 75px auto 0;
        }

        .jpg-content-heading,
        .jpg-related-heading {
          max-width: 760px;
          margin: 0 auto 30px;
          text-align: center;
        }

        .jpg-content-heading > span,
        .jpg-related-heading > span {
          color: #7255e8;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.8px;
        }

        .jpg-content-heading h2,
        .jpg-related-heading h2 {
          margin: 12px 0;
          font-size: clamp(24px, 4vw, 34px);
          font-weight: 900;
          letter-spacing: -0.8px;
        }

        .jpg-content-heading p,
        .jpg-related-heading p {
          color: #69738d;
          font-size: 14px;
          line-height: 1.9;
        }

        .jpg-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 17px;
        }

        .jpg-info-card {
          padding: 23px;
          border: 1px solid #e3e8f2;
          border-radius: 16px;
          background: white;
        }

        .jpg-info-icon {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #eeeaff;
          color: #7255e8;
        }

        .jpg-info-card h3 {
          margin: 15px 0 8px;
          font-size: 16px;
        }

        .jpg-info-card p {
          margin: 0;
          color: #69738d;
          font-size: 13px;
          line-height: 1.8;
        }

        .jpg-how-to,
        .jpg-uses,
        .jpg-faq-section {
          margin-top: 45px;
          padding: 28px;
          border: 1px solid #e3e8f2;
          border-radius: 18px;
          background: white;
        }

        .jpg-how-to > h2,
        .jpg-uses > h2,
        .jpg-faq-section > h2 {
          margin: 0 0 9px;
          font-size: 23px;
          font-weight: 850;
        }

        .jpg-how-to > p,
        .jpg-uses > p,
        .jpg-faq-section > p {
          margin: 0 0 22px;
          color: #69738d;
          font-size: 13px;
          line-height: 1.8;
        }

        .jpg-steps {
          display: grid;
          gap: 17px;
        }

        .jpg-step {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }

        .jpg-step > span {
          flex: 0 0 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #eeeaff;
          color: #7255e8;
          font-size: 13px;
          font-weight: 900;
        }

        .jpg-step h3 {
          margin: 2px 0 5px;
          font-size: 15px;
        }

        .jpg-step p {
          margin: 0;
          color: #69738d;
          font-size: 13px;
          line-height: 1.8;
        }

        .jpg-uses ul {
          display: grid;
          gap: 12px;
          margin: 0;
          padding-left: 22px;
          color: #47536e;
          font-size: 13px;
          line-height: 1.7;
        }

        .jpg-faq-list {
          display: grid;
          gap: 11px;
        }

        .jpg-faq-item {
          padding: 16px 18px;
          border: 1px solid #e6e9f1;
          border-radius: 12px;
          background: #fcfcff;
        }

        .jpg-faq-item summary {
          color: #182340;
          font-size: 14px;
          font-weight: 750;
          cursor: pointer;
          line-height: 1.6;
        }

        .jpg-faq-item p {
          margin: 12px 0 0;
          color: #69738d;
          font-size: 13px;
          line-height: 1.8;
        }

        .jpg-related {
          max-width: 950px;
          margin: 75px auto 0;
        }

        .jpg-related-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 13px;
        }

        .jpg-related-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 18px;
          border: 1px solid #e3e8f2;
          border-radius: 14px;
          background: white;
          color: #182340;
          text-decoration: none;
          transition: 0.2s;
        }

        .jpg-related-card:hover {
          border-color: #b9aaf4;
          transform: translateY(-2px);
          box-shadow: 0 8px 22px rgba(22, 34, 70, 0.06);
        }

        .jpg-related-card h3 {
          margin: 0 0 5px;
          font-size: 14px;
        }

        .jpg-related-card p {
          margin: 0;
          color: #69738d;
          font-size: 12px;
          line-height: 1.6;
        }

        .jpg-related-card > svg {
          flex-shrink: 0;
          color: #7255e8;
        }

        @media (max-width: 650px) {
          .jpg-page {
            padding: 40px 13px 55px;
          }

          .jpg-workspace {
            padding: 13px;
          }

          .jpg-download-section {
            flex-wrap: wrap;
          }

          .jpg-download-button {
            width: 100%;
          }

          .jpg-features,
          .jpg-info-grid,
          .jpg-related-grid {
            grid-template-columns: 1fr;
          }

          .jpg-how-to,
          .jpg-uses,
          .jpg-faq-section {
            padding: 20px 16px;
          }

          .jpg-content-heading h2,
          .jpg-related-heading h2 {
            font-size: 26px;
          }
        }
      `}</style>
    </main>
  );
}
