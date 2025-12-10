import app from "./app";

const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || "development";

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${ENV} mode`);
});
