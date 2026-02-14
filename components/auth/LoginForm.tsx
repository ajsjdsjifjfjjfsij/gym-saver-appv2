"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [resetSent, setResetSent] = useState(false);
    const router = useRouter();
    const { sendResetEmail } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setResetSent(false);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/search");
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleResetPassword = async () => {
        if (!email) {
            setError("Please enter your email first to reset password.");
            return;
        }
        setError("");
        setResetSent(false);
        try {
            await sendResetEmail(email);
            setResetSent(true);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[60vh] px-4">
            <Card className="w-full max-w-md bg-zinc-950 border-white/10 shadow-[0_0_30px_rgba(107,216,94,0.15)] overflow-hidden">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-white">Login</CardTitle>
                    <CardDescription className="text-slate-400">
                        Enter your email below to login to your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                className="bg-zinc-900 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#6BD85E] h-11"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" title="password label" className="text-white font-medium">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                className="bg-zinc-900 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#6BD85E] h-11"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm animate-pulse">{error}</p>}
                        {resetSent && <p className="text-[#6BD85E] text-sm font-medium animate-pulse">Reset email sent! Check your inbox.</p>}

                        <Button className="w-full bg-[#6BD85E] hover:bg-[#5bc250] text-black font-bold h-12 mt-2 transition-all duration-300" type="submit">
                            Log in
                        </Button>

                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                onClick={handleResetPassword}
                                className="text-sm text-slate-400 hover:text-[#6BD85E] underline underline-offset-4 transition-colors"
                            >
                                Forgot password?
                            </button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 border-t border-white/5 pt-4">
                    <p className="text-sm text-slate-400 text-center w-full">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-[#6BD85E] hover:underline font-medium">
                            Sign up
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
