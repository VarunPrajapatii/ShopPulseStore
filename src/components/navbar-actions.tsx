"use client"

import { useEffect, useState } from 'react'
import Button from '@/components/ui/button'
import { ShoppingBag } from 'lucide-react'

const NavbarAction = () => {
  // we add mount because we want to use cart and store items in the local storage so that can cause hydration error
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className='ml-auto flex items-center gap-x-4'>
      <Button className='flex items-center rounded-full bg-black px-4 py-2'>
        <ShoppingBag
           size={20}
           color='white' 
        />
        <span className='ml-2 text-sm font-medium text-white'>
          0
        </span>
      </Button>
    </div>
  )
}

export default NavbarAction