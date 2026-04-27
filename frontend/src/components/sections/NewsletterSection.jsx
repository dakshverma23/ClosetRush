import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { message } from "antd";
import { MailOutlined, ArrowRightOutlined } from "@ant-design/icons";

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
    setLoading(true);
    setTimeout(() => { message.success("Joined!"); setEmail(""); setLoading(false); }, 1000);
  };

  return (
    <section className="py-16 px-6 bg-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="max-w-4xl mx-auto rounded-[32px] p-8 md:p-12 relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] border border-slate-50"
        style={{ background: "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)" }}
      >
        {/* Subtle Background Glows to keep it "airy" */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          
          {/* Compact Logo Visual */}
          <div className="flex-shrink-0">
            {newsletterLogo ? (
              <img src={newsletterLogo} alt="Logo" className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-xl" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 text-2xl font-black">
                {brandName.slice(0, 2)}
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
              Stay Fresh, <span className="text-blue-400">Informed.</span>
            </h2>
            <p className="text-slate-400 text-base mb-8 max-w-sm mx-auto md:mx-0">
              Join the {brandName} circle for sleep science and exclusive hygiene tips.
            </p>

            {/* Slimmed Modern Input */}
            <div className="relative group max-w-md mx-auto md:mx-0">
              <div className="flex items-center gap-2 p-1 rounded-full bg-white/5 border border-white/10 transition-all duration-300 focus-within:border-blue-500/50 focus-within:bg-white/10">
                <div className="flex items-center gap-3 px-4 flex-1">
                  <MailOutlined className="text-slate-500" />
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="bg-transparent border-none outline-none w-full py-3 text-white placeholder:text-slate-600 text-sm font-medium"
                  />
                </div>
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="px-6 py-3 rounded-full bg-blue-600 text-white font-black text-xs uppercase tracking-widest transition-all hover:bg-blue-500 active:scale-95 flex items-center gap-2"
                >
                  {loading ? "..." : "Join"} <ArrowRightOutlined />
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-[0.2em] font-bold">
              🔒 Private • Weekly • No Spam
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}