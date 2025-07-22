import { Router } from "express";
import {
  register,
  login,
  recuperarContraseña,
} from "../controllers/auth.controller.js";

export const RouterAuth = Router();

RouterAuth.post("/register", register);
RouterAuth.post("/login", login);
RouterAuth.post("/recuperar", recuperarContraseña);
