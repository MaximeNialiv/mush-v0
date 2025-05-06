import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getFaIconName } from '@/utils/font-awesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

// Définition des props pour le composant Icon
interface IconProps {
  // Nom de l'icône (peut être un nom Lucide React ou directement un nom Font Awesome)
  icon: string;
  // Classes CSS additionnelles
  className?: string;
  // Taille de l'icône (sera convertie en classes Tailwind)
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  // Autres props à passer au composant FontAwesomeIcon
  [key: string]: any;
}

// Mapping des tailles vers des classes Tailwind
const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
  xl: 'h-8 w-8',
  '2xl': 'h-10 w-10',
};

/**
 * Composant Icon - Wrapper pour FontAwesomeIcon
 * 
 * Permet d'utiliser les icônes Font Awesome avec une API similaire à celle de Lucide React
 * pour faciliter la migration et maintenir la compatibilité avec le code existant.
 */
export function Icon({ icon, className = '', size = 'md', ...props }: IconProps) {
  // Obtenir le nom d'icône Font Awesome équivalent
  const faIconName = getFaIconName(icon);
  
  // Déterminer les classes CSS en fonction de la taille
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <FontAwesomeIcon
      icon={faIconName as IconProp}
      className={`${sizeClass} ${className}`}
      {...props}
    />
  );
}

/**
 * HOC pour créer des composants d'icônes spécifiques
 * 
 * Cela permet de créer des composants qui peuvent être utilisés comme des composants Lucide React
 * Exemple: <HomeIcon className="h-6 w-6" />
 */
export function createIconComponent(iconName: string) {
  return function IconComponent({ className = '', ...props }: Omit<IconProps, 'icon'>) {
    return <Icon icon={iconName} className={className} {...props} />;
  };
}

// Exporter les composants d'icônes couramment utilisés
export const HomeIcon = createIconComponent('Home');
export const BellIcon = createIconComponent('Bell');
export const MailIcon = createIconComponent('Mail');
export const UserIcon = createIconComponent('User');
export const SearchIcon = createIconComponent('Search');
export const BookmarkIcon = createIconComponent('BookmarkIcon');
export const MoreHorizontalIcon = createIconComponent('MoreHorizontal');
export const PenSquareIcon = createIconComponent('PenSquare');
export const VideoIcon = createIconComponent('Video');
export const MessageSquareIcon = createIconComponent('MessageSquare');
export const MenuIcon = createIconComponent('Menu');
export const TreesIcon = createIconComponent('TreesIcon');
export const HeartIcon = createIconComponent('Heart');
export const MessageCircleIcon = createIconComponent('MessageCircle');
export const RepeatIcon = createIconComponent('Repeat');
export const ShareIcon = createIconComponent('Share');
export const Loader2Icon = createIconComponent('Loader2');
export const LogOutIcon = createIconComponent('LogOut');
export const GridIcon = createIconComponent('Grid');
export const ListIcon = createIconComponent('List');
export const CheckIcon = createIconComponent('Check');
export const XIcon = createIconComponent('X');
export const AlertCircleIcon = createIconComponent('AlertCircle');
export const ChevronRightIcon = createIconComponent('ChevronRight');
export const EyeIcon = createIconComponent('Eye');
export const EyeOffIcon = createIconComponent('EyeOff');
export const SendIcon = createIconComponent('Send');
export const ImageIcon = createIconComponent('Image');
export const MapPinIcon = createIconComponent('MapPin');
export const SmileIcon = createIconComponent('Smile');
export const CalendarIcon = createIconComponent('Calendar');
export const MoreVerticalIcon = createIconComponent('MoreVertical');
export const FolderIcon = createIconComponent('Folder');
export const TrashIcon = createIconComponent('Trash');
export const EditIcon = createIconComponent('Edit');
export const HelpCircleIcon = createIconComponent('HelpCircle');
export const TrophyIcon = createIconComponent('Trophy');
export const MusicIcon = createIconComponent('Music');
export const NewspaperIcon = createIconComponent('Newspaper');
export const FileTextIcon = createIconComponent('FileText');
export const ChevronDownIcon = createIconComponent('ChevronDown');
export const ChevronUpIcon = createIconComponent('ChevronUp');
export const CircleIcon = createIconComponent('Circle');
export const PanelLeftIcon = createIconComponent('PanelLeft');
export const GripVerticalIcon = createIconComponent('GripVertical');
export const DotIcon = createIconComponent('Dot');
export const ChevronLeftIcon = createIconComponent('ChevronLeft');
export const DatabaseIcon = createIconComponent('Database');
