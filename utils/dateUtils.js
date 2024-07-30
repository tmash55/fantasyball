export const formatDate = (timestamp) => {
  const date = new Date(parseInt(timestamp, 10));
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
};
