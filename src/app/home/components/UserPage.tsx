import React from 'react'
import Header from './Header'
import Navbar from './Navbar'

export default function UserPage({ children }: { children: React.ReactNode }) {
    return (
        <div className='min-h-screen relative'>
            <Header />
            {children}
            <Navbar />
        </div>
    )
}
