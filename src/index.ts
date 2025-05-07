import express from "express";
import router from "./routes/api";
import bodyParser from "body-parser";
import cors from "cors";

import db from "./utils/database";
import docs from "./docs/route";

async function init() {
  try {
    const result = await db();
    console.log("Database status: ", result);

    const app = express();
    const PORT = 3000;

    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get("/", (req, res) => {
      // res.send("Hello World");
      res.status(200).json({ message: "Server in running!", data: null });
    });

    app.get("/dummy", (req, res) => {
      // res.send("Hello World");
      res.status(200).json({ message: "Hello World!!!", data: null });
    });

    app.use("/api", router);

    docs(app);

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
}

init();
