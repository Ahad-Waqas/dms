import { LoginForm } from '@/components/login-form'
import React from 'react'

const page = () => {
  return (
    <div className="bg-transparent w-[100%] flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
          <div className="w-full md:max-w-5xl  rounded-lg shadow-md p-6 md:p-10 flex flex-col items-center justify-center">
            <LoginForm />
          </div>
        </div>
  )
}

export default page