'use client';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
export default function ThemeToggle() {
 const [dark,setDark]=useState(true);
 useEffect(()=>{const saved=localStorage.getItem('hades-theme');const value=saved?saved==='dark':true;setDark(value);document.documentElement.dataset.theme=value?'dark':'light';},[]);
 function toggle(){const value=!dark;setDark(value);document.documentElement.dataset.theme=value?'dark':'light';localStorage.setItem('hades-theme',value?'dark':'light');}
 return <button className="icon-button" aria-label="Toggle color theme" onClick={toggle}>{dark?<Sun size={17}/>:<Moon size={17}/>}</button>;
}