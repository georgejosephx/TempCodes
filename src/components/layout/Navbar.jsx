import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Menu, Pill, LogOut, User } from 'lucide-react';

export default function Navbar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </Button>
            <div className="flex items-center ml-2 md:mr-24">
              <Pill className="h-8 w-8 text-primary mr-3" />
              <span className="self-center text-xl font-semibold whitespace-nowrap">
                MedInventory
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs text-gray-500">{user?.role}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}