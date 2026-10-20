"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import {GoogleOAuthProvider} from "@react-oauth/google"

export const user_service = "http://localhost:5000";
export const author_service = "http://localhost:5001";
export const blog_service = "http://localhost:5002";

export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  bio: string;
}

export interface Blog {
  id: string;
  title: string;
  description: string;
  blogcontent: string;
  image: string;
  category: string;
  linkedin: string;
  bio: string;
  author: string;
  created_at: string;
}

interface AppContextType {
  user: User | null;
   isAuth: boolean;
  loading: boolean;
  setLoading:React.Dispatch<React.SetStateAction<boolean>>
    setIsAuth:React.Dispatch<React.SetStateAction<boolean>>
     setUser:React.Dispatch<React.SetStateAction<User | null>>
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User |null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    try {
      const token = Cookies.get("token");

        if (!token) {
      setUser(null);
      setIsAuth(false);
      return;
    }

      const { data } = await axios.get(`${user_service}/api/v1/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data);
      setIsAuth(true);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
    finally {
    setLoading(false);
  }
  }

  useEffect(()=>{
  
fetchUser()


  },[])

  return <AppContext.Provider value={{ user,setUser,isAuth, loading ,setIsAuth,setLoading}}>
     <GoogleOAuthProvider clientId="688540549996-ga8jnb0h66l9bp9u7i7r7bhjj8nu7iut.apps.googleusercontent.com">
        {children} <Toaster/> 
     </GoogleOAuthProvider>
    
    </AppContext.Provider>;
};


export const useAppData=():AppContextType=>{
    const context=useContext(AppContext)
    if (!context) {
        throw new Error("use app data must be used within approvide")
    }
    return context
}