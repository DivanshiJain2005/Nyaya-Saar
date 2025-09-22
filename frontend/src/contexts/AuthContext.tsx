import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "lawyer" | "judge" | "admin";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "user" | "lawyer" | "judge";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("legalai_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("legalai_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual authentication
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Demo users for testing
      const demoUsers: Record<string, { password: string; user: User }> = {
        "demo@nyayasaar.com": {
          password: "demo123",
          user: {
            id: "1",
            email: "demo@nyayasaar.com",
            name: "Demo User",
            role: "user",
            avatar: `https://ui-avatars.com/api/?name=Demo+User&background=C89B00&color=fff`,
          },
        },
        "lawyer@nyayasaar.com": {
          password: "lawyer123",
          user: {
            id: "2",
            email: "lawyer@nyayasaar.com",
            name: "Legal Expert",
            role: "lawyer",
            avatar: `https://ui-avatars.com/api/?name=Legal+Expert&background=C89B00&color=fff`,
          },
        },
        "judge@nyayasaar.com": {
          password: "judge123",
          user: {
            id: "3",
            email: "judge@nyayasaar.com",
            name: "Judge Smith",
            role: "judge",
            avatar: `https://ui-avatars.com/api/?name=Judge+Smith&background=C89B00&color=fff`,
          },
        },
      };

      // Check if it's a demo user
      if (demoUsers[email] && demoUsers[email].password === password) {
        setUser(demoUsers[email].user);
        localStorage.setItem(
          "legalai_user",
          JSON.stringify(demoUsers[email].user)
        );
      } else {
        // For any other email/password combination, create a generic user
        const mockUser: User = {
          id: Date.now().toString(),
          email,
          name: email.split("@")[0],
          role: "user",
          avatar: `https://ui-avatars.com/api/?name=${
            email.split("@")[0]
          }&background=C89B00&color=fff`,
        };

        setUser(mockUser);
        localStorage.setItem("legalai_user", JSON.stringify(mockUser));
      }
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual registration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user data - replace with actual API response
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        avatar: `https://ui-avatars.com/api/?name=${userData.name}&background=C89B00&color=fff`,
      };

      setUser(newUser);
      localStorage.setItem("legalai_user", JSON.stringify(newUser));
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("legalai_user");
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Simulate API call - replace with actual update
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("legalai_user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Profile update error:", error);
      throw new Error("Profile update failed");
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
