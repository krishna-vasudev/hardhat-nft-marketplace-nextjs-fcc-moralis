"use client";
import { MoralisProvider } from "react-moralis";
import React from 'react'


export default function MyMoralisProvider({children}:Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <MoralisProvider initializeOnMount={false}>
      
        {children}
    </MoralisProvider>
  )
}
