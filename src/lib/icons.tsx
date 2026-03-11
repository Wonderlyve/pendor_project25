// Centralized icon mapping: Typicons (react-icons/ti) re-exported with Lucide-compatible names
// This allows easy project-wide icon library switching

import {
  TiHeart,
  TiHeartOutline,
  TiStar,
  TiStarOutline,
  TiStarFullOutline,
  TiThMenu,
  TiMediaPlay,
  TiVolumeMute,
  TiVolumeUp,
  TiMediaPause,
  TiArrowMaximise,
  TiArrowMinimise,
  TiEdit,
  TiTrash,
  TiMessage,
  TiArrowForward,
  TiEye,
  TiZoom,
  TiUser,
  TiFilter,
  TiTimes,
  TiBell,
  TiHome,
  TiVideo,
  TiPlus,
  TiStarburstOutline,
  TiArrowLeft,
  TiCamera,
  TiCog,
  TiChartBar,
  TiGroup,
  TiShoppingCart,
  TiTime,
  TiUserAdd,
  TiUserDelete,
  TiCalendar,
  TiChartLine,
  TiLockClosed,
  TiLocationArrow,
  TiAttachment,
  TiImage,
  TiNotes,
  TiMicrophone,
  TiPencil,
  TiTick,
  TiDownload,
  TiUpload,
  TiMail,
  TiPhone,
  TiPower,
  TiBookmark,
  TiInfoLarge,
  TiDevicePhone,
  TiGlobe,
  TiWeatherNight,
  TiWeatherSunny,
  TiRefresh,
  TiFlag,
  TiDocument,
  TiExport,
  TiArrowBack,
  TiLocation,
  TiCompass,
  TiLink,
  TiArrowRight,
  TiArrowUp,
  TiMinus,
  TiKey,
  TiDocumentText,
  TiNews,
  TiVolumeDown,
  TiPin,
  TiWorld,
} from 'react-icons/ti';

import React from 'react';
import type { IconBaseProps } from 'react-icons';

// Direct re-exports with Lucide-compatible names
export const Heart = TiHeart;
export const Star = TiStar;
export const MoreVertical = TiThMenu;
export const Play = TiMediaPlay;
export const VolumeX = TiVolumeMute;
export const Volume2 = TiVolumeUp;
export const Pause = TiMediaPause;
export const Maximize = TiArrowMaximise;
export const Minimize = TiArrowMinimise;
export const Edit = TiEdit;
export const Edit2 = TiPencil;
export const Trash2 = TiTrash;
export const MessageCircle = TiMessage;
export const ArrowUpRight = TiArrowForward;
export const Eye = TiEye;
export const Menu = TiThMenu;
export const Search = TiZoom;
export const User = TiUser;
export const Filter = TiFilter;
export const X = TiTimes;
export const Bell = TiBell;
export const Home = TiHome;
export const Video = TiVideo;
export const Plus = TiPlus;
export const Crown = TiStarburstOutline;
export const ArrowLeft = TiArrowLeft;
export const ArrowRight = TiArrowRight;
export const ArrowUp = TiArrowUp;
export const Camera = TiCamera;
export const Settings = TiCog;
export const BarChart3 = TiChartBar;
export const Trophy = TiStarFullOutline;
export const Users = TiGroup;
export const Car = TiLocationArrow;
export const ShoppingCart = TiShoppingCart;
export const History = TiTime;
export const UserPlus = TiUserAdd;
export const UserMinus = TiUserDelete;
export const Calendar = TiCalendar;
export const TrendingUp = TiChartLine;
export const Lock = TiLockClosed;
export const Send = TiLocationArrow;
export const Paperclip = TiAttachment;
export const Image = TiImage;
export const Music = TiNotes;
export const Mic = TiMicrophone;
export const Check = TiTick;
export const Download = TiDownload;
export const Upload = TiUpload;
export const Mail = TiMail;
export const Phone = TiPhone;
export const LogOut = TiPower;
export const Bookmark = TiBookmark;
export const Shield = TiLockClosed;
export const Info = TiInfoLarge;
export const Smartphone = TiDevicePhone;
export const Globe = TiGlobe;
export const Moon = TiWeatherNight;
export const Sun = TiWeatherSunny;
export const Flag = TiFlag;
export const MoreHorizontal = TiThMenu;
export const FileText = TiDocument;
export const Share = TiExport;
export const Reply = TiArrowBack;
export const MapPin = TiLocation;
export const Link = TiLink;
export const Clock = TiTime;
export const Minus = TiMinus;
export const Key = TiKey;
export const File = TiDocument;
export const Pin = TiPin;

// Icons that need custom wrappers (no exact Typicons equivalent)
// Smile: use a simple emoji-style icon
export const Smile = (props: IconBaseProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

// EyeOff: Typicons doesn't have this, create simple wrapper  
export const EyeOff = (props: IconBaseProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// BellOff: simple bell with slash
export const BellOff = (props: IconBaseProps) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    <path d="M18.63 13A17.89 17.89 0 0 1 18 8" />
    <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14" />
    <path d="M18 8a6 6 0 0 0-9.33-5" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// HelpCircle: use info icon
export const HelpCircle = TiInfoLarge;

// Loader2: spinning refresh icon
export const Loader2 = TiRefresh;

// Navigation icon (compass)
export { TiCompass as NavigationIcon } from 'react-icons/ti';
