import { NextResponse } from "next/server"

export const dynamic = "force-static";
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function GET() {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
    }

    try {
        const projectRoot = "/Users/joe/Desktop/ApiFinderApp"
        const scriptPath = `${projectRoot}/Sources/APIFinder/Utils/AutoAnalyzer.swift`

        const { stdout, stderr } = await execAsync(`swift ${scriptPath}`)

        return NextResponse.json({
            success: true,
            output: stdout,
            errors: stderr
        })
    } catch (error: any) {
        console.error("AutoAnalyze execution failed:", error)
        return NextResponse.json({
            success: false,
            error: error.message,
            output: error.stdout,
            stderr: error.stderr
        }, { status: 500 })
    }
}
