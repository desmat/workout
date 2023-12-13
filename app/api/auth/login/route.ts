import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    console.log('>> app.api.auth.login.GET', request);


    return NextResponse.json({ foo: "bar" })
}
