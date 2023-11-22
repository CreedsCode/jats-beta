import { withAuth, type NextRequestWithAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export const config = { matcher: ["/dashboard/(.*)", "/portal"] }

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    if (request.nextUrl.pathname.search("/dashboards/(.*)")
      && request.nextauth.token?.role != "Admin") {
      return NextResponse.rewrite(
        new URL("/denied")
      )
    }

    if (request.nextUrl.pathname.startsWith("/portal")
      && request.nextauth.token?.role !== "admin"
      && request.nextauth.token?.role !== "customer") {
      return NextResponse.rewrite(
        new URL("/denied", request.url)
      )
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)
