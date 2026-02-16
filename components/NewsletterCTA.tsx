"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

interface NewsletterCTAProps {
  heading?: string;
  description?: string;
  className?: string;
}

export default function NewsletterCTA({
  heading = "Yeni Koleksiyonlardan Haberdar Olun",
  description = "Özel fırsatları kaçırmayın. Yeni koleksiyonlar ve duyurulardan ilk siz haberdar olun.",
  className = "",
}: NewsletterCTAProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Abonelik başarısız");
        return;
      }
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMsg("Bağlantı hatası. Lütfen tekrar deneyin.");
    }
  };

  return (
    <section className={`border-t border-[#e8e6e3] bg-white py-16 ${className}`}>
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <Mail className="mx-auto mb-4 h-10 w-10 text-[#d4af7a]" />
        <h2 className="mb-3 font-serif text-2xl font-light text-[#1a1a1a] sm:text-3xl">
          {heading}
        </h2>
        <p className="mb-6 text-sm text-[#666]">
          {description}
        </p>
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-md gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta adresiniz"
            className="flex-1 rounded-full border border-[#e8e6e3] bg-[#faf8f5] px-5 py-3 text-sm outline-none focus:border-[#0f3f44] focus:ring-2 focus:ring-[#0f3f44]/20"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-[#0f3f44] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "..." : "Abone Ol"}
          </button>
        </form>
        {status === "error" && (
          <p className="mt-3 text-sm text-red-600">{errorMsg}</p>
        )}
        {status === "success" && (
          <p className="mt-3 text-sm text-green-700">Teşekkürler! Başarıyla kaydoldunuz.</p>
        )}
        <p className="mt-3 text-xs text-[#999]">
          Abonelikten istediğiniz zaman çıkabilirsiniz.
        </p>
      </div>
    </section>
  );
}
