import "dotenv/config";

import express from "express";
import "express-async-errors";
import { resolve } from "path";
import Youch from "youch";

import routes from "./routes";

import "./database";

class App {
  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(express.json());
    this.server.use(
      "/files",
      express.static(resolve(__dirname, "..", "tmp", "uploads"))
    );
  }

  routes() {
    this.server.use(routes);
  }

  exceptionHandler() {
    this.server.use(async (error, request, response, next) => {
      if (process.env.NODE_ENV === "development") {
        try {
          const errors = await new Youch(error, request).toJSON();

          return response.status(500).json({ errors });
        } catch (err) {
          return response.status(500).json({ error: err.message });
        }
      }

      return response.status(500).json({ error: "Internal server error." });
    });
  }
}

export default new App().server;
