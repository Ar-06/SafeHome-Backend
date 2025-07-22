import express from "express";
import morgan from "morgan";
import { RouterAuth } from "./routes/auth.route.js";
import { RouterReport } from "./routes/reports.route.js";
import { RouterWall } from "./routes/wall.route.js";
import { RouterContacts } from "./routes/contacts.route.js";

export const app = express();

app.disable("x-powered-by");
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", RouterAuth);
app.use("/reports", RouterReport);
app.use("/wall", RouterWall);
app.use("/contacts", RouterContacts);

app.get("/", (req, res) => {
  res.send("Servidor safehome, corriendo");
});
