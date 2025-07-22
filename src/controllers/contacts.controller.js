import { db } from "../db/conexion.js";

export const getContacts = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `SELECT * FROM contactos_emergencia`,
    });

    res.json(result.rows);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al obtener los contactos de emergencia: " + error.message,
      });
  }
};
