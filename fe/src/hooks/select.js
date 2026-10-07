import { useEffect, useState } from "react";

export function useSelectData(endpoint) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!endpoint) return; // nothing to fetch yet

        const controller = new AbortController();
        setLoading(true);
        setError(null);

        fetch(endpoint, { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error(`Request failed: ${res.status}`);
                return res.json();
            })
            .then(setData)
            .catch((err) => {
                if (err.name !== "AbortError") setError(err);
            })
            .finally(() => setLoading(false));

        return () => controller.abort(); // cleanup
    }, [endpoint]);

    return { data, loading, error };
  }