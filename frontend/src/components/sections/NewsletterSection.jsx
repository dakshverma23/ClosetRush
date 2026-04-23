import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { message } from "antd";
import { MailOutlined, TwitterOutlined, LinkedinOutlined, GithubOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [newsletterLogo, setNewsletterLogo] = useState(localStorage.getItem("newsletterLogo") || "");
  const [brandName, setBrandName] = useState(localStorage.getItem("brandName") || "ClosetRush");

  useEffect(() => {
    const handler = () => {
      setNewsletterLogo(localStorage.getItem("newsletterLogo") || "");
      setBrandName(localStorage.getItem("brandName") || "ClosetRush");
    };
    window.addEventListener("storage", handler);
    const t = setInterval(handler, 1000);
    return () => { window.removeEventListener("storage", handler); clearInterval(t); };
  }, []);

  const handleSubscribe = () => {
    if (!email) { message.warning("Please enter your email"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { message.error("Please enter a valid email"); return; }
    setLoading(true);
    setTimeout(() => { message.success("Successfully subscribed!"); setEmail(""); setLoading(false); }, 1000);
  };

  return (
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(to bottom, #ffffff, #f0f6ff)" }}>

      {/* ── Newsletter band ── */}
      <div className="relative z-10 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Logo / illustration */}
            <motion.div
              className="flex justify-center lg:justify-start"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              {newsletterLogo ? (
                <img src={newsletterLogo} alt="Newsletter" className="w-56 h-56 object-contain drop-shadow-xl" />
              ) : (
                /* Brand card placeholder */
                <div className="w-56 h-56 rounded-3xl flex flex-col items-center justify-center gap-3 shadow-xl"
                  style={{ background: "#ffffff", border: "1px solid rgba(168,196,240,0.4)" }}
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                    style={{ background: "linear-gradient(145deg,#1a3a8a,#3a7bd5)" }}
                  >
                    {brandName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-lg font-bold" style={{ color: "#0f2a52" }}>{brandName}</span>
                  <span className="text-xs text-center px-4" style={{ color: "#6a8aaa" }}>
                    Fresh bedding subscription service
                  </span>
                </div>
              )}
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: "#0f2a52" }}>
                Stay Fresh, Stay Informed!
              </h2>
              <p className="text-lg mb-6" style={{ color: "#4a6a8a" }}>
                Let's subscribe with us and find the fun.
              </p>

              <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-2 px-4 rounded-xl h-12 border-2"
                  style={{ background: "#fff", borderColor: "rgba(168,196,240,0.6)" }}
                >
                  <MailOutlined style={{ color: "#3a7bd5", fontSize: 16 }} />
                  <input
                    type="email"
                    placeholder="Drop Your Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubscribe()}
                    className="flex-1 bg-transparent outline-none text-sm"
                    style={{ color: "#0f2a52" }}
                  />
                </div>
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="h-12 px-7 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:scale-105 hover:shadow-lg flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#1a3a8a,#3a7bd5)" }}
                >
                  {loading ? "..." : "Subscribe"}
                </button>
              </div>

              <p className="text-sm mt-3 flex items-center gap-1.5" style={{ color: "#6a8aaa" }}>
                <span>🔒</span> We respect your privacy. Unsubscribe at any time.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Wave divider ── */}
      <div className="relative" style={{ marginBottom: -2 }}>
        <svg viewBox="0 0 1440 80" className="w-full block" preserveAspectRatio="none" style={{ height: 60 }}>
          <path
            fill="#0f2a52"
            d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
          />
        </svg>
      </div>

      {/* ── Footer ── */}
      <div className="relative text-white pt-12 pb-8"
        style={{ background: "linear-gradient(160deg,#0f2a52 0%,#1a3a8a 50%,#0d2448 100%)" }}
      >
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "32px 32px" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                  style={{ background: "rgba(168,196,240,0.2)", border: "1px solid rgba(168,196,240,0.3)", color: "#a8c4f0" }}
                >
                  {brandName.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-lg font-bold text-white">{brandName}</span>
              </div>
              <p className="text-sm mb-5 leading-relaxed" style={{ color: "rgba(252, 252, 252, 1)" }}>
                {brandName} is a fresh bedding subscription service who care about your sleep comfort.
              </p>
              <div className="flex gap-2.5">
                {[TwitterOutlined, LinkedinOutlined, GithubOutlined].map((Icon, i) => (
                  <a key={i} href="#"
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{ background: "rgba(168,196,240,0.12)", border: "1px solid rgba(168,196,240,0.2)" }}
                  >
                    <Icon style={{ color: "#ffffffff", fontSize: 14 }} />
                  </a>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-sm font-bold mb-4 tracking-wide uppercase" style={{ color: "#ffffffff" }}>Services</h3>
              <ul className="space-y-2.5">
                {[
                  ["Individual Subscription", "/subscriptions"],
                  ["Business Subscription", "/business/subscriptions"],
                  ["What We Offer", "/what-we-offer"],
                  ["Pricing Plans", "/pricing"],
                  ["Get a Quote", "/get-quote"],
                ].map(([label, to]) => (
                  <li key={to}>
                    <Link to={to} className="text-sm transition-colors duration-200 hover:text-white"
                      style={{ color: "rgba(255, 255, 255, 1)" }}
                    >{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-bold mb-4 tracking-wide uppercase" style={{ color: "#ffffffff" }}>Company</h3>
              <ul className="space-y-2.5">
                {[
                  ["Science Behind", "/science-behind"],
                  ["Our Story", "/about"],
                  ["Our Philosophy", "/philosophy"],
                  ["Leadership & Team", "/team"],
                  ["Careers", "/careers"],
                ].map(([label, to]) => (
                  <li key={to}>
                    <Link to={to} className="text-sm transition-colors duration-200 hover:text-white"
                      style={{ color: "rgba(255, 255, 255, 1)" }}
                    >{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-bold mb-4 tracking-wide uppercase" style={{ color: "#ffffffff" }}>Contact Us</h3>
              <ul className="space-y-2.5">
                {[
                  ["Business Inquiry", "/contact"],
                  ["Customer Support", "/support"],
                  ["Join The Team", "/join"],
                  ["Privacy Policy", "/privacy"],
                  ["Terms Of Service", "/terms"],
                ].map(([label, to]) => (
                  <li key={to}>
                    <Link to={to} className="text-sm transition-colors duration-200 hover:text-white"
                      style={{ color: "rgba(255, 255, 255, 1)" }}
                    >{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t pt-6 text-center" style={{ borderColor: "rgba(168,196,240,0.15)" }}>
            <p className="text-sm" style={{ color: "rgba(255, 255, 255, 1)" }}>
              © 2024 All Rights Reserved · {brandName} — Fresh Bedding Subscription Service
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
