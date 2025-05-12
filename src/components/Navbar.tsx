import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Home, ListCheck, Users, PlusCircle, CheckSquare } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, active, onClick }: NavItemProps) => {
  return (
    <Button
      variant={active ? "default" : "ghost"}
      className={`flex items-center justify-start gap-2 w-full ${
        active ? 'bg-gradient-main' : ''
      }`}
      onClick={onClick}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </Button>
  );
};

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [userType, setUserType] = useState<'teacher' | 'student' | null>(() => {
    return sessionStorage.getItem('userType') as 'teacher' | 'student' | null;
  });

  useEffect(() => {
    let newType: 'teacher' | 'student' | null = userType;

    if (location.pathname.includes('/teacher/')) {
      newType = 'teacher';
    } else if (location.pathname === '/') {
      newType = null;
    } else if (
      location.pathname === '/dashboard' ||
      location.pathname === '/tasks' ||
      location.pathname.startsWith('/task/') ||
      location.pathname === '/history'
    ) {
      newType = 'student';
    }
    // If on a shared path like /calendar, do NOT update newType (keep previous userType)

    // Only update userType if not on a shared route
    const isSharedRoute = location.pathname === '/calendar';
    if (!isSharedRoute && newType !== userType) {
      setUserType(newType);
      if (newType) {
        sessionStorage.setItem('userType', newType);
      } else {
        sessionStorage.removeItem('userType');
      }
    }
  }, [location.pathname, userType]);

  const isLoggedIn = location.pathname !== '/';
  const isTeacher = userType === 'teacher';

  if (!isLoggedIn) return null;

  const studentNavItems = [
    {
      icon: <Home size={20} />,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <FileText size={20} />,
      label: "Tasks",
      path: "/tasks",
    },
    {
      icon: <ListCheck size={20} />,
      label: "History",
      path: "/history",
    },
    {
      icon: <Calendar size={20} />,
      label: "Calendar",
      path: "/calendar",
    },
  ];

  const teacherNavItems = [
    {
      icon: <Home size={20} />,
      label: "Dashboard",
      path: "/teacher/dashboard",
    },
    {
      icon: <FileText size={20} />,
      label: "Manage Tasks",
      path: "/teacher/tasks",
    },
    {
      icon: <CheckSquare size={20} />,
      label: "Submissions",
      path: "/teacher/submissions",
    },
    {
      icon: <Calendar size={20} />,
      label: "Calendar",
      path: "/calendar",
    },
  ];

  const navItems = isTeacher ? teacherNavItems : studentNavItems;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:fixed md:top-0 md:left-0 md:h-screen md:w-20 lg:w-64 bg-white shadow-md z-10">
      <div className="flex justify-around md:flex-col md:justify-start md:gap-2 md:p-4">
        <div className="hidden md:block mb-8 mt-4">
          <div className="flex items-center gap-2 px-2">
            <div className="w-10 h-10 bg-gradient-main rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="hidden lg:inline font-bold text-xl bg-gradient-main bg-clip-text text-transparent">
              EduQuest
            </span>
          </div>
        </div>

        {navItems.map((item) => (
          <NavItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            path={item.path}
            active={location.pathname.startsWith(item.path)}
            onClick={() => navigate(item.path)}
          />
        ))}

        <div className="hidden md:block md:mt-auto">
          <Button
            variant="outline"
            className="w-full mt-10"
            onClick={() => navigate('/')}
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
