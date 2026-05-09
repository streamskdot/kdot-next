'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

interface UseLiveViewCountReturn {
  viewerCount: number
  isConnected: boolean
}

/**
 * Hook to track live viewers for a video using simple polling
 * This avoids WebSocket/Cloudflare cookie issues
 * 
 * @param videoId - The unique identifier for the video/stream
 * @returns Object containing viewer count and connection status
 */
export function useLiveViewCount(videoId: string): UseLiveViewCountReturn {
  const [viewerCount, setViewerCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const viewerIdRef = useRef<string>('')
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Return early if no videoId
    if (!videoId) {
      return
    }

    // Generate or retrieve a persistent viewer ID from localStorage
    // This prevents counting the same viewer multiple times on refresh
    const storageKey = `viewer_id_${videoId}`
    const storedViewerId = localStorage.getItem(storageKey)
    
    if (storedViewerId) {
      viewerIdRef.current = storedViewerId
    } else {
      viewerIdRef.current = crypto.randomUUID()
      localStorage.setItem(storageKey, viewerIdRef.current)
    }

    // Function to register/update viewer in database
    const registerViewer = async () => {
      // Disabled to prevent viewer table operations
      return
      
      try {
        // Insert or update viewer record with last_seen timestamp
        console.log('[useLiveViewCount] Registering viewer for videoId:', videoId, 'viewerId:', viewerIdRef.current)
        
        const { error } = await supabase
          .from('viewers')
          .upsert(
            {
              video_id: videoId,
              viewer_id: viewerIdRef.current,
              last_seen: new Date().toISOString(),
            },
            {
              onConflict: 'video_id,viewer_id',
            }
          )
        
        if (error) {
          console.error('[useLiveViewCount] Error registering viewer:', error)
        } else {
          console.log('[useLiveViewCount] Successfully registered viewer')
          setIsConnected(true)
        }
      } catch (error) {
        console.error('[useLiveViewCount] Error registering viewer:', error)
      }
    }

    // Function to get current viewer count
    const fetchViewerCount = async () => {
      // Disabled to prevent viewer table operations
      return
      
      try {
        // Count viewers who were active in the last 40 seconds
        const fortySecondsAgo = new Date(Date.now() - 40 * 1000).toISOString()
        
        console.log('[useLiveViewCount] Fetching count for videoId:', videoId, 'since:', fortySecondsAgo, '(40 second timeout)')
        
        const { count, error } = await supabase
          .from('viewers')
          .select('*', { count: 'exact', head: true })
          .eq('video_id', videoId)
          .gt('last_seen', fortySecondsAgo)
        
        if (error) {
          console.error('[useLiveViewCount] Error fetching viewer count:', error)
        } else {
          console.log('[useLiveViewCount] Viewer count for videoId', videoId, ':', count, '(raw count:', count, ')')
          setViewerCount(count || 0)
        }
      } catch (error) {
        console.error('[useLiveViewCount] Error fetching viewer count:', error)
      }
    }

    // Initial registration and count
    registerViewer()
    fetchViewerCount()

    // Poll for viewer count every 5 seconds
    pollIntervalRef.current = setInterval(() => {
      fetchViewerCount()
    }, 5000)

    // Heartbeat: update last_seen every 30 seconds
    heartbeatIntervalRef.current = setInterval(() => {
      registerViewer()
    }, 30000)

    // Handle tab visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Stop polling when tab is hidden
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
          pollIntervalRef.current = null
        }
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current)
          heartbeatIntervalRef.current = null
        }
      } else {
        // Resume when tab becomes visible
        registerViewer()
        fetchViewerCount()
        pollIntervalRef.current = setInterval(fetchViewerCount, 5000)
        heartbeatIntervalRef.current = setInterval(registerViewer, 30000)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup function
    return () => {
      // Clear intervals
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }

      // Remove visibility listener
      document.removeEventListener('visibilitychange', handleVisibilityChange)

      // Note: We don't delete the viewer record on unmount
      // The 2-minute timeout in fetchViewerCount will naturally expire inactive viewers
      // This prevents count fluctuations on page refresh
    }
  }, [videoId])

  return {
    viewerCount,
    isConnected,
  }
}
