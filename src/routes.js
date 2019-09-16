import { Router } from "express";

import UserController from "./app/controllers/UserController";
import SessionController from "./app/controllers/SessionController";

import authMiddleware from "./app/middlewares/auth";

const routes = new Router();

routes.post("/users", UserController.store);
routes.post("/sessions", SessionController.store);

routes.use(authMiddleware);

routes.put("/users", UserController.update);

// routes.post("/meetups", MeetupController.store);
// routes.get("/meetups", MeetupController.index);
// routes.put("/meetups/:id", MeetupController.update);
// routes.delete("/meetups/:id", MeetupController.delete);

// routes.get("/arrangements", ArrangementController.index);

// routes.post("/subscriptions", SubscriptionController.store);
// routes.get("/subscriptions", SubscriptionController.index);

// routes.post("/files", --multer--, FileController.store);

export default routes;
