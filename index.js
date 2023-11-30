const express = require("express");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const crypto = require("crypto");

const pool = new Pool({
  user: "aaaaa",
  host: "localhost",
  database: "aaaaa",
  password: "aaaaaaa",
  port: 5432, 
});

const app = express();

app.use(express.json());

function verifyToken(req, res, next) {
    const bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== "undefined") {
      const bearerToken = bearerHeader.split(" ")[1];
      req.token = bearerToken;
      next();
    } else {
      res.status(401).json({ error: "Token Necesario" }); 
    }
  }
  

app.get("/api", (req, res) => {
  res.json({
    mensaje: "Hola Mundo",
  });
});

app.post("/api/login", (req, res) => {
  const user = {
    id: 1,
    nombre: "Stalin",
    email: "stalin@gmail.com",
  };
  jwt.sign({ user }, "secretKey", (err, token) => {
    res.json({
      token,
    });
  });
});

app.post("/usuarios", verifyToken, async (req, res) => {
  jwt.verify(req.token, "secretKey", async (error, authData) => {
    if (error) {
      res.sendStatus(403);
    } else {
      try {
        const datos = {
          nombre: "Stalin",
          apellido: "Rivera",
          direccion: "Guanju",
          ciudad: "Guaranda",
          email: "stalin@gmail.com",
          telefono: "0985263210",
          ocupacion: "Base de Datos",
          contraseña: "contraseña123",
        };

        const {
          nombre,
          apellido,
          direccion,
          ciudad,
          email,
          telefono,
          ocupacion,
          contraseña,
        } = datos;

        const hashedNombre = crypto
          .createHash("sha256")
          .update(nombre)
          .digest("hex");

        const hashedApellido = crypto
          .createHash("sha256")
          .update(apellido)
          .digest("hex");

        const hashedDireccion = crypto
          .createHash("sha256")
          .update(direccion)
          .digest("hex");

        const hashedCiudad = crypto
          .createHash("sha256")
          .update(ciudad)
          .digest("hex");

        const hashedEmail = crypto
          .createHash("sha256")
          .update(email)
          .digest("hex");

        const hashedTelefono = crypto
          .createHash("sha256")
          .update(telefono)
          .digest("hex");

        const hashedOcupacion = crypto
          .createHash("sha256")
          .update(ocupacion)
          .digest("hex");

        const hashedPassword = crypto
          .createHash("sha256")
          .update(contraseña)
          .digest("hex");

        const client = await pool.connect();
        const result = await client.query(
          "INSERT INTO usuarios (nombre, apellido, direccion, ciudad, email, telefono, ocupacion, contraseña) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
          [
            hashedNombre,
            hashedApellido,
            hashedDireccion,
            hashedCiudad,
            hashedEmail,
            hashedTelefono,
            hashedOcupacion,
            hashedPassword, 
          ]
        );

        const newUser = result.rows[0];
        client.release();

        res.status(201).json(newUser);
      } catch (error) {
        console.error("Error al crear un nuevo usuario", error);
        res.status(500).json({ error: "Error al crear un nuevo usuario" });
      }
    }
  });
});

app.get("/usuarios", verifyToken, async (req, res) => {
  jwt.verify(req.token, "secretKey", async (error, authData) => {
    if (error) {
      res.sendStatus(403);
    } else {
      try {
        const client = await pool.connect();
        const result = await client.query("SELECT * FROM usuarios");
        const data = result.rows;
        client.release();
        res.json({ data });
      } catch (error) {
        console.error("Error en la conexión a la base de datos", error);
        res
          .status(500)
          .json({ error: "Error en la conexión a la base de datos" });
      }
    }
  });
});

app.post("/api/posts", verifyToken, (req, res) => {
  jwt.verify(req.token, "secretKey", (error, authData) => {
    if (error) {
      res.sendStatus(403);
    } else {
      res.json({
        mensaje: "Post fue creado",
        authData,
      });
    }
  });
});
app.delete("/usuarios/:id", verifyToken, async (req, res) => {
    jwt.verify(req.token, "secretKey", async (error, authData) => {
      if (error) {
        res.sendStatus(403);
      } else {
        try {
          const userId = req.params.id;
  
          const client = await pool.connect();
          const result = await client.query("DELETE FROM usuarios WHERE id = $1 RETURNING *", [userId]);
  
          if (result.rowCount > 0) {
            const deletedUser = result.rows[0];
            res.json({ mensaje: "Usuario eliminado exitosamente", usuarioEliminado: deletedUser });
          } else {
            res.status(404).json({ error: "Usuario no encontrado" });
          }
  
          client.release();
        } catch (error) {
          console.error("Error al eliminar el usuario", error);
          res.status(500).json({ error: "Error al eliminar el usuario" });
        }
      }
    });
  });

app.listen(3000, function () {
  console.log("Server is running on port 3000");
});
