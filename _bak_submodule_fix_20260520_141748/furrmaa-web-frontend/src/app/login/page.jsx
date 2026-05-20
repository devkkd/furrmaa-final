'use client'

import React, { useEffect, useRef, useState } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { FaApple } from 'react-icons/fa'
import Container from '@/components/Container'
import { useAuthStore } from '@/store/authStore'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    sendOtp as sendOtpApi,
    verifyOtp as verifyOtpApi,
    setToken,
    loginWithFirebaseIdToken,
    fetchMe,
    fetchAuthPublicConfig,
} from '@/lib/api'
import { mergeGuestCartToServer } from '@/lib/cartActions'
import { getFirebaseAuthCompat, isFirebaseWebConfigReady } from '@/lib/firebaseWebRuntime'
import {
    isAuth0WebConfigReady,
    auth0LoginWithGoogle,
    auth0LoginWithApple,
    completeAuth0RedirectLogin,
} from '@/lib/auth0Client'

const AuthPage = () => {
    const login = useAuthStore((state) => state.login)
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const user = useAuthStore((state) => state.user)

    const [step, setStep] = useState('PHONE') // PHONE | OTP
    const [identifier, setIdentifier] = useState('')
    const [otp, setOtp] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [socialLoading, setSocialLoading] = useState('')
    const [useFirebaseAuth, setUseFirebaseAuth] = useState(
        process.env.NEXT_PUBLIC_USE_FIREBASE_AUTH === 'true'
    )
    const [modeReady, setModeReady] = useState(false)
    const firebaseRecaptchaRef = useRef(null)
    const firebaseConfirmationRef = useRef(null)

    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect') || ''
    const isAdminRedirect = redirect === '/admin'

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            try {
                const cfg = await fetchAuthPublicConfig()
                const envMode = process.env.NEXT_PUBLIC_USE_FIREBASE_AUTH
                let mode = cfg.useFirebaseAuth === true
                if (envMode === 'true') mode = true
                if (envMode === 'false') mode = false
                if (!cancelled) setUseFirebaseAuth(mode)
            } catch (_) {
                // keep env mode
            } finally {
                if (!cancelled) setModeReady(true)
            }
        })()
        return () => {
            cancelled = true
        }
    }, [])

    const authReturnPath = isAdminRedirect ? '/admin' : '/account'

    useEffect(() => {
        if (!modeReady || !isAuthenticated || !user) return
        if (isAdminRedirect) {
            router.replace(user?.role === 'admin' ? '/admin' : '/account')
            return
        }
        router.replace('/account')
    }, [isAdminRedirect, isAuthenticated, modeReady, router, user])

    const completeAuth0Session = async (token, returnTo = authReturnPath) => {
        setToken(token)
        const me = await fetchMe()
        if (!me) throw new Error('Could not load profile after login')
        login(me)
        if (returnTo === '/admin') {
            if (me.role === 'admin') router.replace('/admin')
            else {
                setError('This account is not admin. Please login with admin account.')
                router.replace('/account')
            }
        } else {
            try {
                await mergeGuestCartToServer()
            } catch {
                /* non-blocking */
            }
            router.replace(returnTo || '/account')
        }
    }

    useEffect(() => {
        if (!modeReady || useFirebaseAuth) return
        if (typeof window === 'undefined') return

        let cancelled = false
        ;(async () => {
            if (!isAuth0WebConfigReady()) return

            const search = window.location.search || ''
            const hash = window.location.hash || ''
            const hasSpaCallback = search.includes('code=') && search.includes('state=')
            const hasImplicitToken = hash.includes('access_token=')

            if (!hasSpaCallback && !hasImplicitToken) return

            setLoading(true)
            try {
                if (hasSpaCallback) {
                    const { token, returnTo } = await completeAuth0RedirectLogin()
                    if (!cancelled) await completeAuth0Session(token, returnTo)
                } else if (hasImplicitToken) {
                    const params = new URLSearchParams(hash.slice(1))
                    const token = params.get('access_token') || params.get('id_token')
                    if (!token) throw new Error('Auth0 token missing in callback')
                    if (!cancelled) await completeAuth0Session(token)
                }
            } catch (e) {
                if (!cancelled) setError(e.message || 'Social login failed')
            } finally {
                if (!cancelled) {
                    setLoading(false)
                    window.history.replaceState({}, document.title, '/login')
                }
            }
        })()

        return () => {
            cancelled = true
        }
    }, [isAdminRedirect, login, modeReady, router, useFirebaseAuth])

    const digitsOnly = (v) => v.replace(/\D/g, '').slice(-10)
    const isEmail = (v) => v.includes('@')

    const completeJwtLogin = async (token, userObj) => {
        if (token) setToken(token)
        login({
            ...userObj,
            phone: userObj?.phone,
            name: userObj?.name || 'Furrmaa User',
        })
        if (isAdminRedirect) {
            if (userObj?.role === 'admin') {
                router.replace('/admin')
            } else {
                setError('This account is not admin. Please login with admin account.')
                router.replace('/account')
            }
            return
        }
        try {
            await mergeGuestCartToServer()
        } catch {
            /* non-blocking */
        }
        router.replace('/account')
    }

    const completeFirebaseTokenLogin = async (idToken) => {
        const data = await loginWithFirebaseIdToken(idToken)
        const { token, user } = data
        await completeJwtLogin(token, user)
    }

    const sendOtp = async () => {
        const value = identifier.trim()
        if (!value) {
            setError('Enter phone number or email')
            return
        }
        if (!isEmail(value) && digitsOnly(value).length !== 10) {
            setError('Enter a valid 10 digit mobile number')
            return
        }
        if (isEmail(value) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setError('Enter a valid email address')
            return
        }

        setError('')
        setLoading(true)

        try {
            if (useFirebaseAuth && !isEmail(value)) {
                if (!isFirebaseWebConfigReady()) {
                    throw new Error('Firebase config missing in .env')
                }
                const auth = await getFirebaseAuthCompat()
                const fullPhone = `+91${digitsOnly(value)}`
                if (firebaseRecaptchaRef.current?.clear) {
                    firebaseRecaptchaRef.current.clear()
                    firebaseRecaptchaRef.current = null
                }
                firebaseRecaptchaRef.current = new window.firebase.auth.RecaptchaVerifier(
                    'recaptcha-container',
                    { size: 'invisible' },
                    auth
                )
                firebaseConfirmationRef.current = await auth.signInWithPhoneNumber(
                    fullPhone,
                    firebaseRecaptchaRef.current
                )
            } else {
                await sendOtpApi(value)
            }
            setStep('OTP')
        } catch (e) {
            setError(e.message || 'Failed to send OTP')
        } finally {
            setLoading(false)
        }
    }

    const verifyOtp = async () => {
        if (otp.length < 6) {
            setError('Enter 6-digit OTP')
            return
        }
        setError('')
        setLoading(true)

        try {
            if (firebaseConfirmationRef.current) {
                const cred = await firebaseConfirmationRef.current.confirm(otp.trim())
                const idToken = await cred.user.getIdToken()
                firebaseConfirmationRef.current = null
                await completeFirebaseTokenLogin(idToken)
            } else {
                const value = identifier.trim()
                const { token, user } = await verifyOtpApi(value, otp.trim(), 'Furrmaa User')
                await completeJwtLogin(token, user)
            }
        } catch (e) {
            setError(e.message || 'Invalid OTP')
        } finally {
            setLoading(false)
        }
    }

    const onGoogle = async () => {
        setError('')
        setLoading(true)
        setSocialLoading('google')
        try {
            if (useFirebaseAuth) {
                if (!isFirebaseWebConfigReady()) throw new Error('Firebase config missing in .env')
                const auth = await getFirebaseAuthCompat()
                const provider = new window.firebase.auth.GoogleAuthProvider()
                const cred = await auth.signInWithPopup(provider)
                const idToken = await cred.user.getIdToken()
                await completeFirebaseTokenLogin(idToken)
            } else {
                if (!isAuth0WebConfigReady()) throw new Error('Auth0 is not configured')
                await auth0LoginWithGoogle(authReturnPath)
            }
        } catch (e) {
            setError(e.message || 'Google login failed')
        } finally {
            setLoading(false)
            setSocialLoading('')
        }
    }

    const onApple = async () => {
        setError('')
        setLoading(true)
        setSocialLoading('apple')
        try {
            if (useFirebaseAuth) {
                if (!isFirebaseWebConfigReady()) throw new Error('Firebase config missing in .env')
                const auth = await getFirebaseAuthCompat()
                const provider = new window.firebase.auth.OAuthProvider('apple.com')
                const cred = await auth.signInWithPopup(provider)
                const idToken = await cred.user.getIdToken()
                await completeFirebaseTokenLogin(idToken)
            } else {
                if (!isAuth0WebConfigReady()) throw new Error('Auth0 is not configured')
                await auth0LoginWithApple(authReturnPath)
            }
        } catch (e) {
            setError(e.message || 'Apple login failed')
        } finally {
            setLoading(false)
            setSocialLoading('')
        }
    }

    if (!modeReady) {
        return (
            <section className="min-h-[100vh] flex items-center justify-center bg-gray-50 px-4">
                <p className="text-gray-500 text-sm">Loading...</p>
            </section>
        )
    }

    return (
        <section className="min-h-[100vh] flex items-center justify-center bg-gray-50 px-4">
            <Container>
                <div className="max-w-[400px] mx-auto bg-white border border-gray-100 rounded-[28px] p-6 md:p-8 shadow-sm">

                    <header className="mb-6">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
                            {step === 'PHONE'
                                ? <>Create Your Account 🐾 <br /> or Login</>
                                : 'Verify OTP'}
                        </h1>

                        {step === 'PHONE' && (
                            <p className="mt-2 text-gray-600 text-sm md:text-[15px]">
                                Join <span className="font-bold text-gray-900">Furrmaa</span> and give your pet the care they deserve.
                            </p>
                        )}
                    </header>

                    <div className="space-y-3">

                        {step === 'PHONE' && (
                            <>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide ml-1">
                                    Mobile Number / Email
                                </label>

                                <input
                                    type="text"
                                    placeholder="99999 99999 or you@example.com"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none"
                                />
                                <div id="recaptcha-container" />

                                {error && <p className="text-red-500 text-xs">{error}</p>}

                                <button
                                    onClick={sendOtp}
                                    disabled={loading}
                                    className="w-full bg-[#1F2E46] text-white font-bold py-3.5 rounded-full mt-2 disabled:opacity-70"
                                >
                                    {loading ? 'Sending...' : 'Send OTP →'}
                                </button>
                            </>
                        )}

                        {step === 'OTP' && (
                            <>
                                <input
                                    type="text"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 text-sm"
                                />

                                {error && <p className="text-red-500 text-xs">{error}</p>}

                                <button
                                    onClick={verifyOtp}
                                    disabled={loading}
                                    className="w-full bg-[#1F2E46] text-white font-bold py-3.5 rounded-full mt-2 disabled:opacity-70"
                                >
                                    {loading ? 'Verifying...' : 'Verify & Login →'}
                                </button>
                            </>
                        )}

                        <div className="relative mt-4">
                            <div className="flex justify-center text-[10px] uppercase font-bold tracking-widest">
                                <span className="bg-white px-4 text-gray-400">or login with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={onGoogle}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-full disabled:opacity-60"
                            >
                                <FcGoogle className="text-xl" />
                                <span className="font-bold text-gray-700 text-xs">
                                    {socialLoading === 'google' ? 'Please wait...' : 'Google'}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={onApple}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 border border-gray-200 py-2.5 rounded-full disabled:opacity-60"
                            >
                                <FaApple className="text-xl" />
                                <span className="font-bold text-gray-700 text-xs">
                                    {socialLoading === 'apple' ? 'Please wait...' : 'Apple'}
                                </span>
                            </button>
                        </div>

                    </div>

                    <footer className="mt-8 text-center">
                        <p className="text-[11px] text-gray-400">
                            By continuing, you agree to our
                            <span className="font-bold text-gray-700"> Terms</span> &
                            <span className="font-bold text-gray-700"> Privacy Policy</span>.
                        </p>
                    </footer>

                </div>
            </Container>
        </section>
    )
}

export default AuthPage
