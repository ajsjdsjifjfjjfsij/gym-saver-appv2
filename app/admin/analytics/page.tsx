"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Download, Calendar, Mail, AlertCircle } from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from "recharts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const ADMIN_EMAIL = "josephbunton@live.co.uk";

// Mock Data Generator
const generateData = (days: number) => {
    const data = [];
    const today = new Date();
    for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const clicks = Math.floor(Math.random() * 50) + 10;
        const signups = Math.floor(clicks * (Math.random() * 0.4 + 0.1)); // 10-50% conversion

        data.push({
            date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
            originalDate: date,
            clicks: clicks,
            signups: signups,
            activeUsers: Math.floor(Math.random() * 100) + 50,
        });
    }
    return data;
};

export default function AnalyticsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [timeRange, setTimeRange] = useState("30");
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        // Simulate fetching data
        setData(generateData(parseInt(timeRange)));
    }, [timeRange]);

    useEffect(() => {
        if (!loading) {
            if (!user || user.email !== ADMIN_EMAIL) {
                console.warn("Unauthorized access attempt by:", user?.email);
                router.push("/");
            }
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex h-screen items-center justify-center bg-black text-white">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (user.email !== ADMIN_EMAIL) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 text-center">
                <div className="space-y-4">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
                    <h2 className="text-xl font-bold">Unauthorized Access</h2>
                    <p className="text-muted-foreground">You do not have permission to view this page.</p>
                    <Button variant="outline" className="border-white/10" onClick={() => router.push("/")}>Return Home</Button>
                </div>
            </div>
        );
    }

    if (!user.emailVerified) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 text-center">
                <Card className="max-w-md w-full bg-white/5 border-white/10 text-white">
                    <CardHeader>
                        <Mail className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                        <CardTitle>Email Verification Required</CardTitle>
                        <CardDescription>
                            Please verify your admin email to access analytics.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full bg-[#6BD85E] text-black font-bold" onClick={() => router.push("/admin")}>
                            Go to Verification Settings
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const totalClicks = data.reduce((acc, curr) => acc + curr.clicks, 0);
    const totalSignups = data.reduce((acc, curr) => acc + curr.signups, 0);
    const conversionRate = totalClicks > 0 ? ((totalSignups / totalClicks) * 100).toFixed(1) : "0";

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-20 sm:pb-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/admin")}
                            className="text-muted-foreground hover:text-white"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                            <p className="text-muted-foreground">Detailed insights and performance metrics.</p>
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">Last 7 Days</SelectItem>
                                <SelectItem value="30">Last 30 Days</SelectItem>
                                <SelectItem value="90">Last 3 Months</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                            <Download className="mr-2 h-4 w-4" /> Export
                        </Button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks (Sign Up)</CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-muted-foreground"
                            >
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalClicks}</div>
                            <p className="text-xs text-muted-foreground">+20.1% from last period</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Signups</CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-muted-foreground"
                            >
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalSignups}</div>
                            <p className="text-xs text-muted-foreground">+15% from last period</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-muted-foreground"
                            >
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{conversionRate}%</div>
                            <p className="text-xs text-muted-foreground">Click to Signup Ratio</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users (Daily)</CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-muted-foreground"
                            >
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">~{Math.floor(data.reduce((acc, curr) => acc + curr.activeUsers, 0) / data.length)}</div>
                            <p className="text-xs text-muted-foreground">Average daily active</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* User Acquisition Chart */}
                    <Card className="bg-white/5 border-white/10 text-white col-span-1 lg:col-span-2">
                        <CardHeader>
                            <CardTitle>User Acquisition</CardTitle>
                            <CardDescription>Daily clicks vs. verified signups</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#1f1f1f", border: "none", borderRadius: "8px" }}
                                    />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="clicks"
                                        name="App Clicks"
                                        stroke="#8884d8"
                                        fillOpacity={1}
                                        fill="url(#colorClicks)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="signups"
                                        name="Signups"
                                        stroke="#82ca9d"
                                        fillOpacity={1}
                                        fill="url(#colorSignups)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Funnel / Ratio Chart (Mock) */}
                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Signup Comparison</CardTitle>
                            <CardDescription>Clicks vs Signups side-by-side</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.slice(-7)}> {/* Just show last 7 days for clarity */}
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                                        contentStyle={{ backgroundColor: "#1f1f1f", border: "none" }}
                                    />
                                    <Legend />
                                    <Bar dataKey="clicks" name="Clicks" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="signups" name="Signups" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10 text-white">
                        <CardHeader>
                            <CardTitle>Daily Active Users</CardTitle>
                            <CardDescription>Trend over selected period</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#1f1f1f", border: "none" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="activeUsers"
                                        name="Active Users"
                                        stroke="#ff7300"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
