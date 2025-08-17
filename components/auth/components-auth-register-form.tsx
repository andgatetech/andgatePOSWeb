'use client';

import IconLockDots from '@/components/icon/icon-lock-dots';
import IconMail from '@/components/icon/icon-mail';
import IconUser from '@/components/icon/icon-user';
import { RootState } from '@/store';
import { useRegisterMutation } from '@/store/features/auth/authApi';
import { useRouter } from 'next/navigation';
import React, { FormEvent, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { login } from '@/store/features/auth/authSlice';

const ComponentsAuthRegisterForm = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [registerApi, { isLoading }] = useRegisterMutation();

    const [credentials, setCredentials] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submitForm = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const result = await registerApi(credentials).unwrap();

            console.log('Registration successful:', result);

            // ✅ Set cookie
            document.cookie = `token=${result.data.token}; path=/; max-age=${60 * 60 * 24}; Secure; SameSite=Strict`;

            // ✅ Save to Redux
            dispatch(login({ user: result.data, token: result.data.token }));

            // ✅ Show toast and redirect
            toast.success('Registration successful! Redirecting to dashboard...');
            setTimeout(() => {
                router.push('/components/cards');
            }, 1500);
        } catch (error: any) {
            console.error('Registration failed:', error);
            toast.error(error?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
            <div>
                <label htmlFor="Name">Name</label>
                <div className="relative text-white-dark">
                    <input
                        id="Name"
                        required
                        onChange={(e) => setCredentials({ ...credentials, name: e.target.value })}
                        type="text"
                        placeholder="Enter Name"
                        className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconUser fill={true} />
                    </span>
                </div>
            </div>

            <div>
                <label htmlFor="Email">Email</label>
                <div className="relative text-white-dark">
                    <input
                        id="Email"
                        required
                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                        type="email"
                        placeholder="Enter Email"
                        className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconMail fill={true} />
                    </span>
                </div>
            </div>

            <div>
                <label htmlFor="Password">Password</label>
                <div className="relative text-white-dark">
                    <input
                        id="Password"
                        required
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        type="password"
                        placeholder="Enter Password"
                        className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                </div>
            </div>

            <div>
                <label htmlFor="PasswordConfirm">Repeat Password</label>
                <div className="relative text-white-dark">
                    <input
                        id="PasswordConfirm"
                        required
                        onChange={(e) => setCredentials({ ...credentials, password_confirmation: e.target.value })}
                        type="password"
                        placeholder="Repeat Password"
                        className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                {isLoading ? 'Signing up...' : 'Sign Up'}
            </button>
        </form>
    );
};

export default ComponentsAuthRegisterForm;
