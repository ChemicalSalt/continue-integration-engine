import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [repos, setRepos] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingRepos, setLoadingRepos] = useState(true);

  const API = import.meta.env.VITE_API_URL;

  // 1️⃣ Fetch logged-in user
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API}/auth`, {
        withCredentials: true,
        headers: { "Cache-Control": "no-cache" }, // prevent caching
      });
      setUser(res.data.user);
    } catch (err) {
      console.log("User not logged in");
    } finally {
      setLoadingUser(false);
    }
  };

  // 2️⃣ Fetch repos
  const fetchRepos = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API}/api/repos`, {
        withCredentials: true,
      });
      setRepos(res.data);
    } catch (err) {
      console.error("Error fetching repos:", err);
    } finally {
      setLoadingRepos(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) fetchRepos();
  }, [user]);

  if (loadingUser) return <p className="p-6 text-white">Loading user...</p>;
  if (!user) return <p className="p-6 text-white">Please log in first.</p>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-4">Welcome {user.username}</h1>

      {loadingRepos ? (
        <p>Loading repos...</p>
      ) : repos.length === 0 ? (
        <p>No repos added yet.</p>
      ) : (
        <ul>
          {repos.map((repo) => (
            <li key={repo._id}>{repo.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
