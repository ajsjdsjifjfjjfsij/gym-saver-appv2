import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Upstash is configured
const isUpstashConfigured =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Initialize Redis only if configured (Edge compatible client)
const redis = isUpstashConfigured
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    : null;

// Create a new ratelimiter that allows 20 requests per 10 seconds
const ratelimit = redis
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(20, "10 s"),
        analytics: true,
        /**
         * Optional prefix for the keys used in redis. This is useful if you want
         * to share a redis instance with other applications and want to avoid key collisions.
         */
        prefix: "@upstash/ratelimit",
    })
    : null;

export default async function proxy(request: NextRequest) {
    // If Upstash isn't configured, bypass rate limiting (e.g. local dev without env vars)
    if (!isUpstashConfigured || !ratelimit) {
        if (request.nextUrl.pathname.startsWith("/api/")) {
            console.warn("Upstash Redis is not configured. Rate limiting is disabled.");
        }
        return NextResponse.next();
    }

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

    // Rate limit /api/ routes
    if (request.nextUrl.pathname.startsWith("/api/")) {
        const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);

        if (!success) {
            console.warn(`Upstash Edge Rate limiting: Blocked IP ${ip}`);
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": limit.toString(),
                        "X-RateLimit-Remaining": remaining.toString(),
                        "X-RateLimit-Reset": reset.toString()
                    }
                }
            );
        }

        const response = NextResponse.next();
        response.headers.set("X-RateLimit-Limit", limit.toString());
        response.headers.set("X-RateLimit-Remaining", remaining.toString());
        response.headers.set("X-RateLimit-Reset", reset.toString());
        return response;
    }

    return NextResponse.next();
}

// Ensure the middleware is only called for API routes
export const config = {
    matcher: '/api/:path*',
};
