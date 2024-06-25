// utils/helpers.js

import axios from "axios";

export const transformPosition = (position) => {
  if (position === "SUPER_FLEX") return "SFLX";
  return position;
};

export const fetchUsername = async (userId) => {
  try {
    const response = await axios.get(
      `https://api.sleeper.app/v1/user/${userId}`
    );
    return response.data.username;
  } catch (error) {
    console.error("Error fetching username:", error);
    return "Unknown User";
  }
};
