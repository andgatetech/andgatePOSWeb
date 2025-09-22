'use client';

import { useLoginMutation } from '@/store/features/auth/authApi';
import { useRouter } from 'next/navigation';
import { FormEvent, useState, useImperativeHandle, forwardRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from 'lucide-react';

import IconLockDots from '@/components/icon/icon-lock-dots';
import IconMail from '@/components/icon/icon-mail';
import { login } from '@/store/features/auth/authSlice';

const ComponentsAuthLoginForm = forwardRef((props, ref) => {
    const router = useRouter();
    const dispatch = useDispatch();
    
    const [loginApi, { isLoading }] = useLoginMutation();

    const [credentials, setCredentials] = useState<{ email: string; password: string }>({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    useImperativeHandle(ref, () => ({
        updateCredentials: (email: string, password: string) => {
            setCredentials({ email, password });
        },
    }));

    const togglePasswordVisibility = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowPassword(!showPassword);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials((prev) => ({ ...prev, email: e.target.value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials((prev) => ({ ...prev, password: e.target.value }));
    };

    const submitForm = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const result = await loginApi(credentials).unwrap();

            // API should return: { user: {...store, subscription_user}, token }
            const { user, token } = result.data;

            // Save token + role in cookies
            document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24}; Secure; SameSite=Strict`;
            document.cookie = `role=${user.role}; path=/; max-age=${60 * 60 * 24}; Secure; SameSite=Strict`;

            // Save **full user details** in Redux
            dispatch(login({ user, token }));

            toast.success('Login successful! Redirecting to dashboard...');
            router.push('/dashboard');
        } catch (error: any) {
            console.error('Login failed:', error);
            toast.error(error?.data || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
            <div>
                <label htmlFor="Email">Email</label>
                <div className="relative text-white-dark">
                    <input
                        id="Email"
                        value={credentials.email}
                        onChange={handleEmailChange}
                        type="email"
                        placeholder="Enter Email"
                        className="form-input ps-10 placeholder:text-white-dark"
                        required
                        autoComplete="email"
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
                        value={credentials.password}
                        onChange={handlePasswordChange}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter Password"
                        className="form-input pe-10 ps-10 placeholder:text-white-dark"
                        required
                        autoComplete="current-password"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute end-4 top-1/2 -translate-y-1/2 text-white-dark transition-colors duration-200 hover:text-primary focus:outline-none"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
        </form>
    );
});

ComponentsAuthLoginForm.displayName = 'ComponentsAuthLoginForm';
export default ComponentsAuthLoginForm;
