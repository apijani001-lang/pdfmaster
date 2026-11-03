import Link from "next/link";

const promotions = [
  {
    name: "AAPI Compressor",
    description: "Compress images, videos and audio online",
    url: "https://compressvideos.apijani001.workers.dev/",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&auto=format&fit=crop&q=85",
    label: "MEDIA TOOLS",
  },
  {
    name: "Watch Deals",
    description: "Explore premium and smart watches",
    url: "https://watch-deals-ruddy.vercel.app/",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&auto=format&fit=crop&q=85",
    label: "WATCH COLLECTION",
  },
  {
    name: "SciCalcPro",
    description: "A powerful online scientific calculator",
    url: "https://scicalcpro.vercel.app/",
    image:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=700&auto=format&fit=crop&q=85",
    label: "SMART CALCULATOR",
  },
  {
    name: "Shah Rehan Jewellers",
    description: "Discover beautiful jewellery collections",
    url: "https://bilalmarghoobboutique-cmyk.github.io/shah-rehan-jewellers/index.html",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=700&auto=format&fit=crop&q=85",
    label: "JEWELLERY",
  },
  {
    name: "Bilal Marghoob Creations",
    description: "Professional website design and digital services",
    url: "https://bilal.sidra-ai-creation.workers.dev/",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&auto=format&fit=crop&q=85",
    label: "WEB DESIGN",
  },
];

export function PromoAdStrip({ position }: { position: "top" | "bottom" }) {
  return (
    <section className={`promo-section promo-${position}`}>
      <div className="promo-heading">
        <span>PARTNER SHOWCASE</span>
        <span className="promo-heading-line" />
        <span>EXPLORE OUR NETWORK</span>
      </div>

      <div className="promo-grid">
        {promotions.map((item) => (
          <Link
            href={item.url}
            key={item.name}
            target="_blank"
            rel="noopener noreferrer"
            className="promo-card"
            style={{ backgroundImage: `url("${item.image}")` }}
          >
            <span className="promo-overlay" />
            <span className="promo-content">
              <span className="promo-label">{item.label}</span>
              <strong>{item.name}</strong>
              <span className="promo-description">{item.description}</span>
              <span className="promo-visit">Visit Website ↗</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <Link href="/" className="footer-brand">
            PDF<span>Master</span>
          </Link>
          <p className="footer-description">
            Simple, powerful and convenient PDF tools for your everyday work.
          </p>
        </div>

        <div className="footer-contact">
          <span className="footer-small-title">WEBSITE CREATION</span>
          <strong>Bilal Marghoob Creations</strong>
          <a
            href="https://wa.me/923266501314"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp: 00923266501314
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {2026} PDFMaster. All rights reserved.</span>
        <span>Designed by Bilal Marghoob Creations</span>
      </div>
    </footer>
  );
}