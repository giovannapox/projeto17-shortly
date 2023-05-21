import { db } from "../database/database.connection.js";
import { nanoid } from "nanoid";

export async function postUrlShorten(req, res) {
    const { authorization } = req.headers;
    const { url } = req.body;

    const token = authorization.replace("Bearer ", "");

    try {
        const tokenExists = await db.query(`SELECT * FROM sessions WHERE token=$1;`, [token]);
        if(!tokenExists) return res.sendStatus(401);

        const shortenUrl = nanoid.apply(url);
        await db.query(`INSERT INTO urls ("userId", url, "shortUrl") VALUES ($1, $2, $3);`, [tokenExists.rows[0].userId, url, shortenUrl]);

        res.status(201).send(shortenUrl);

    } catch (err) {
        return res.status(500).send(err.message);
    };
};