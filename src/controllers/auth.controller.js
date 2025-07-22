import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import { db } from "../db/conexion.js";
import dotenv from "dotenv";

dotenv.config();

export const register = async (req, res) => {
  const { nombre, email, contraseña, pregunta_seguridad, respuesta_seguridad } =
    req.body;

  if (
    !nombre ||
    !email ||
    !contraseña ||
    !pregunta_seguridad ||
    !respuesta_seguridad
  ) {
    return res
      .status(400)
      .json({ message: "Email y contraseña son obligatorios" });
  }

  try {
    const result = await db.execute({
      sql: "SELECT * FROM usuarios WHERE email = ?",
      args: [email],
    });

    if (result.rows.length > 0) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    const hashPassword = await bcrypt.hash(contraseña, 10);
    const hashRespuesta = await bcrypt.hash(respuesta_seguridad, 10);

    await db.execute({
      sql: "INSERT INTO usuarios (nombre, email, contraseña, pregunta_seguridad, respuesta_seguridad) VALUES (?,?,?,?,?)",
      args: [nombre, email, hashPassword, pregunta_seguridad, hashRespuesta],
    });

    res.status(201).json({ message: "Usuario registrado con exito" });
  } catch (error) {
    res.status(500).json({ error: "Error al registrar: " + error.message });
  }
};

export const login = async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    const result = await db.execute({
      sql: "SELECT * FROM usuarios WHERE email = ?",
      args: [email],
    });

    const user = result.rows[0];
    if (!user) {
      return res.status(400).json({ message: "Usuario no existe, registrese" });
    }

    const matchPassword = await bcrypt.compare(contraseña, user.contraseña);
    if (!matchPassword) {
      return res.status(400).json({ message: "Contraseña inválida" });
    }

    const token = await createAccessToken({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
    });

    res.json({ token });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al iniciar sesión: " + error.message });
  }
};

export const recuperarContraseña = async (req, res) => {
  const { email, respuesta_seguridad, nueva_contraseña } = req.body;

  try {
    const result = await db.execute({
      sql: `SELECT * FROM users WHERE email = ?`,
      args: [email],
    });

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const matchRespuesta = await bcrypt.compare(
      respuesta_seguridad,
      user.respuesta_seguridad
    );
    if (!matchRespuesta) {
      return res
        .status(400)
        .json({ message: "Respuesta de seguridad incorrecta" });
    }

    const nuevaHash = await bcrypt.hash(nueva_contraseña, 10);

    await db.execute({
      sql: `UPDATE users SET password = ? WHERE email = ?`,
      args: [nuevaHash, email],
    });

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al recuperar: " + error.message });
  }
};
