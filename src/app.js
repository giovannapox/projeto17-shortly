import express from "express";
import cors from "cors";
import usersRouter from "../src/routers/users.router.js";
import urlsRouter from "../src/routers/urls.router.js";

const app = express();

app.use(express.json());
app.use(cors());

app.use(usersRouter);
app.use(urlsRouter);

const port = 5000;
app.listen(port, () => {console.log(`Servidor rodando na porta ${port}`)});
