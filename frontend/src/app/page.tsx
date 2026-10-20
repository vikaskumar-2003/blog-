"use client"

import Loading from '@/components/loading'
import { Button } from '../components/ui/button'
import React from 'react'
import { useAppData } from '@/context/AppContext'

const Home = () => {

   const{loading}=useAppData()

  return (
   <div>
    {loading?<Loading/>:<Button>click</Button>}
   </div>
  )
}

export default Home