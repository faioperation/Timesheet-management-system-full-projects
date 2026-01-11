"use client";
import React, { useState } from 'react'

const Container = ({children,className}) => {
  const [fullview, setFullView] = useState(true)
  
  return (
    <div className={`max-w-[1264px] mx-auto px-4 sm:px-6 md:px-8 lg:px-4 ${className} `}>
        {children}
      
    </div>
  )
}

export default Container
