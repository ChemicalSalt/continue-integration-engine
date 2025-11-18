import { useNavigate } from "react-router-dom";

export default function Home({ darkMode }) {
  const navigate = useNavigate();

  const features = [
    {
      title: "GitHub Integration",
      desc: "Sign in with GitHub, select your repositories, and let CI Engine automatically configure webhooks.",
    },
    {
      title: "Automated Builds",
      desc: "On every push, CI Engine runs builds, captures logs, and tracks success/failure automatically.",
    },
    {
      title: "Centralized Dashboard",
      desc: "View detailed logs, commit messages, branch info, and build statuses in one dashboard.",
    },
    {
      title: "Multi-Repo Support",
      desc: "Add multiple repositories per user dynamically. CI Engine handles each repo independently.",
    },
    {
      title: "Real-time Logs",
      desc: "Access stdout and stderr logs in real-time through the dashboard.",
    },
    {
      title: "Notifications & Metrics",
      desc: "Receive alerts for failed builds and monitor repository trends.",
    },
  ];

  return (
    <section
      className={`min-h-screen flex flex-col justify-start items-center px-6 py-12 transition-colors duration-500 ${
        darkMode ? "bg-black text-zinc-200" : "bg-white text-zinc-900"
      }`}
    >
      {/* Hero Section */}
      <div className="max-w-5xl w-full text-center space-y-6 sm:space-y-8">
        <h1
          className={`text-4xl sm:text-6xl font-extrabold leading-tight sm:leading-tight tracking-tight sm:tracking-wide bg-clip-text text-transparent bg-gradient-to-r ${
            darkMode
              ? "from-purple-400 via-purple-500 to-purple-600"
              : "from-purple-600 via-purple-500 to-purple-700"
          }`}
        >
          Continue Integration Engine
        </h1>
        <p className="text-md sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed sm:leading-loose">
          CI Engine is a fully automated Continuous Integration platform for your GitHub repositories. 
          Monitor your code, trigger builds on every push, capture detailed logs, and track statuses in a 
          unified, user-friendly dashboard.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigate("/login")}
          className={`inline-block mt-6 sm:mt-8 px-8 sm:px-12 py-4 sm:py-5 rounded-full font-semibold text-lg sm:text-xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
            darkMode
              ? "bg-purple-600 hover:bg-purple-500 text-zinc-100"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        >
          Get Started
        </button>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl w-full mt-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
        {features.map((feature) => (
          <div
            key={feature.title}
            className={`p-6 sm:p-8 border rounded-xl shadow-md transition-all duration-300 hover:scale-105 hover:shadow-xl ${
              darkMode ? "border-zinc-700 bg-zinc-900" : "border-zinc-200 bg-white"
            }`}
          >
            <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-purple-500">
              {feature.title}
            </h3>
            <p className="text-sm sm:text-md leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
