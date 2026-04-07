import { canAccessAdminPath } from "@/lib/admin-access";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const isLoggedIn = !!req.auth;

  // Admin routes: admin full access, employee partial access
  if (path.startsWith("/admin")) {
    if (!isLoggedIn) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", path);
      return Response.redirect(login);
    }
    if (!canAccessAdminPath(req.auth?.user?.role, path)) {
      return Response.redirect(new URL("/unauthorized", req.url));
    }
    return;
  }

  // Employee routes: admin or employee
  if (path.startsWith("/employee")) {
    if (!isLoggedIn) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", path);
      return Response.redirect(login);
    }
    const r = req.auth?.user?.role;
    if (r !== "admin" && r !== "employee") {
      return Response.redirect(new URL("/unauthorized", req.url));
    }

    const adminPath = path === "/employee"
      ? "/admin"
      : path.replace(/^\/employee/, "/admin");
    const nextUrl = new URL(adminPath, req.url);
    nextUrl.search = req.nextUrl.search;
    return Response.redirect(nextUrl);
  }

  // Customer account routes: must be logged in as customer
  if (path.startsWith("/account")) {
    if (!isLoggedIn) {
      const login = new URL("/login", req.url);
      login.searchParams.set("callbackUrl", path);
      return Response.redirect(login);
    }
    if (req.auth?.user?.role !== "customer") {
      return Response.redirect(new URL("/", req.url));
    }
    return;
  }

  return;
});

export const config = {
  matcher: ["/admin/:path*", "/employee/:path*", "/account/:path*"],
};
