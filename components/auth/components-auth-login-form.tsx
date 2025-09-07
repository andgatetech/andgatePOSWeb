'use client';

import { FormEvent, useState } from 'react';
import { useLoginMutation } from '@/store/features/auth/authApi';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';

import IconLockDots from '@/components/icon/icon-lock-dots';
import IconMail from '@/components/icon/icon-mail';
import { RootState } from '@/store';
import { login } from '@/store/features/auth/authSlice'; // ✅ import login action

const ComponentsAuthLoginForm = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const [loginApi, { isLoading }] = useLoginMutation();

    const [credentials, setCredentials] = useState<{ email: string; password: string }>({
        email: '',
        password: '',
    });

    const submitForm = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const result = await loginApi(credentials).unwrap();
            console.log(result);

            // ✅ Set token in cookie (instead of localStorage)
            document.cookie = `token=${result.token}; path=/; max-age=${60 * 60 * 24};`;
            document.cookie = `role=${result.user.role}; path=/; max-age=${60 * 60 * 24};`;

            // ✅ Optional: Save user in Redux
            dispatch(login({ user: result.user, token: result.token }));

            // ✅ Show success toast
            toast.success('Login successful! Redirecting to dashboard...');

            // ✅ Redirect
            setTimeout(() => {
                router.push('/dashboard');
            }, 30);
        } catch (error: any) {
            console.error('Login failed:', error);
            toast.error(error?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
            <div>
                <label htmlFor="Email">Email</label>
                <div className="relative text-white-dark">
                    <input
                        id="Email"
                        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                        type="email"
                        placeholder="Enter Email"
                        className="form-input ps-10 placeholder:text-white-dark"
                        value={credentials.email}
                        required
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
                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                        type="password"
                        placeholder="Enter Password"
                        className="form-input ps-10 placeholder:text-white-dark"
                        value={credentials.password}
                        required
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                </div>
            </div>

            <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
        </form>
    );
};

export default ComponentsAuthLoginForm;
