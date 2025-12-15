import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // Forward request to backend (e.g., FastAPI server)
    const res = await axios.post(
      `http://localhost:8000/users/login?email=${email}&password=${password}`
    )

    if (res.status === 200) {
      // Return user data to the client
      return NextResponse.json(
        { user_id: res.data.user_id, message: 'Login successful' },
        { status: 200 }
      )
    }

    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json({ message: 'Login failed' }, { status: 500 })
  }
}
