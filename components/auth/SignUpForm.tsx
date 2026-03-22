"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function SignUpForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            try {
                // Ensure generic users are tracked seamlessly in Firestore so global Broadcast can hit them
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    role: "user",
                    createdAt: serverTimestamp()
                });
            } catch (e) {
                console.error("Failed to store global user registry:", e);
            }

            router.push("/search");
        } catch (err: any) {
            let msg = err.message || "";
            if (msg.includes("email-already-in-use")) msg = "Error: This email address is already in use.";
            else if (msg.includes("invalid-credential")) msg = "Error: Incorrect email or password.";
            else if (msg.includes("weak-password")) msg = "Error: Password must be at least 6 characters.";
            else if (msg.includes("invalid-email")) msg = "Error: Please provide a valid email address.";
            else msg = msg.replace("Firebase: Error ", "").replace(/\(auth\/[^)]+\)\.?/g, "").trim();
            setError(msg);
        }
    };

    return (
        <div className="flex justify-center items-center">
            <Card className="w-full max-w-md bg-zinc-950 border-white/10 shadow-[0_0_30px_rgba(107,216,94,0.15)]">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-white">Create an Account</CardTitle>
                    <CardDescription className="text-slate-400">
                        Join GymSaver to save gyms and access premium features.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                className="bg-zinc-900 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#6BD85E]"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                className="bg-zinc-900 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#6BD85E]"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm animate-pulse">{error}</p>}
                        <Button className="w-full bg-[#6BD85E] hover:bg-[#5bc250] text-black font-bold h-12 mt-2" type="submit">
                            Sign Up
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 border-t border-white/5 pt-4">
                    <p className="text-sm text-slate-400 text-center w-full">
                        Already have an account?{" "}
                        <Link href="/login" className="text-[#6BD85E] hover:underline font-medium">
                            Log in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
