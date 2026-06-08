import {create} from 'zustand'
import { AuthState } from '../types/store.types'



export const useAuthStore = create<AuthState>((set,get)=>({
    authUser:null,
    token:null,
    isCheckingAuth:false,


    signup:()=>{

    },
    login:()=>{

    },
    checkAuth:async()=>{
        try {
            // const data = await checkUser()
        } catch (error) {
            console.log("Error in checkAuth:", error); 
            set({authUser:null,token:null})
        }finally{
            set({isCheckingAuth:false})
        }
    },

}))