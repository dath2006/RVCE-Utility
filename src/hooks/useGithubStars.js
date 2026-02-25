import { useState, useEffect } from 'react';

const CACHE_KEY = 'github_stars_dath2006_rvce_utility';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useGithubStars = () => {
  const [stars, setStars] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStars = async () => {
      try {
        const cachedStr = localStorage.getItem(CACHE_KEY);
        if (cachedStr) {
          const cached = JSON.parse(cachedStr);
          if (Date.now() - cached.timestamp < CACHE_DURATION) {
            setStars(cached.stars);
            setLoading(false);
            return;
          }
        }

        const res = await fetch('https://api.github.com/repos/dath2006/RVCE-Utility');
        if (!res.ok) {
          throw new Error('Failed to fetch GitHub stars');
        }
        const data = await res.json();
        const starsCount = data.stargazers_count;
        
        setStars(starsCount);
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ stars: starsCount, timestamp: Date.now() })
        );
      } catch (err) {
        console.error('Error fetching GitHub stars:', err);
        setError(err);
        // Fallback to cache if possible, even if expired
        const cachedStr = localStorage.getItem(CACHE_KEY);
        if (cachedStr) {
          setStars(JSON.parse(cachedStr).stars);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStars();
    
    // Optional: Setup polling every 5 minutes
    const interval = setInterval(fetchStars, CACHE_DURATION);
    return () => clearInterval(interval);
  }, []);

  return { stars, loading, error };
};
