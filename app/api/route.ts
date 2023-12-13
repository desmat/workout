import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    console.log('>> app.api.GET', request);


    return NextResponse.json({ foo: "bar" })
}
