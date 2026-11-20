"use client"


import React from 'react'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar'
import { Input } from './ui/input'
import { BoxSelect } from 'lucide-react'
import { blogCategories } from '@/app/blog/new/page'
import { useAppData } from '@/context/AppContext'

const SideBar = () => {
 
    const{searchQuery,setCategory,setSearchQuery}=useAppData()
console.log("search query",searchQuery);


  return (
   <Sidebar>
    <SidebarHeader className='bg-white text-2xl font-bold mt-5'>
        The Reading Retreat
    </SidebarHeader>
    <SidebarContent className='bg-white'>
             <SidebarGroup>
                <SidebarGroupLabel>
                    Search
                </SidebarGroupLabel>
                <Input type='text' value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} placeholder='search your desired blog' />
                 <SidebarGroupLabel>
                    Categories
                </SidebarGroupLabel>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={()=>setCategory("")} >
                            <BoxSelect/>
                            <span>All</span>
                        </SidebarMenuButton>
                        {
                            blogCategories?.map((e,i)=>{
                                return(
                                     <SidebarMenuButton key={e} onClick={()=>setCategory(e)} >
                            <BoxSelect/>
                            <span>{e}</span>
                        </SidebarMenuButton>
                                )
                            })
                        }
                    </SidebarMenuItem>
                </SidebarMenu>
             </SidebarGroup>
    </SidebarContent>
   </Sidebar>
  )
}

export default SideBar