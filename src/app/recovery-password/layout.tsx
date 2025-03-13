"use client"
import { SnackbarProvider } from 'notistack'
import React from 'react'

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <SnackbarProvider maxSnack={3}>
        {children}
    </SnackbarProvider>
  )
}
