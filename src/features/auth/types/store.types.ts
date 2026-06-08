export interface AuthState{
    authUser:object|null,
    token:string|null,
    isCheckingAuth:boolean,

    
    signup:()=>Promise<void>
    login:()=>Promise<void>
    checkAuth:()=>Promise<void>
    logout:()=>Promise<void>
}