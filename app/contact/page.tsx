"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function ContactPage() {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Contact Form Submitted:", { name, email, message })
        setSubmitted(true)
        // Reset form or show success message logic
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative">
            <Button
                variant="ghost"
                className="absolute top-4 left-4 text-slate-400 hover:text-white hover:bg-white/10"
                onClick={() => router.push('/')}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Home
            </Button>
            <Card className="w-full max-w-md bg-black border border-white/10 neon-glow-card shadow-[0_0_20px_rgba(107,216,94,0.3)]">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold text-[#6BD85E]">Contact Us</CardTitle>
                    <CardDescription className="text-slate-400">
                        Get in touch with us for any enquiries or issues.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-white">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Your Name"
                                    required
                                    className="bg-zinc-900 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#6BD85E]"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-white">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    required
                                    className="bg-zinc-900 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#6BD85E]"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message" className="text-white">Enquiry or Issue</Label>
                                <Textarea
                                    id="message"
                                    placeholder="How can we help you?"
                                    required
                                    className="min-h-[120px] bg-zinc-900 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#6BD85E]"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full bg-[#6BD85E] hover:bg-[#5bc250] text-black font-bold">
                                Send Message
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center py-8 space-y-4">
                            <div className="text-[#6BD85E] text-4xl mb-4">✓</div>
                            <h3 className="text-xl font-bold text-white">Message Sent!</h3>
                            <p className="text-slate-400">
                                Thank you for contacting us. We aim to respond to all emails as soon as possible.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-4 border-white/10 text-white hover:bg-white/10 hover:text-white"
                                onClick={() => setSubmitted(false)}
                            >
                                Send Another
                            </Button>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center border-t border-white/5 pt-6">
                    <p className="text-xs text-slate-500 text-center">
                        We aim to respond to all emails as soon as possible.
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
