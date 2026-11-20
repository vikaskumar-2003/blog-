"use client"

import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { useAppData } from '@/context/AppContext'
import { Filter } from 'lucide-react'
import Loading from '@/components/loading'
import React from 'react'
import BlogCard from '@/components/BlogCard'

const Blogs = () => {

   const{loading,blogLoading,blogs}=useAppData()
       const{toggleSidebar}=useSidebar()

  return (
    <>
    {loading ? (
           <Loading />
         ) : (
           <div className="container mx-auto">
             <div className="flex justify-between items-center my-5 ">
               <h1 className="text-3xl font-bold ">Latest Blogs</h1>
               <Button
                 onClick={toggleSidebar}
                 className={"flex items-center gap-2 px-4 bg-primary text-white"}
               >
                 <Filter size={18} />
                 <span>Filter blogs</span>
               </Button>
             </div>
             {
                blogLoading?<Loading/>:<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 '>
              {
                blogs?.length===0&& <p>No Blogs Yet</p>
              }
              {
                blogs && blogs.map((e,i)=>{
                    return(<BlogCard key={i} image={e.image} title={e.title} desc={e.description} id={e.id} time={e.created_at} />)
                })
              }
                </div>
             }
           </div>
         )}
         </>
        )
}

export default Blogs