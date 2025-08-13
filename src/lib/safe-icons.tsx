import React from 'react';

// Temporary icon components until we fix phosphor icons
const Icon = ({ size = 16, className = "" }: { size?: number; className?: string }) => {
  return React.createElement('div', {
    className: `inline-block border border-current rounded ${className}`,
    style: { width: size, height: size }
  });
};

const icons = {
  File: Icon,
  Square: Icon,
  List: Icon,
  Gear: Icon,
  Brain: Icon,
  Bell: Icon,
  User: Icon,
  Moon: Icon,
  Sun: Icon,
  House: Icon,
  Upload: Icon,
  Globe: Icon,
  Lightning: Icon,
  ArrowsIn: Icon,
  ChartBar: Icon,
  Share: Icon,
  Users: Icon,
  Copy: Icon,
  Download: Icon,
  UploadSimple: Icon,
  Circle: Icon,
  Heart: Icon,
  Eye: Icon,
  Settings: Icon,
  AlertCircle: Icon,
  Home: Icon
};

export const {
  File,
  Square,
  List,
  Gear,
  Brain,
  Bell,
  User,
  Moon,
  Sun,
  House,
  Upload,
  Globe,
  Lightning,
  ArrowsIn,
  ChartBar,
  Share,
  Users,
  Copy,
  Download,
  UploadSimple,
  Circle,
  Heart,
  Eye,
  Settings,
  AlertCircle,
  Home
} = icons;