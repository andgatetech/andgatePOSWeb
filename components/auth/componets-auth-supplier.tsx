'use client';

import { useLoginMutation } from '@/store/features/auth/authApi';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import IconLockDots from '@/components/icon/icon-lock-dots';
import IconMail from '@/components/icon/icon-mail';
import { RootState } from '@/store';
import { login } from '@/store/features/auth/authSlice'; // ✅ import login action

const SupplierLoginForm = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const [loginApi, { isLoading }] = useLoginMutation();

    const [credentials, setCredentials] = useState<{ email: string; password: string }>({
        email: 'dr@gmail.com',
        password: 'secret123',
    });

    const submitForm = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const result = await loginApi(credentials).unwrap();
            console.log(result);

            const { user, token, permissions } = result.data || result;

            const maxAge = 60 * 60 * 24;
            const encodedPermissions = (() => {
                try {
                    return btoa(JSON.stringify(permissions ?? []));
                } catch (err) {
                    console.error('Failed to encode permissions cookie', err);
                    return btoa('[]');
                }
            })();

            // ✅ Set token in cookie (instead of localStorage)
            document.cookie = `token=${token}; path=/; max-age=${maxAge}; Secure; SameSite=Strict`;
            document.cookie = `role=${user.role}; path=/; max-age=${maxAge}; Secure; SameSite=Strict`;
            document.cookie = `permissions=${encodedPermissions}; path=/; max-age=${maxAge}; Secure; SameSite=Strict`;

            // ✅ Save user + permissions in Redux
            dispatch(login({ user, token, permissions }));

            // ✅ Show success toast
            toast.success('Login successful! Redirecting to dashboard...');

            // ✅ Redirect
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);
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

export default SupplierLoginForm;
