"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    sendResetEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => { },
    sendResetEmail: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        if (!auth) return;
        await signOut(auth);
    };

    const sendResetEmail = async (email: string) => {
        if (!auth) return;
        const { sendPasswordResetEmail } = await import("firebase/auth");
        await sendPasswordResetEmail(auth, email);
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, sendResetEmail }}>
            {children}
        </AuthContext.Provider>
    );
};
