// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// const isPublicRoute = createRouteMatcher([
//   '/sign-in(.*)',
//   '/sign-up(.*)'
// ])

// export default clerkMiddleware(async (auth, req) => {
//   if (!isPublicRoute(req)) {
//     await auth.protect()
//   }
// })

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     // Always run for API routes
//     '/(api|trpc)(.*)',
//   ],
// }



// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])
// const isAdminRoute = createRouteMatcher(['/admin(.*)'])

// export default clerkMiddleware(async (auth, req) => {
//   // Restrict admin route to users with specific Role
//   if (isAdminRoute(req)) await auth.protect({ role: 'org:admin' })

//   // Restrict dashboard routes to signed in users
//   if (isDashboardRoute(req)) await auth.protect()
// })

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     // Always run for API routes
//     '/(api|trpc)(.*)',
//   ],
// }


// import { clerkMiddleware, clerkClient } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up", "/api/webhook/register"];

// const isPublicRoute = (req: NextRequest) =>
//   PUBLIC_ROUTES.includes(req.nextUrl.pathname);

// export default clerkMiddleware(async (auth, req) => {
//   const { userId } = await auth();

//   // 🔒 Unauthenticated user accessing protected route
//   if (!userId && !isPublicRoute(req)) {
//     return NextResponse.redirect(new URL("/sign-in", req.url));
//   }

//   // 👤 Authenticated user logic
//   if (userId) {
//     try {
//       const client = await clerkClient();
//       const user = await client.users.getUser(userId);
//       const role = user.publicMetadata.role as string | undefined;

//       // Admin trying to access user dashboard
//       if (role === "admin" && req.nextUrl.pathname === "/dashboard") {
//         return NextResponse.redirect(new URL("/admin/dashboard", req.url));
//       }

//       // Non-admin trying to access admin routes
//       if (role !== "admin" && req.nextUrl.pathname.startsWith("/admin")) {
//         return NextResponse.redirect(new URL("/dashboard", req.url));
//       }

//       // Logged-in user accessing public routes
//       if (isPublicRoute(req)) {
//         return NextResponse.redirect(
//           new URL(
//             role === "admin" ? "/admin/dashboard" : "/dashboard",
//             req.url
//           )
//         );
//       }
//     } catch (error) {
//       console.error("Middleware error:", error);
//       return NextResponse.redirect(new URL("/error", req.url));
//     }
//   }
// });


// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     // Always run for API routes
//     '/(api|trpc)(.*)',
//   ],
// }


















// // proxy.ts
// import { clerkMiddleware, clerkClient } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// // Public routes that do not require authentication
// const PUBLIC_ROUTES = ["/", "/api/webhook/register", "/sign-in", "/sign-up"];

// const isPublicRoute = (req: NextRequest) =>
//   PUBLIC_ROUTES.includes(req.nextUrl.pathname);

// export default clerkMiddleware(async (auth, req: NextRequest) => {
//   const { userId } = await auth();

//   // 🔒 Block unauthenticated users for protected routes
//   if (!userId && !isPublicRoute(req) && !req.nextUrl.pathname.startsWith("/api")) {
//     return NextResponse.redirect(new URL("/sign-in", req.url));
//   }

//   // 👤 Authenticated user logic
//   if (userId) {
//     try {
//       const client = await clerkClient();
// const user = await client.users.getUser(userId);
//       const role = user.publicMetadata.role as string | undefined;

//       // Admin trying to access user dashboard
//       if (role === "admin" && req.nextUrl.pathname === "/dashboard") {
//         return NextResponse.redirect(new URL("/admin/dashboard", req.url));
//       }

//       // Non-admin trying to access admin routes
//       if (role !== "admin" && req.nextUrl.pathname.startsWith("/admin")) {
//         return NextResponse.redirect(new URL("/dashboard", req.url));
//       }

//       // Logged-in user accessing public routes
//       if (isPublicRoute(req)) {
//         return NextResponse.redirect(
//           new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", req.url)
//         );
//       }
//     } catch (error) {
//       console.error("Error fetching user data from Clerk:", error);
//       return NextResponse.redirect(new URL("/error", req.url));
//     }
//   }
// });

// export const config = {
//   matcher: [
//     // Match all routes except Next.js internals and files
//     "/((?!.+\\.[\\w]+$|_next).*)",
//     // Always match API routes
//     "/(api|trpc)(.*)",
//   ],
// };













import { clerkMiddleware, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_ROUTES = ["/sign-in", "/sign-up"];
const PUBLIC_ROUTES = ["/", "/api/webhook/register"];

 export default clerkMiddleware(async (auth, req: NextRequest) => {
   const { userId } = await auth();
  const pathname = req.nextUrl.pathname;

  // 🔒 Not logged in → protected route
  if (!userId && !PUBLIC_ROUTES.includes(pathname) && !AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (userId) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const role = user.publicMetadata.role as string | undefined;

      // 🚫 Logged-in users should not see sign-in/sign-up
      if (AUTH_ROUTES.includes(pathname)) {
        return NextResponse.redirect(
          new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", req.url)
        );
      }

      // 🚫 Non-admin accessing admin routes
      if (role !== "admin" && pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // 🚫 Admin accessing user dashboard
      if (role === "admin" && pathname === "/dashboard") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
    } catch (err) {
      console.error("Middleware error:", err);
      return NextResponse.redirect(new URL("/error", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};

