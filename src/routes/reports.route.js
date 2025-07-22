import { Router } from "express";
import {
  createReport,
  getReports,
  getReportsByUser,
  deleteReport,
  updateReport,
  updateReportAtendido,
} from "../controllers/reports.controller.js";
import { authRequires } from "../middleware/validateToken.js";
import fileUpload from "express-fileupload";

export const RouterReport = Router();

RouterReport.post(
  "/create",
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  }),
  authRequires,
  createReport
);
RouterReport.get("/get", getReports);
RouterReport.get("/my-reports", authRequires, getReportsByUser);
RouterReport.delete("/:id/delete", authRequires, deleteReport);
RouterReport.put(
  "/:id/update",
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./uploads",
  }),
  authRequires,
  updateReport
);
RouterReport.put("/:id/atendido", authRequires, updateReportAtendido);
