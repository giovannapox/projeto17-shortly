import { db } from "../database/database.connection.js";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";

export async function signin(req, res) {
    const { email } = req.body;
    try {
        const token = uuid();

        const userExists = await db.query(`SELECT * FROM users WHERE email=$1;`, [email]);
        const id = userExists.rows[0].id;

        const tokenExists = await db.query(
            `SELECT token FROM sessions 
            JOIN users ON sessions."userId" = users.id
            WHERE users.id=$1;`, [id]);

        if (tokenExists.rows.length !== 0) {
            return res.status(200).send(tokenExists.rows[0]);
        } else {
            await db.query(`INSERT INTO sessions (token, "userId") VALUES ($1, $2);`, [token, id]);
        };
        return res.status(200).send({ token: token })
    } catch (err) {
        return res.status(500).send(err.message);
    };
};

export async function signup(req, res) {
    const { name, password, email, confirmPassword } = req.body;
    const hash = bcrypt.hashSync(password, 10);

    try {
        await db.query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3);`, [name, email, hash]);
        if(password !== confirmPassword) return res.sendStatus(422);
        return res.sendStatus(201);
    } catch (err) {
        return res.status(500).send(err.message);
    };
};

export async function getUser(req, res) {
    const { authorization } = req.headers;
    if (!authorization) return res.sendStatus(401);
    const token = authorization.replace("Bearer ", "");

    try {
        const tokenExists = await db.query(`SELECT * FROM sessions WHERE token=$1;`, [token]);
        if (tokenExists.rows.length === 0) return res.sendStatus(401);

        const users = await db.query(`
        SELECT users.*, SUM("visitCount") AS "visitCount" 
        FROM users 
        JOIN sessions ON users.id = sessions."userId" 
        JOIN urls ON users.id = urls."userId" 
        WHERE sessions.token = $1 
        GROUP BY users.id;`, [token]);
        const user = users.rows[0];
        const id = users.rows[0].id;

        const urls = await db.query(`SELECT urls.id, "shortUrl", "url", "visitCount" FROM urls JOIN users ON urls."userId" = users.id WHERE urls."userId" = $1;`, [id])

        const body = {
            id: id,
            name: user.name,
            visitCount: user.visitCount,
            shortenedUrls: urls.rows
        }

        return res.status(200).send(body);
    } catch (err) {
        return res.status(500).send(err.message);
    };
};

export async function getRanking(req, res) {
    try {
        
        const info = await db.query(`
        SELECT users.id, users.name, CAST(COUNT(urls.url) AS INT) AS "linksCount", CAST(COALESCE(SUM("visitCount"), 0)AS INT) AS "visitCount"  
        FROM users LEFT JOIN urls ON users.id = urls."userId"
        GROUP BY users.id ORDER BY "visitCount" DESC LIMIT 10;`);

        return res.status(200).send(info.rows);
    } catch (err) {
        return res.status(500).send(err.message);
    };
};