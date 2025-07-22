import { Router } from "express";
import { getContacts } from "../controllers/contacts.controller.js";
import { authRequires } from "../middleware/validateToken.js";

export const RouterContacts = Router();

RouterContacts.get("/", authRequires, getContacts);
