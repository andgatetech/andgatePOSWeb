'use client';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconMail from '@/components/icon/icon-mail';
import IconPhone from '@/components/icon/icon-phone';
import IconUser from '@/components/icon/icon-user';
import IconXCircle from '@/components/icon/icon-x-circle';
import { useRegisterMutation } from '@/store/features/auth/authApi';
import { useRegisterSupplierMutation } from '@/store/features/supplier/supplierApi';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { login } from '@/store/features/auth/authSlice';

const SupplierRegisterForm = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const [registerSupplier, { isLoading }] = useRegisterSupplierMutation();
    const [credentials, setCredentials] = useState<{ email: string; password: string; name: string; password_confirmation: string; phone: string; address: string }>({
        email: '',
        password: '',
        name: '',
        password_confirmation: '',
        phone: '',
        address: '',
    });
    const submitForm = async (e: FormEvent) => {
        e.preventDefault();
        try {
            const result = await registerSupplier(credentials).unwrap();
            dispatch(login({ user: result.user, token: result.token }));
            console.log('Registration successful:', result);
        } catch (error) {
            console.error('Registration failed:', error);
        }
    };
    return (
        <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
            <div>
                <label htmlFor="Name">Name</label>
                <div className="relative text-white-dark">
                    <input
                        id="Name"
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
                <label htmlFor="Phone">Phone</label>
                <div className="relative text-white-dark">
                    <input
                        id="Phone"
                        onChange={(e) => setCredentials({ ...credentials, phone: e.target.value })}
                        type="text"
                        placeholder="Enter Phone"
                        className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconPhone fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label htmlFor="Address">Address</label>
                <div className="relative text-white-dark">
                    <input
                        id="Address"
                        onChange={(e) => setCredentials({ ...credentials, address: e.target.value })}
                        type="text"
                        placeholder="Enter Address"
                        className="form-input ps-10 placeholder:text-white-dark"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconXCircle fill={true} />
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
            <div>
                <label htmlFor="Password">Repeat Password</label>
                <div className="relative text-white-dark">
                    <input
                        id="Password"
                        onChange={(e) => setCredentials({ ...credentials, password_confirmation: e.target.value })}
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
                Sign Up
            </button>
        </form>
    );
};

export default SupplierRegisterForm;
