"use client";
import React, { useState, useEffect } from "react";

const AdpToolWithPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");

    if (!hasVisited) {
      setShowPopup(true);
      setFirstVisit(true);
      localStorage.setItem("hasVisited", "true");
    }
  }, []);

  return (
    <>
      {showPopup && firstVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white max-w-md relative z-50">
            <p>
              Welcome to the ADP Tool! This tool compares player rankings and
              ADP across different platforms, giving you an edge in your fantasy
              drafts. Use the insights to see where players are valued more in
              high-stakes leagues versus casual ones.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-orange-500 rounded-md hover:bg-orange-600"
              onClick={() => setShowPopup(false)}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {!firstVisit && (
        <p className="mt-4 text-center text-gray-300 max-w-2xl mx-auto">
          The ADP Tool compares ADP data across different platforms, helping you
          understand how players are valued in high-stakes leagues versus casual
          ones. Use this insight to strategize your fantasy drafts!
        </p>
      )}
    </>
  );
};

export default AdpToolWithPopup;
