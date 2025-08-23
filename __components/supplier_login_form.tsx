'use client';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconMail from '@/components/icon/icon-mail';
import { login } from '@/store/features/auth/authSlice';
import { useLoginSupplierMutation } from '@/store/features/supplier/supplierApi';
import { supplierLogin } from '@/store/features/supplier/supplierSlice';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const SupplierLoginForm = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const [loginSupplier, { isLoading }] = useLoginSupplierMutation();
    const [credentials, setCredentials] = useState<{ email: string; password: string }>({ email: '', password: '' });
    const submitForm = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const result = await loginSupplier(credentials).unwrap();
            document.cookie = `token=${result.token}; path=/; max-age=${60 * 60 * 24};`;
            // dispatch(supplierLogin({ user: result.data, token: result.token }));
            dispatch(login({ token: result.token }));
            console.log('Logging in with credentials:', result);
            dispatch(supplierLogin({ user: result.data }));
            toast.success('Login successful! Redirecting to dashboard...');
            router.push('/dashboard');
            console.log('Login successful:', result);
        } catch (error) {
            console.error('Login failed:', error);
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
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                </div>
            </div>
            <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                Sign in
            </button>
        </form>
    );
};

export default SupplierLoginForm;
