import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LayoutDashboard, Pill, Package, FileText, Activity, Users, X } from 'lucide-react';
import { Button } from '../ui/button';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user } = useContext(AuthContext);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
    { name: 'Medicines', href: '/medicines', icon: Pill, roles: ['ADMIN', 'PHARMACIST'] },
    { name: 'Inventory', href: '/inventory', icon: Package, roles: ['ADMIN', 'PHARMACIST', 'STAFF'] },
    { name: 'Reports', href: '/reports', icon: FileText, roles: ['ADMIN'] },
    { name: 'Audit Logs', href: '/audit', icon: Activity, roles: ['ADMIN', 'PHARMACIST'] },
    { name: 'Users', href: '/users', icon: Users, roles: ['ADMIN'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-gray-200 lg:translate-x-0`}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </Button>
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            {filteredNavigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center p-2 rounded-lg hover:bg-gray-100 group ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-gray-900'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="ml-3">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}