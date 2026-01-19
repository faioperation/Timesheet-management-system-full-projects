import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { HiMenuAlt3 } from 'react-icons/hi';
import { apiFetch, API_BASE_URL, Image_BASE_URL  } from '../libs/apiFetch';

function Navbar({ onMenuClick }) {
  const location = useLocation();
  const pathName = location.pathname;
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [profileImage, setProfileImage] = useState('/assets/profilePlaceholder.png');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await apiFetch("/profile", {
          method: "GET",
        });        

        const result = await response.json();


        if (result.success && result.data) {
          const data = result.data;

          if (data.name) {
            setUserName(data.name);
          }
          if (data.email) {
            setUserEmail(data.email);
          }

          if (data.image) {
            let imageUrl = Image_BASE_URL + data.image;
            
            setProfileImage(imageUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfileData();
  }, []);

  return (
    <div className='bg-white shadow w-full h-full text-black py-3 sm:py-4 lg:py-6 px-4 sm:px-6 lg:px-12 gap-4 sm:gap-6 lg:gap-12 flex justify-center items-center z-30'>
        {/* Mobile menu button */}
        <button 
          onClick={onMenuClick}
          className='lg:hidden w-10 h-10 flex items-center justify-center text-2xl text-black hover:bg-gray-100 rounded-md transition-colors'
          aria-label="Toggle menu"
        >
          <HiMenuAlt3 />
        </button>

        <div className='w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] lg:w-[48px] lg:h-[48px] flex-shrink-0'>
          <img className='w-full h-full lg:scale-150' src={'/assets/Logo.png'} alt={'Company Logo'} />
        </div>
        <div className='flex-1 min-w-0'>
          <h3 className='truncate'>
            <span className='font-semibold text-xl sm:text-2xl lg:text-3xl'>Overview</span>
            <span className='text-sm sm:text-base lg:text-lg ml-2 text-gray-600 hidden sm:inline'>{pathName}</span>
          </h3>
        </div>
        <div className='flex-shrink-0'>
          <div className='flex items-center gap-2 sm:gap-3'>
            <div className='text-right hidden sm:block'>
              <h3 className='text-base sm:text-lg lg:text-[20px] font-bold truncate max-w-[150px] lg:max-w-none'>{userName}</h3>
              <p className='text-xs sm:text-sm lg:text-base text-[#736E6E] truncate max-w-[150px] lg:max-w-none'>{userEmail}</p>
            </div>
            <div className='w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] lg:w-[48px] lg:h-[48px]'>
              <img 
                className='w-full h-full rounded-full object-cover' 
                src={profileImage} 
                alt={'Profile Image'}
                onError={(e) => {
                  if (e.target.src !== '/assets/profilePlaceholder.png') {
                    e.target.src = '/assets/profilePlaceholder.png';
                  }
                }}
              />
            </div>
          </div>
        </div>
    </div>
  )
}

export default Navbar
