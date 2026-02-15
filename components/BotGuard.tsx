"use client"

import React from "react"

interface BotGuardProps {
    children: React.ReactNode;
    serverBotDetected?: boolean;
}

// TEMPORARY BYPASS: Completely disabled to debug "Application Error" on live site
export const BotGuard = ({ children }: BotGuardProps) => {
    return <>{children}</>
}
