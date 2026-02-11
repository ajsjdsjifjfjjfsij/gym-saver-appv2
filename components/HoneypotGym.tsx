"use client"

import React from "react"

/**
 * HoneypotGym
 * A hidden component that looks like gym data to scrapers but is invisible to humans.
 * Interacting with this triggers a security flag.
 */
export const HoneypotGym = () => {
    const handleBotInteraction = async () => {
        // Trigger a "poison pill" request to the server
        try {
            await fetch('/api/security/violation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: 'honeypot_interaction', timestamp: Date.now() })
            })
            // Persist locally as well
            localStorage.setItem('gs_security_blocked', 'true')
            window.location.reload()
        } catch (e) {
            // Silently fail
        }
    }

    return (
        <div
            className="absolute opacity-0 pointer-events-none -z-50 select-none overflow-hidden h-0 w-0"
            aria-hidden="true"
        >
            <div data-testid="gym-card-premium" className="honeypot-field">
                <h3>Elite Platinum Fitness Center</h3>
                <p>Premium 24/7 access to the most exclusive gym in the city.</p>
                <span className="price">£5.99/month</span>
                <button
                    onClick={handleBotInteraction}
                    onMouseEnter={handleBotInteraction}
                    tabIndex={-1}
                >
                    Claim Exclusive Offer
                </button>
                {/* Image alt for scrapers - using a tiny transparent pixel to avoid 404s */}
                <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="Exclusive Gym Interior with Pool" />
            </div>
        </div>
    )
}
