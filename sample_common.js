const express = require("express");
const path = require("path");
const db = require("./db");

function createApp() {
  const app = express();
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));
  app.use(express.urlencoded({ extended: false }));
  return app;
}

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

function integer(value) {
  if (typeof value !== "string" || !/^-?\d+$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

function subjectName(value) {
  return typeof value === "string" ? value.trim() : "";
}

function start(app, label) {
  app.use((err, req, res, next) => {
    console.error(err.code || err.message);
    res.status(500).render("sample_error", {
      message: "요청 처리에 실패했습니다. MySQL 연결 설정과 subject 테이블을 확인하세요.",
    });
  });
  const port = Number(process.env.PORT || 3000);
  const server = app.listen(port, () => {
    console.log(`${label}: http://localhost:${port}`);
  });
  server.on("error", (err) => {
    console.error(err.message);
    db.end();
    process.exitCode = 1;
  });
  const shutdown = () => server.close(() => db.end());
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

module.exports = { db, createApp, asyncHandler, integer, subjectName, start };
