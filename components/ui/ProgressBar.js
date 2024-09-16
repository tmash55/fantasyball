import React from "react";
import { motion } from "framer-motion";

const ProgressBar = ({ label, current, total, icon: Icon }) => {
  const progress = (current / total) * 100;

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          {Icon && <Icon className="w-4 h-4 mr-2 text-gray-400" />}
          <span className="text-sm font-medium text-gray-300">{label}</span>
        </div>
        <span className="text-xs text-gray-400">
          {current} / {total}
        </span>
      </div>
      <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`absolute top-0 left-0 h-full ${getProgressColor(
            progress
          )}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
