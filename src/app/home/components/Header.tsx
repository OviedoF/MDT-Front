import Image from 'next/image'
import React from 'react'

export default function Header() {
  return (
    <header className='bg-green py-4 px-4 flex justify-between items-center'>
      <div className='relative w-2/5 h-12'>
        <Image
          src='/logo_h.svg'
          alt='header'
          fill
          style={{
            objectFit: 'contain',
          }}
        />
      </div>

      <section className='bg-darkgreen rounded-full flex items-center px-2'>
        <h2 className='flex flex-col items-end p-2 text-sm'>
          <span className='text-white uppercase font-bold'>ARGonzAlez</span>
          <span className='text-white'>9302123</span>
        </h2>

        <div className='flex items-center justify-center bg-white rounded-full'>
          <Image
            src='/avatar.png'
            alt='avatar'
            width={40}
            height={40}
          />
        </div>
      </section>
    </header>
  )
}
