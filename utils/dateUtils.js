export const formatDate = (timestamp, format = "MM/DD/YYYY") => {
  const date = new Date(parseInt(timestamp, 10));

  if (format === "MM/DD/YYYY") {
    const month = date.getMonth() + 1; // Months are zero-based
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
};
