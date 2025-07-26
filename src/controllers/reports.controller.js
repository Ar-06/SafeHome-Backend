import { db } from "../db/conexion.js";
import { uploadImage, deleteImage } from "../libs/cloudinary.js";
import fs from "fs-extra";

export const createReport = async (req, res) => {
  const { tipo, lugar, hora, descripcion } = req.body;
  const userId = req.user.id;

  if (!tipo || !lugar || !hora || !descripcion) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios" });
  }

  let foto_url = null;

  try {
    if (req.files?.image) {
      const result = await uploadImage(req.files.image.tempFilePath);
      foto_url = result.secure_url;

      await fs.unlink(req.files.image.tempFilePath);
    }

    await db.execute({
      sql: `INSERT INTO reportes (id_usuario, tipo, lugar, hora, descripcion, foto_url, atendido) VALUES (?,?,?,?,?,?,?)`,
      args: [userId, tipo, lugar, hora, descripcion, foto_url, 0],
    });

    res.status(201).json({ message: "Reporte registrado con exito" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al registrar el reporte: " + error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await db.execute({
      sql: `SELECT r.id, r.tipo, r.lugar, r.hora, r.descripcion, r.foto_url, r.atendido, r.fecha_creacion, u.nombre AS nombre_usuario FROM reportes r
            JOIN usuarios u ON r.id_usuario = u.id
            ORDER BY r.fecha_creacion DESC`,
    });

    res.json(reports.rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener reportes: " + error.message });
  }
};

export const getReportsByUser = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.execute({
      sql: `SELECT * FROM reportes WHERE id_usuario = ? ORDER BY fecha_creacion DESC`,
      args: [userId],
    });

    res.json(result.rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener tus reportes: " + error.message });
  }
};

export const deleteReport = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await db.execute({
      sql: `SELECT * FROM reportes WHERE id = ?`,
      args: [id],
    });

    const reporte = result.rows[0];

    if (!reporte) {
      return res.status(404).json({ message: "Reporte no encontrado" });
    }

    if (reporte.id_usuario !== userId) {
      return res
        .status(403)
        .json({ message: "No autorizado para eliminar este reporte" });
    }

    if (reporte.foto_url) {
      const segments = reporte.foto_url.split("/");
      const nombreArchivo = segments[segments.length - 1];
      const publicId = `Reports/${nombreArchivo.split(".")[0]}`;
      await deleteImage(publicId);
    }

    await db.execute({
      sql: `DELETE FROM reportes WHERE id = ?`,
      args: [id],
    });

    res.json({ message: "Reporte eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar el reporte: " + error.message });
  }
};

export const updateReport = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const { tipo, lugar, hora, descripcion } = req.body;

  try {
    const result = await db.execute({
      sql: `SELECT * FROM reportes WHERE id = ?`,
      args: [id],
    });

    const reporte = result.rows[0];

    if (!reporte) {
      return res.status(404).json({ message: "Reporte no encontrado" });
    }

    if (reporte.id_usuario !== userId) {
      return res
        .status(403)
        .json({ message: "No autorizado para editar este reporte" });
    }

    let nuevaFotoUrl = reporte.foto_url;

    if (req.files?.image) {
      const segments = reporte.foto_url.split("/");
      const nombreArchivo = segments[segments.length - 1];
      const publicId = `Reports/${nombreArchivo.split(".")[0]}`;
      await deleteImage(publicId);

      const resultUpload = await uploadImage(req.files.image.tempFilePath);
      nuevaFotoUrl = resultUpload.secure_url;
      await fs.unlink(req.files.image.tempFilePath);
    }

    await db.execute({
      sql: `UPDATE reportes SET tipo = ?, lugar = ?, hora = ?, descripcion = ?, foto_url = ? WHERE id = ?`,
      args: [
        tipo || reporte.tipo,
        lugar || reporte.lugar,
        hora || reporte.hora,
        descripcion || reporte.descripcion,
        nuevaFotoUrl,
        id,
      ],
    });

    res.json({ message: "Reporte actualizado con éxito" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al actualizar el reporte: " + error.message });
  }
};

export const updateReportAtendido = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await db.execute({
      sql: `SELECT * FROM reportes WHERE id = ?`,
      args: [id],
    });

    const reporte = result.rows[0];

    if (!reporte) {
      return res.status(404).json({ message: "Reporte no encontrado" });
    }

    if (reporte.id_usuario !== userId) {
      return res
        .status(403)
        .json({ message: "No autorizado para modificar el reporte" });
    }

    await db.execute({
      sql: `UPDATE reportes SET atendido = 1 WHERE id = ?`,
      args: [id],
    });

    res.json({ message: "Reporte marcado como atendido" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al actualizar el reporte: " + error.message });
  }
};
