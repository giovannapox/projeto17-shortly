import { db } from "../database/database.connection.js";
import { nanoid } from "nanoid";

export async function postUrlShorten(req, res) {
    const { authorization } = req.headers;
    const { url } = req.body;
    if (!authorization) return res.sendStatus(401);
    const token = authorization.replace("Bearer ", "");

    try {
        const tokenExists = await db.query(`SELECT * FROM sessions WHERE token=$1;`, [token]);
        if (tokenExists.rows.length === 0) return res.sendStatus(401);

        const shortenUrl = nanoid.apply(url);
        await db.query(`INSERT INTO urls ("userId", url, "shortUrl") VALUES ($1, $2, $3);`, [tokenExists.rows[0].userId, url, shortenUrl]);

        res.status(201).send({ id: tokenExists.rows[0].userId, shortUrl: shortenUrl });

    } catch (err) {
        return res.status(500).send(err.message);
    };
};

export async function getUrlById(req, res) {
    const { id } = req.params;

    try {
        const body = await db.query(`SELECT id, "shortUrl", url FROM urls WHERE id=$1`, [id]);
        if (body.rows.length === 0) return res.sendStatus(404);

        return res.status(200).send(body.rows[0]);
    } catch (err) {
        return res.status(500).send(err.message);
    };
};

export async function redirectUrls(req, res) {
    const { shortUrl } = req.params;

    try {
        const shortUrlExists = await db.query(`SELECT * FROM urls WHERE "shortUrl"=$1;`, [shortUrl]);
        if (shortUrlExists.rows.length === 0) return res.sendStatus(404);
        const id = shortUrlExists.rows[0].id;
        const url = shortUrlExists.rows[0].url;

        await db.query(`UPDATE urls SET "visitCount" = "visitCount" + 1 WHERE id=$1;`, [id]);

        res.redirect(200, url);
    } catch (err) {
        return res.status(500).send(err.message);
    };
};

export async function deleteUrl(req, res) {
    const { id } = req.params;
    const { authorization } = req.headers;
    if (!authorization) return res.sendStatus(401);
    const token = authorization.replace("Bearer ", "");

    try {
        const urlExists = await db.query(`SELECT * FROM urls WHERE id=$1;`, [id]);
        if (urlExists.rows.length === 0) return res.sendStatus(404);

        const tokenExists = await db.query(`SELECT * FROM sessions WHERE token=$1;`, [token]);
        if (tokenExists.rows.length === 0) return res.sendStatus(401);
        
        if(urlExists.rows[0].userId !== tokenExists.rows[0].userId) return res.sendStatus(401);
        await db.query(`DELETE FROM urls WHERE id=$1;`, [id]);
        return res.sendStatus(204);
    } catch (err) {
        return res.status(500).send(err.message);
    };
};