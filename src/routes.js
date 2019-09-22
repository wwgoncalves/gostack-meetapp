import { Router } from "express";
import multer from "multer";

import UserController from "./app/controllers/UserController";
import SessionController from "./app/controllers/SessionController";
import FileController from "./app/controllers/FileController";
import MeetupController from "./app/controllers/MeetupController";
import ArrangementController from "./app/controllers/ArrangementController";

import authMiddleware from "./app/middlewares/auth";
import multerConfig from "./config/multer";

const routes = new Router();
const upload = multer(multerConfig);

routes.post("/users", UserController.store);
routes.post("/sessions", SessionController.store);

routes.use(authMiddleware);

routes.put("/users", UserController.update);

routes.post("/meetups", MeetupController.store);
routes.get("/meetups", MeetupController.index);
routes.put("/meetups/:id", MeetupController.update);
routes.delete("/meetups/:id", MeetupController.delete);

routes.get("/arrangements", ArrangementController.index);

// routes.post("/subscriptions", SubscriptionController.store);
// routes.get("/subscriptions", SubscriptionController.index);

routes.post("/files", upload.single("file"), FileController.store);

export default routes;
