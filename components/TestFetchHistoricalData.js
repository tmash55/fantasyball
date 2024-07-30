import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const TestFetchHistoricalData = () => {
  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      const { data, error } = await supabase
        .from("Dynasty-historical-data")
        .select("first_name, last_name, value, date")
        .order("date", { ascending: false })
        .limit(50); // Limit to 10 for testing

      if (error) {
        console.error("Error fetching historical data:", error);
      } else {
        console.log("Fetched historical data:", data); // Debug: log the fetched historical data
        setHistoricalData(data);
      }
    };

    fetchHistoricalData();
  }, []);

  return (
    <div>
      <h1>Test Fetch Historical Data</h1>
      {historicalData.length > 0 ? (
        <ul>
          {historicalData.map((record, index) => (
            <li key={index}>
              {record.first_name} {record.last_name} - Value: {record.value} -
              Date: {record.date}
            </li>
          ))}
        </ul>
      ) : (
        <p>No data found</p>
      )}
    </div>
  );
};

export default TestFetchHistoricalData;
