"use client"

import { useEffect } from 'react'
import axios from 'axios'

export function BackendTester() {
  useEffect(() => {
    const testBackend = async () => {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        console.log("Testing backend connection to:", apiBaseUrl)
        const response = await axios.get(`${apiBaseUrl}/api/test`)
        console.log("Backend test response:", response.data)
      } catch (error) {
        console.error("Backend test failed:", error)
      }
    }
    
    testBackend()
  }, [])
  
  return null
} 