'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, TrendingUp, HandCoins, UserCheck } from 'lucide-react'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

// Random data generators to create variety
const CITIES = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Newcastle', 'Sheffield', 'Bristol', 'Edinburgh', 'Cardiff', 'Belfast', 'Nottingham', 'Southampton']
const BRANDS = ['PureGym', 'JD Gyms', 'The Gym Group', 'Anytime Fitness', 'Snap Fitness', 'Nuffield Health', 'David Lloyd', 'Everlast Fitness', 'Village Gym', 'Bannatyne', 'Jetts Gyms']
const SAVINGS = ['£120', '£85', '£150', '£200', '£95', '£110', '£75', '£180']

type ActivityType = 'view' | 'bounty' | 'save' | 'trending' | 'join'

interface LiveEvent {
  id: string;
  type: ActivityType;
  message: string;
  subMessage?: string;
}

const generateRandomEvent = (): LiveEvent => {
  const types: ActivityType[] = ['view', 'bounty', 'save', 'trending', 'join']
  // Weight trending and save slightly higher for sales perspective
  const weightedTypes: ActivityType[] = ['view', 'bounty', 'save', 'save', 'trending', 'trending', 'join']
  const type = weightedTypes[Math.floor(Math.random() * weightedTypes.length)]
  
  const city = CITIES[Math.floor(Math.random() * CITIES.length)]
  const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)]
  
  let message = ''
  let subMessage = ''
  
  switch (type) {
    case 'view':
      message = `Somebody in ${city}`
      subMessage = `just viewed ${brand}`
      break
    case 'bounty':
      message = `New Gym Bounty added!`
      subMessage = `A reward is waiting in ${city}`
      break
    case 'save':
      message = `User just saved ${SAVINGS[Math.floor(Math.random() * SAVINGS.length)]}/year`
      subMessage = `by comparing prices in ${city}`
      break
    case 'trending':
      const count = Math.floor(Math.random() * 8) + 3
      message = `Trending right now`
      subMessage = `${count} users comparing gyms in ${city}`
      break
    case 'join':
      message = `New member joined!`
      subMessage = `Signed up for ${brand} in ${city}`
      break
  }
  
  return {
    id: 'sim_' + Math.random().toString(36).substring(7),
    type,
    message,
    subMessage
  }
}

const formatRealEvent = (docId: string, data: any): LiveEvent | null => {
  if (!data || !data.type) return null;
  const type: ActivityType = data.type as ActivityType;
  const city = data.city || 'the UK';
  const brand = data.brand || 'a gym';

  let message = '';
  let subMessage = '';

  switch (type) {
    case 'view':
      message = `Somebody in ${city}`
      subMessage = `just viewed ${brand}`
      break
    case 'join':
      message = `New member joined!`
      subMessage = `Heading to ${brand} in ${city}`
      break
    case 'bounty':
      message = `Gym Bounty Claimed!`
      subMessage = `A reward was issued in ${city}`
      break
    case 'trending':
      message = `Trending right now`
      subMessage = `Users are comparing gyms in ${city}`
      break
    case 'save':
      message = `Savings Alert!`
      subMessage = `User found a cheaper deal in ${city}`
      break
    default:
      return null;
  }

  return { id: docId, type, message, subMessage };
}

export function LiveActivityEngine() {
  const [currentEvent, setCurrentEvent] = useState<LiveEvent | null>(null)
  const realEventsQueueRef = useRef<LiveEvent[]>([])
  const shownRealEventIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    // 1. Setup Firestore Listener for Real Events
    let unsubscribe = () => {};
    if (db) {
      try {
        const activitiesRef = collection(db, 'recent_activities');
        const q = query(activitiesRef, orderBy('timestamp', 'desc'), limit(10));
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const freshEvents: LiveEvent[] = [];
          snapshot.forEach((doc) => {
            const ev = formatRealEvent(doc.id, doc.data());
            if (ev && !shownRealEventIds.current.has(ev.id)) {
              freshEvents.push(ev);
            }
          });
          // Update queue with events that haven't been shown yet
          realEventsQueueRef.current = freshEvents;
        });
      } catch (e) {
        console.warn('LiveActivityEngine Firestore listener failed:', e)
      }
    }

    // 2. Start the Engine Loop
    const initialTimer = setTimeout(() => {
      triggerNextEvent()
    }, 4000)

    return () => {
      clearTimeout(initialTimer);
      unsubscribe();
    }
  }, [])

  const triggerNextEvent = () => {
    // Check if we have a real event waiting
    let nextEvent: LiveEvent | null = null;
    
    if (realEventsQueueRef.current.length > 0) {
      // Pop the oldest unshown event from the queue
      nextEvent = realEventsQueueRef.current.pop() || null;
      if (nextEvent) {
        shownRealEventIds.current.add(nextEvent.id);
      }
    }

    // Fallback to simulated event if no real event is queued
    if (!nextEvent) {
      nextEvent = generateRandomEvent();
    }

    setCurrentEvent(nextEvent)
    
    // Hide after 5 seconds
    setTimeout(() => {
      setCurrentEvent(null)
      
      // Schedule next event (wait 8 to 20 seconds between events)
      const nextDelay = Math.floor(Math.random() * 12000) + 8000
      setTimeout(() => {
        triggerNextEvent()
      }, nextDelay)
      
    }, 5000)
  }

  const getIcon = (type: ActivityType) => {
    switch (type) {
      case 'view': return <Activity className="h-4 w-4 text-blue-400" />
      case 'bounty': return <HandCoins className="h-4 w-4 text-amber-400" />
      case 'save': return <TrendingUp className="h-4 w-4 text-emerald-400" />
      case 'trending': return <Activity className="h-4 w-4 text-purple-400" />
      case 'join': return <UserCheck className="h-4 w-4 text-emerald-500" />
      default: return <Activity className="h-4 w-4 text-primary" />
    }
  }

  const getPulseColor = (type: ActivityType) => {
    switch (type) {
      case 'view': return 'bg-blue-400/30'
      case 'bounty': return 'bg-amber-400/30'
      case 'save': return 'bg-emerald-400/30'
      case 'trending': return 'bg-purple-400/30'
      case 'join': return 'bg-emerald-500/30'
      default: return 'bg-primary/30'
    }
  }

  return (
    <AnimatePresence>
      {currentEvent && (
        <motion.div
          key={currentEvent.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed bottom-4 left-4 z-50 max-w-[280px] pointer-events-none sm:bottom-6 sm:left-6"
        >
          <div className="bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-3 flex items-start gap-3 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className={`mt-0.5 bg-background p-2 rounded-full shadow-sm border border-border/50 relative shrink-0`}>
              <div className={`absolute inset-0 ${getPulseColor(currentEvent.type)} rounded-full animate-ping opacity-75`} />
              {getIcon(currentEvent.type)}
            </div>
            
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-semibold text-foreground truncate select-none">
                  {currentEvent.message}
                </p>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap hidden sm:block">
                  Just now
                </span>
              </div>
              {currentEvent.subMessage && (
                <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug select-none">
                  {currentEvent.subMessage}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
