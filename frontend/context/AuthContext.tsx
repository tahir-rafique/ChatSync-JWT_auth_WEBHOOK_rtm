"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiRequest } from "@/lib/api";

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    isOnline: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/otp", "/new-password"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const refreshUser = useCallback(async () => {
        try {
            const response = await apiRequest("/auth/me");
            setUser(response.data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    // Handle Redirection based on Auth State
    useEffect(() => {
        if (loading) return;

        const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

        if (!user && !isAuthPath) {
            router.push("/login");
        } else if (user && isAuthPath) {
            router.push("/");
        }
    }, [user, loading, pathname, router]);

    const login = async (credentials: any) => {
        setLoading(true);
        try {
            const response = await apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify(credentials),
            });
            setUser(response.data.user);
            router.push("/");
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData: any) => {
        setLoading(true);
        try {
            const response = await apiRequest("/auth/register", {
                method: "POST",
                body: JSON.stringify(userData),
            });
            setUser(response.data.user);
            router.push("/");
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await apiRequest("/auth/logout", { method: "POST" });
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            setUser(null);
            router.push("/login");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#0f0c29]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center animate-pulse shadow-2xl shadow-violet-500/40">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping opacity-20" />
                    </div>
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl font-bold text-white tracking-widest uppercase">ChatSync</h2>
                        <div className="mt-2 flex gap-1.5">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-1.5 w-1.5 rounded-full bg-violet-400/50 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
