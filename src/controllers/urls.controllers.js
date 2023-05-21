import { db } from "../database/database.connection.js";
import { nanoid } from "nanoid";

export async function postUrlShorten(req, res) {
    const { authorization } = req.headers;
    const { url } = req.body;

    const token = authorization.replace("Bearer ", "");

    try {
        const tokenExists = await db.query(`SELECT * FROM sessions WHERE token=$1;`, [token]);
        if (!tokenExists) return res.sendStatus(401);

        const shortenUrl = nanoid.apply(url);
        await db.query(`INSERT INTO urls ("userId", "shortUrl") VALUES ($1, $2);`, [tokenExists.rows[0].userId, shortenUrl]);

        res.status(201).send(shortenUrl);

    } catch (err) {
        return res.status(500).send(err.message);
    };
};

export async function getUrlById(req, res) {
    const { id } = req.params;

    try {   
        const body = await db.query(`SELECT id, "shortUrl", url FROM urls WHERE id=$1`, [id]);
        if(body.rows.length === 0) return res.sendStatus(404);

        return res.status(200).send(body.rows[0]);
    } catch (err) {
        return res.status(500).send(err.message);
    };
};