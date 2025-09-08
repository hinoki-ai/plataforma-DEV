'use client';

import {
  HomeIcon,
  BookOpenIcon,
  UsersIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BellIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  AcademicCapIcon,
  BuildingOffice2Icon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  FolderIcon,
  LinkIcon,
  PhotoIcon,
  VideoCameraIcon,
  PaperClipIcon,
  ShareIcon,
  HeartIcon,
  StarIcon,
  BookmarkIcon,
  ArchiveBoxIcon,
  ArrowDownTrayIcon,
  EyeSlashIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  KeyIcon,
  HandThumbUpIcon,
  ServerStackIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  // HomeIcon as SolidHomeIcon,
  // BookOpenIcon as SolidBookOpenIcon,
  // UsersIcon as SolidUsersIcon,
  // CalendarDaysIcon as SolidCalendarDaysIcon,
  // Cog6ToothIcon as SolidCog6ToothIcon,
  // ChartBarIcon as SolidChartBarIcon,
  // DocumentTextIcon as SolidDocumentTextIcon,
  // BellIcon as SolidBellIcon,
  // UserIcon as SolidUserIcon,
} from '@heroicons/react/24/outline';

import {
  HomeIcon as SolidHomeIconFilled,
  BookOpenIcon as SolidBookOpenIconFilled,
  UsersIcon as SolidUsersIconFilled,
  CalendarDaysIcon as SolidCalendarDaysIconFilled,
  Cog6ToothIcon as SolidCog6ToothIconFilled,
  ChartBarIcon as SolidChartBarIconFilled,
  DocumentTextIcon as SolidDocumentTextIconFilled,
  BellIcon as SolidBellIconFilled,
  UserIcon as SolidUserIconFilled,
  CheckCircleIcon as SolidCheckCircleIconFilled,
  XCircleIcon as SolidXCircleIconFilled,
  QuestionMarkCircleIcon as SolidQuestionMarkCircleIconFilled,
  ExclamationTriangleIcon as SolidExclamationTriangleIconFilled,
  InformationCircleIcon as SolidInformationCircleIconFilled,
} from '@heroicons/react/24/solid';

// Navigation icons
export const NavigationIcons = {
  Home: HomeIcon,
  Planning: BookOpenIcon,
  Team: UsersIcon,
  Calendar: CalendarDaysIcon,
  Settings: Cog6ToothIcon,
  Analytics: ChartBarIcon,
  Documents: DocumentTextIcon,
  Notifications: BellIcon,
  Profile: UserIcon,
  Meeting: UsersIcon,
  Vote: HandThumbUpIcon,
  Menu: Bars3Icon,
  Close: XMarkIcon,
  ChevronLeft: ChevronLeftIcon,
  ChevronRight: ChevronRightIcon,
  ChevronDown: ChevronDownIcon,
  ChevronUp: ChevronUpIcon,
  ArrowPath: ArrowPathIcon,
  ServerStack: ServerStackIcon,
} as const;

// Action icons
export const ActionIcons = {
  Add: PlusIcon,
  Edit: PencilIcon,
  Delete: TrashIcon,
  View: EyeIcon,
  Upload: ArrowUpTrayIcon,
  Download: ArrowDownTrayIcon,
  Search: MagnifyingGlassIcon,
  Refresh: ArrowPathIcon,
  Check: CheckIcon,
  Warning: ExclamationTriangleIcon,
  Info: InformationCircleIcon,
} as const;

// Theme icons
export const ThemeIcons = {
  Sun: SunIcon,
  Moon: MoonIcon,
  Desktop: ComputerDesktopIcon,
  Logout: ArrowLeftOnRectangleIcon,
} as const;

// Contact icons
export const ContactIcons = {
  Phone: PhoneIcon,
  Email: EnvelopeIcon,
  Location: MapPinIcon,
  Clock: ClockIcon,
} as const;

// File icons
export const FileIcons = {
  Document: DocumentTextIcon,
  Folder: FolderIcon,
  Image: PhotoIcon,
  Video: VideoCameraIcon,
  Link: LinkIcon,
  Attachment: PaperClipIcon,
  Archive: ArchiveBoxIcon,
} as const;

// Social icons
export const SocialIcons = {
  Share: ShareIcon,
  Like: HeartIcon,
  Star: StarIcon,
  Bookmark: BookmarkIcon,
} as const;

// Security icons
export const SecurityIcons = {
  Lock: LockClosedIcon,
  Shield: ShieldCheckIcon,
  Key: KeyIcon,
  Hide: EyeSlashIcon,
} as const;

// Solid icons for active states
export const SolidIcons = {
  Home: SolidHomeIconFilled,
  Planning: SolidBookOpenIconFilled,
  Team: SolidUsersIconFilled,
  Calendar: SolidCalendarDaysIconFilled,
  Settings: SolidCog6ToothIconFilled,
  Analytics: SolidChartBarIconFilled,
  Documents: SolidDocumentTextIconFilled,
  Notifications: SolidBellIconFilled,
  Profile: SolidUserIconFilled,
  CheckCircle: SolidCheckCircleIconFilled,
  XCircle: SolidXCircleIconFilled,
  QuestionMarkCircle: SolidQuestionMarkCircleIconFilled,
  ExclamationTriangle: SolidExclamationTriangleIconFilled,
  Users: SolidUsersIconFilled,
  InformationCircle: SolidInformationCircleIconFilled,
} as const;

// School-specific icons
export const SchoolIcons = {
  School: AcademicCapIcon,
  Building: BuildingOffice2Icon,
  Teacher: UserCircleIcon,
  Student: UsersIcon,
  Class: AcademicCapIcon,
  Schedule: CalendarDaysIcon,
  Grade: StarIcon,
  Report: DocumentTextIcon,
} as const;

// Type exports
export type IconName = keyof typeof NavigationIcons;
export type ActionIconName = keyof typeof ActionIcons;
export type ThemeIconName = keyof typeof ThemeIcons;
export type SchoolIconName = keyof typeof SchoolIcons;
