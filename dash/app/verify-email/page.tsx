'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function VerifyEmailPage() {
  const [timeLeft, setTimeLeft] = useState(300)
  const [resendDisabled, setResendDisabled] = useState(true)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [verificationFailed, setVerificationFailed] = useState(false)

  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setVerificationFailed(true)
      return
    }

    const verify = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/verify-email?token=${token}`)
        const data = await res.json()

        if (res.ok) {
          console.log('Redirecting to:', data.redirect_url || '/dashboard')
          window.location.href = data.redirect_url || '/dashboard'
        } else {
          throw new Error(data.detail || 'Invalid or expired token')
        }
      } catch (err: any) {
        setMessage(err.message || 'Verification failed')
        setVerificationFailed(true)
        setLoading(false)
      }
    }

    verify()
  }, [token])

  useEffect(() => {
    if (timeLeft <= 0) {
      setResendDisabled(false)
      return
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min}:${sec < 10 ? '0' : ''}${sec}`
  }

  const handleResend = async () => {
    try {
      setResendDisabled(true)
      setMessage('')
      setTimeLeft(5 * 60)

      const email = localStorage.getItem('registeredEmail')
      const res = await fetch('http://localhost:8000/api/resend-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok) {
        const errorDetail =
          typeof data.detail === 'string'
            ? data.detail
            : Array.isArray(data.detail)
              ? data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ')
              : JSON.stringify(data.detail)

        throw new Error(errorDetail || 'Failed to resend verification email.')
      }

      setMessage('Verification email resent successfully.')
    } catch (err: any) {
      setMessage(err.message || 'An error occurred')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-4">Verify Your Email</h1>

        {loading ? (
          <p className="text-gray-600">Verifying your email...</p>
        ) : verificationFailed ? (
          <>
            <p className="text-gray-600 mb-4">
              A verification link has been sent to your email. Please check your inbox.
            </p>

            {resendDisabled ? (
              <p className="text-sm text-gray-500 mb-4">
                You can resend the email in <span className="font-semibold">{formatTime(timeLeft)}</span>
              </p>
            ) : (
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={handleResend}
              >
                Resend Email
              </button>
            )}

            {message && <p className="mt-4 text-red-600">{message}</p>}
          </>
        ) : null}
      </div>
    </div>
  )
}
