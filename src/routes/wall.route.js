import { Router } from "express";
import { createWall, getWallMessages } from "../controllers/wall.controller.js";
import { authRequires } from "../middleware/validateToken.js";

export const RouterWall = Router();

RouterWall.post("/create", authRequires, createWall);
RouterWall.get("/", authRequires, getWallMessages);
