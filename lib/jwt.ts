import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "10";

export function createJWT(payload: object) {
	return jwt.sign(payload, SECRET_KEY, {expiresIn: "7d"});
}

export function verifyJWT(token: string) {
	try {
		return jwt.verify(token, SECRET_KEY);
	} catch (err) {
		return null;
	}
}