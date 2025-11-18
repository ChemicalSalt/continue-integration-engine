import { useEffect, useState } from "react";
import { sanitizeDynamic } from "../utils/sanitize";

const Contact = ({ darkMode }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://www.google.com/recaptcha/api.js?render=6Lc1UWUrAAAAAN9u-CzXBFk8RYek-PsaP8ivJbwm";
    script.async = true;
    document.body.appendChild(script);
    document.body.classList.add("contact-page");

    return () => {
      document.body.removeChild(script);
      document.body.classList.remove("contact-page");
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError(null);

    try {
      const sanitizedName = sanitizeDynamic(name);
      const sanitizedEmail = sanitizeDynamic(email);
      const sanitizedMessage = sanitizeDynamic(message, { maxLen: 1000 });

      const token = window.grecaptcha
        ? await window.grecaptcha.execute(
            "6Lc1UWUrAAAAAN9u-CzXBFk8RYek-PsaP8ivJbwm",
            { action: "submit" }
          )
        : null;

      await addDoc(collection(db, "messages"), {
        name: sanitizedName,
        email: sanitizedEmail,
        message: sanitizedMessage,
        recaptchaToken: token || "",
        timestamp: Timestamp.now(),
      });

      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      console.error("Firestore error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center px-6 py-20 font-sans transition-colors duration-500 ${
        darkMode ? "bg-black text-zinc-100" : "bg-white text-zinc-900"
      }`}
    >
      {/* Header */}
      <section className="text-center mb-12">
        <h2
          className={`text-4xl md:text-5xl font-extrabold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${
            darkMode
              ? "from-purple-400 via-purple-500 to-purple-600"
              : "from-purple-600 via-purple-500 to-purple-700"
          }`}
        >
          Contact Us
        </h2>
        <p className="text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Have questions, feedback, or collaboration ideas? We'd love to hear from you. 
          Fill out the form below and our team will get back to you as soon as possible.
        </p>
      </section>

      {/* Contact Form */}
      <section
        className={`w-full max-w-xl p-8 rounded-2xl shadow-xl backdrop-blur-md border transition-colors duration-300 ${
          darkMode
            ? "bg-black-900/90 border-zinc-700"
            : "bg-white border-zinc-400"
        }`}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-2 uppercase tracking-wide">
              Name
            </label>
            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`w-full p-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                darkMode
                  ? "bg-zinc-800 text-purple-900 placeholder-zinc-400 border border-zinc-700 focus:ring-purple-500"
                  : "bg-zinc-300/20 text-purple-900 placeholder-zinc-500 border border-zinc-300 focus:ring-purple-400"
              }`}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full p-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 ${
                darkMode
                  ? "bg-zinc-800 text-white placeholder-zinc-400 border border-zinc-700 focus:ring-purple-500"
                  : "bg-zinc-300/20 text-purple-900 placeholder-zinc-500 border border-zinc-300 focus:ring-purple-400"
              }`}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold mb-2 uppercase tracking-wide">
              Message
            </label>
            <textarea
              rows="5"
              placeholder="Write your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className={`w-full p-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 resize-none ${
                darkMode
                  ? "bg-zinc-800 text-purple-400 placeholder-zinc-400 border border-zinc-700 focus:ring-purple-500"
                  : "bg-zinc-300/20 text-purple-900 placeholder-zinc-500 border border-zinc-300 focus:ring-purple-400"
              }`}
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 bg-purple-600 text-white hover:bg-purple-500"
          >
            Send Message
          </button>

          {/* Status Messages */}
          {success && (
            <p className="text-center text-green-500 mt-3">
              ✅ Message sent successfully!
            </p>
          )}
          {error && (
            <p className="text-center text-red-500 mt-3">❌ {error}</p>
          )}

          <p className="text-xs text-center mt-4 text-zinc-400">
            Protected by Google reCAPTCHA —{" "}
            <a
              href="https://policies.google.com/privacy"
              className="underline hover:text-purple-500"
            >
              Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="https://policies.google.com/terms"
              className="underline hover:text-purple-500"
            >
              Terms of Service
            </a>
            .
          </p>
        </form>
      </section>
    </main>
  );
};

export default Contact;
