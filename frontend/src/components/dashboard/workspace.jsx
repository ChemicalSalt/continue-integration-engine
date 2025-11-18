import { useState, useEffect } from "react";

export default function workspace({ repo, darkmode }) {
  const [builds, setbuilds] = useState([]);
  const [newbuild, setnewbuild] = useState("");

  useEffect(() => {
    // simulate fetching builds for the selected repo
    if (repo) setbuilds(repo.builds || []);
  }, [repo]);

  const startbuild = () => {
    if (!newbuild.trim()) return;
    const build = { id: Date.now(), status: "running", time: "just now", log: "build started..." };
    setbuilds([build, ...builds]);
    repo.builds = [build, ...builds];
    setnewbuild("");
    // simulate build completion
    setTimeout(() => {
      build.status = "success";
      build.log += "\nbuild completed!";
      setbuilds([...builds]);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        <input
          value={newbuild}
          onChange={(e) => setnewbuild(e.target.value)}
          placeholder="start new build..."
          className={`flex-1 p-2 rounded border transition-colors duration-300 ${darkmode ? "bg-zinc-800 text-white border-zinc-700 focus:ring-purple-500" : "bg-gray-50 text-gray-900 border-gray-300 focus:ring-purple-400"}`}
        />
        <button onClick={startbuild} className="bg-purple-600 text-white px-4 rounded hover:bg-purple-500 transition">build</button>
      </div>

      <h2 className="text-xl font-bold">{repo?.name} builds</h2>
      <div className="flex flex-col gap-4 overflow-auto max-h-[60vh]">
        {builds.length === 0 && <p className="text-gray-400 dark:text-gray-300">no builds yet</p>}
        {builds.map((b) => (
          <div key={b.id} className={`p-4 rounded shadow transition-colors duration-300 ${darkmode ? "bg-zinc-800 text-white border border-purple-700" : "bg-white border border-gray-300 text-gray-900"}`}>
            <div className="font-semibold">status: {b.status}</div>
            <div className="text-sm text-gray-400 dark:text-gray-300">time: {b.time}</div>
            <pre className="text-xs mt-2 whitespace-pre-wrap">{b.log}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
