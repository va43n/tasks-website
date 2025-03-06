import {NextRequest, NextResponse} from "next/server";
import {verifyJWT} from "../../../lib/jwt";

export async function GET(req: NextRequest) {
	const token = req.cookies.get("token")?.value;
	if (!token) {
		return NextResponse.json({ user: null });
	}

	const user = verifyJWT(token);
	if (!user) {
		return NextResponse.json({ user: null });
	}

	return NextResponse.json({ user });
}