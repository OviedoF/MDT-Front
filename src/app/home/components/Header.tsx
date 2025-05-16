'use client'
import { makeQuery } from '@/app/utils/api'
import Image from 'next/image'
import { useSnackbar } from 'notistack'
import React, { useEffect } from 'react'
import { useState } from 'react'

interface User {
  name: string
  _id?: string
}

export default function Header() {
  const [user, setUser] = useState<User>({
    name: '',
    _id: ''
  })
  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  useEffect(() => {
    if(localStorage.getItem('user')) {
      const userData = JSON.parse(localStorage.getItem('user') || '')
      setUser(userData)
    }

    makeQuery(
      localStorage.getItem('token'),
      'getUserProjects',
      {},
      enqueueSnackbar,
      (response: any) => {
        console.log(response)
      },
      setLoading
    )
  }, [])

  return (
    <header className='bg-green py-4 px-4 flex justify-between items-center'>
      <div className='relative w-2/5 h-12'>
        <Image
          src='/logo_top.png'
          alt='header'
          fill
          style={{
            objectFit: 'contain',
          }}
        />
      </div>

      <section className='bg-darkgreen rounded-full flex items-center px-2'>
        <h2 className='flex flex-col items-end p-2 text-sm'>
          <span className='text-white uppercase font-bold'>{ user?.name }</span>
          <span className='text-white'>
            { user?._id?.slice(0, 5) }...{ user?._id?.slice(-5) }
          </span>
        </h2>
      </section>
    </header>
  )
}
