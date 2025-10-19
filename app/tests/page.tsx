"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function Tests() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("tests").select("*");

        if (error) {
          setError(error.message);
          console.error("Supabase error:", error);
        } else {
          setData(data || []);
          console.log("Supabase data:", data);
        }
      } catch (err) {
        setError("Failed to fetch data");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Test</h1>

      {loading && <p>Loading...</p>}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {data.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Data from 'tests' table:
          </h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <p>No data found in 'tests' table.</p>
      )}
    </div>
  );
}
