"use client";
import React from 'react'
//@ts-ignore
import { ConnectButton } from '@web3uikit/web3';
import Link from 'next/link';

export default function Header() {
  return (
    <nav className='flex flex-row justify-between py-6 px-6 border-b-2'>
      <h1 className='text-3xl font-bold'>Nft Marketplace</h1>
      <div className='flex flex-row'>
        <Link href="/" className='p-4 px-6 text-xl font-semibold'>
          Home
        </Link>
        <Link href="/sell-nft" className='p-4 px-6 text-xl font-semibold'>
          Sell Nft
        </Link>
        <div className='p-2'>
        <ConnectButton moralisAuth={false} />
        </div>
      </div>
    </nav>
  )
}