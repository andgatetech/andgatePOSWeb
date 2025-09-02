'use client';

// import IconLockDots from '@/components/icon/icon-lock-dots';
// import IconMail from '@/components/icon/icon-mail';
// import IconUser from '@/components/icon/icon-user';

import { Building as IconBuilding, Eye as IconEye, EyeOff as IconEyeOff, Lock as IconLockDots, Mail as IconMail, Phone as IconPhone, User as IconUser } from 'lucide-react';

import { RootState } from '@/store';
import { useRegisterMutation } from '@/store/features/auth/authApi';
import { login } from '@/store/features/auth/authSlice';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const ComponentsAuthRegisterForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [registerApi, { isLoading }] = useRegisterMutation();

    const [credentials, setCredentials] = useState({
        store_name: '',
        name: '',
        phone: '',
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
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <IconUser size={18} />
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
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <IconMail size={18} />
                    </span>
                </div>
            </div>

            <div>
                <label htmlFor="Phone">Phone</label>
                <div className="relative text-white-dark">
                    <input
                        id="Phone"
                        onChange={(e) => setCredentials({ ...credentials, phone: e.target.value })}
                        type="tel"
                        placeholder="Enter Phone Number"
                        className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <IconPhone size={18} />
                    </span>
                </div>
            </div>

            <div>
                <label htmlFor="StoreName">Store Name</label>
                <div className="relative text-white-dark">
                    <input
                        id="StoreName"
                        required
                        onChange={(e) => setCredentials({ ...credentials, store_name: e.target.value })}
                        type="text"
                        placeholder="Enter Store Name"
                        className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <IconBuilding size={18} />
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
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter Password"
                        className="form-input pe-12 ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <IconLockDots size={18} />
                    </span>
                    <span
                        className="absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
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
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repeat Password"
                        className="form-input pe-12 ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <IconLockDots size={18} />
                    </span>
                    <span
                        className="absolute end-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
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
