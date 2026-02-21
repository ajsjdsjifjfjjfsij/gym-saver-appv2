"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/components/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function SubmissionForm() {
    const { user } = useAuth();
    const [gymName, setGymName] = useState("");
    const [gymLocation, setGymLocation] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            let imageUrl = "";

            if (image) {
                const uid = user ? user.uid : "guest";
                const storageRef = ref(storage, `submission-images/${uid}/${Date.now()}_${image.name}`);
                await uploadBytes(storageRef, image);
                imageUrl = await getDownloadURL(storageRef);
            }

            await addDoc(collection(db, "submissions"), {
                userId: user ? user.uid : `guest_${Date.now()}`,
                userEmail: user ? user.email : "guest@gymsaverapp.com",
                gymName,
                gymLocation,
                price: parseFloat(price) || 0,
                imageUrl,
                status: "pending", // Add status for admin workflow
                createdAt: new Date(),
            });

            setMessage("Submission successful! Thank you.");
            setGymName("");
            setGymLocation("");
            setPrice("");
            setImage(null);
        } catch (err: any) {
            console.error("Error submitting:", err);
            if (err.message?.includes("permission-denied") || err.code === "permission-denied") {
                setError("Security Error: You do not have permission to perform this action. Please ensure you are logged in correctly.");
            } else {
                setError("Failed to submit. Please try again.");
            }
        } finally {

            setLoading(false);
        }
    };

    return (
        <Card className="w-full bg-black border border-white/10 neon-glow-card shadow-[0_0_20px_rgba(107,216,94,0.3)]">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-[#6BD85E]">Submit Price Change</CardTitle>
                <CardDescription className="text-slate-400">
                    Help us keep our prices up to date.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="gymName" className="text-white">Gym Name</Label>
                        <Input
                            id="gymName"
                            placeholder="e.g. PureGym London"
                            value={gymName}
                            onChange={(e) => setGymName(e.target.value)}
                            required
                            className="bg-zinc-900 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#6BD85E]"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="gymLocation" className="text-white">Location</Label>
                        <Input
                            id="gymLocation"
                            placeholder="e.g. 123 High Street, London"
                            value={gymLocation}
                            onChange={(e) => setGymLocation(e.target.value)}
                            required
                            className="bg-zinc-900 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#6BD85E]"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="price" className="text-white">New Price (£)</Label>
                        <Input
                            id="price"
                            type="number"
                            placeholder="e.g. 35"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            min="0"
                            step="0.01"
                            className="bg-zinc-900 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#6BD85E]"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="image" className="text-white">Proof Image (Optional)</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setImage(e.target.files[0]);
                                }
                            }}
                            className="bg-zinc-900 border-white/10 text-white file:text-[#6BD85E] file:bg-zinc-800 file:border-0 file:mr-4 file:px-4 file:py-2 file:rounded-full hover:file:bg-zinc-700"
                        />
                    </div>
                    {message && <p className="text-[#6BD85E] text-sm text-center font-medium">{message}</p>}
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <Button type="submit" disabled={loading} className="w-full bg-[#6BD85E] hover:bg-[#5bc250] text-black font-bold">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Submit Price Change
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
