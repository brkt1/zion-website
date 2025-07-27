import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuthStore } from '../../stores/authStore';
import { FiLogOut, FiUser, FiChevronDown } from 'react-icons/fi';
import { Menu, Transition } from '@headlessui/react';

const UserNav: React.FC = () => {
  const { user, session } = useAuthStore();
  const [buttonAvatarError, setButtonAvatarError] = useState(false);
  const [dropdownAvatarError, setDropdownAvatarError] = useState(false);

  if (!user) return null;

  // Get user details with proper fallbacks for Google images
  const getAvatarUrl = () => {
    // Check for Google avatar in different possible locations
    const googleAvatar = session?.user?.user_metadata?.picture || 
                        user.user_metadata?.picture ||
                        session?.user?.user_metadata?.avatar_url ||
                        user.user_metadata?.avatar_url;
    
    // If Google avatar exists, return it (ensure it's https)
    if (googleAvatar) {
      return googleAvatar.startsWith('http:') 
        ? googleAvatar.replace('http:', 'https:') 
        : googleAvatar;
    }
    
    return null;
  };

  const avatar = getAvatarUrl();
  const name = session?.user?.user_metadata?.full_name || 
               session?.user?.user_metadata?.name || 
               user.user_metadata?.full_name || 
               user.user_metadata?.name || 
               user.email?.split('@')[0];
  const email = user.email;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="w-full bg-black-primary border-yellow-500/20 px-6 py-3 flex items-center justify-between z-50 relative">
      {/* Logo */}
      
      <div className="flex items-center">
        {/* Navigate home */}
        <img 
          src="/zionlogo.png" 
          alt="Zion Logo" 
          className="h-10 w-10 mr-2 cursor-pointer"
          onClick={() => window.location.href = '/'}
        />
      
      </div>
      {/* Navigation links */}
     
      
      {/* User dropdown */}
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="group flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50 rounded-full">
          {avatar && !buttonAvatarError ? (

            <img 
              src={avatar} 
              alt="Profile" 
              className="w-9 h-9 rounded-full border-2 border-yellow-500/50 group-hover:border-yellow-400 transition-all object-cover"
              onError={() => setButtonAvatarError(true)}
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-black-primary border-2 border-yellow-500/50 flex items-center justify-center group-hover:border-yellow-400 transition-all">
              <FiUser className="text-yellow-400" size={16} />
            </div>
          )}
          
          <div className="text-right  md:block">
            <div className="text-yellow-400 font-medium text-sm">{name}</div>
            <div className="text-gray-300 text-xs opacity-80 truncate max-w-[160px]">{email}</div>
          </div>
          
          <FiChevronDown 
            className="ml-1 text-yellow-400/80 group-hover:text-yellow-300 transition-transform ui-open:rotate-180" 
            size={16} 
          />
        </Menu.Button>

        <Transition
          as={React.Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-black-ring-black-primary rounded-md bg-black-primary shadow-lg ring-1 ring-black-primary focus:outline-none">
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <div className={`px-4 py-3 ${active ? 'bg-black-primary' : ''}`}>
                    <div className="flex items-center gap-3">
                      {avatar && !dropdownAvatarError ? (
                        <img 
                          src={avatar} 
                          alt="Profile" 
                          className="w-8 h-8 rounded-full border border-yellow-500/50 object-cover"
                          onError={() => setDropdownAvatarError(true)}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-black-primary border border-yellow-500/50 flex items-center justify-center">
                          <FiUser className="text-yellow-400" size={14} />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-yellow-400">{name}</p>
                        <p className="text-xs text-gray-300 truncate">{email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Menu.Item>
            </div>
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleSignOut}
                    className={`${
                      active ? 'bg-black-ring-black-primary text-yellow-300' : 'text-yellow-400'
                    } group flex w-full items-center rounded-md px-4 py-2 text-sm gap-2 transition-colors`}
                  >
                    <FiLogOut size={14} />
                    Sign Out
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </nav>
  );
};

export default UserNav;