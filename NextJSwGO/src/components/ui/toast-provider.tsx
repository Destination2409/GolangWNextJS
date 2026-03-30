"use client"

import * as React from "react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer 
        toastClassName="bg-card text-card-foreground border border-border shadow-lg font-sans"
        bodyClassName="text-sm font-medium"
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" // Using dark theme as the background is generally a dark color base in this project
      />
    </>
  )
}
