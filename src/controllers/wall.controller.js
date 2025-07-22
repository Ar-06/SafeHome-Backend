import { db } from "../db/conexion.js";

export const createWall = async (req, res) => {
  const { mensaje } = req.body;
  const userId = req.user.id;

  if (!mensaje) {
    return res.status(400).json({ message: "El mensaje es obligatorio" });
  }

  try {
    await db.execute({
      sql: `INSERT INTO muro_vecinal (id_usuario, mensaje) VALUES (?,?)`,
      args: [userId, mensaje],
    });

    res.status(201).json({ message: "Mensaje enviado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al enviar mensaje: " + error.message });
  }
};

export const getWallMessages = async (req, res) => {
  try {
    const result = await db.execute({
      sql: `SELECT muro_vecinal.id, usuarios.nombre, muro_vecinal.mensaje, muro_vecinal.fecha_envio FROM muro_vecinal 
            JOIN usuarios ON muro_vecinal.id_usuario = usuarios.id
            ORDER BY muro_vecinal.fecha_envio DESC`,
    });

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      error:
        "Error al obtener los comentarios del muro vecinal: " + error.message,
    });
  }
};
