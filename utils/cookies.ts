
import { NextApiRequest, NextApiResponse } from 'next';
import { setCookie } from "cookies-next";

// MAIN

export const defaultCookieOptions: any = {
    httpOnly: true,
    maxAge: (60 * 60 * 24 * 30), // 30 days
    path: "/",
    // if is NextResponse as the res, we will call cookie() which will have the 'strict',
    // NextApiResponse will have setHeader('Set-Cookie', '...') which will have 'Strict
    sameSite: 'lax',
    secure: process.env.NODE_ENV === "production",

}


export const tokenName = 'token'
// AUTH
export function setTokenToCookies(token: string, { req, res }: { req: NextApiRequest, res: NextApiResponse }) {
    setCookie(tokenName, token, { req, res, ...defaultCookieOptions, });
}


// DEVICE ID
// export function setDeviceIdToCookies(res: NextApiResponse): string {
//   const id = v4()
//   setCookie(res, "deviceId", id);
//   return id
// }
//
// export function clearDeviceIdToCookies(res: NextApiResponse): void {
//   clearCookie(res, "deviceId");
// }
//
// export function getDeviceIdFromCookieAndSetIfNone(req: NextApiRequest, res: NextApiResponse) {
//   const cookie = parse(req.cookies['deviceId']!);
//   if (cookie == undefined) {
//     return setDeviceIdToCookies(res)
//   } else return cookie
// }
