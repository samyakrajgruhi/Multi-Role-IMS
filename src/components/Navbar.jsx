import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <img 
              src="/SFA-updateLogo.png" 
              alt="SFA Logo" 
              className="w-8 h-8 sm:w-12 sm:h-12 object-contain flex-shrink-0"
            />
            <span className="text-lg sm:text-xl font-bold text-foreground">SFA</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link to="/lobby-data" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Lobby Data
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/user-info" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  User Info
                </Link>
                <Link to="/payment" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  Payment
                </Link>
                <Link to="/transactions" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                  Transactions
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="md:hidden p-2 text-muted-foreground hover:text-primary rounded-md transition-colors">
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link to="/" className="text-muted-foreground hover:text-primary transition-colors font-medium py-2 px-4 hover:bg-muted rounded-md">
                    Home
                  </Link>
                  <Link to="/lobby-data" className="text-muted-foreground hover:text-primary transition-colors font-medium py-2 px-4 hover:bg-muted rounded-md">
                    Lobby Data
                  </Link>
                  {isAuthenticated ? (
                    <>
                      <Link to="/user-info" className="text-muted-foreground hover:text-primary transition-colors font-medium py-2 px-4 hover:bg-muted rounded-md">
                        User Info
                      </Link>
                      <Link to="/payment" className="text-muted-foreground hover:text-primary transition-colors font-medium py-2 px-4 hover:bg-muted rounded-md">
                        Payment
                      </Link>
                      <Link to="/transactions" className="text-muted-foreground hover:text-primary transition-colors font-medium py-2 px-4 hover:bg-muted rounded-md">
                        Transactions
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="text-muted-foreground hover:text-primary transition-colors font-medium py-2 px-4 hover:bg-muted rounded-md">
                          Admin
                        </Link>
                      )}
                    </>
                  ) : (
                    <Link to="/login" className="text-muted-foreground hover:text-primary transition-colors font-medium py-2 px-4 hover:bg-muted rounded-md">
                      Login
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* User Profile */}
            {isAuthenticated && (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-3 p-2 hover:bg-muted rounded-md transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;