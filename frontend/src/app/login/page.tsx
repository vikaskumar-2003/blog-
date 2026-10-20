"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import axios from "axios"
import Cookies from "js-cookie"
import toast from "react-hot-toast"
import {useGoogleLogin} from "@react-oauth/google"
import { useAppData, user_service } from "@/context/AppContext"
import { redirect } from "next/navigation"
import Loading from "@/components/loading"


const LoginPage = () => {

  const{isAuth,setIsAuth,setLoading,loading,setUser}=useAppData()

  if(isAuth) return redirect('/')
  
  const responseGoogle=async(authResult:any)=>{

     try {
      const  result=await axios.post(`${user_service}/api/v1/login`,{
        code:authResult["code"]
      })
   
      Cookies.set("token",result.data.token,{
        expires:5,
        secure:true,
        path:"/"
      })
 
      toast.success(result.data.message)
      setIsAuth(true)
      setLoading(true)
      setUser(result.data.user)

     } catch (error) {
      console.log("error",error);
      toast.error('problem while login')
     }

  }

  const googleLogin=useGoogleLogin({
    onSuccess:responseGoogle,
    onError:responseGoogle,
    flow:"auth-code"
  })

  return (
    <>{loading?<Loading/>:
    <div className="w-[350px] m-auto mt-[200px]">
     <Card className=" w-[350px] ">
      <CardHeader>
        <CardTitle >Login to The Reading Retreat</CardTitle>
        <CardDescription>
     You got to blog app
        </CardDescription>
      </CardHeader>
      <CardContent className="-mb-(--card-spacing)">
        <Button onClick={googleLogin}> Login with google <img src="/transparent-google-logo-flat-google-logo-with-blue-green-red-1710875778465.webp" alt="" className="w-6 h-6 rounded-full" /></Button>
      </CardContent>
     
    </Card>
    </div>}
    </>
  )
}

export default LoginPage