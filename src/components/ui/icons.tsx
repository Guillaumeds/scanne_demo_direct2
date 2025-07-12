import {
  // Core navigation and actions
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  Check,
  
  // Status and alerts
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Pause,
  Play,
  Square,
  
  // Main navigation icons
  BarChart3,
  Microscope,
  Calendar,
  MapPin,
  Settings,
  
  // Form and data
  FlaskConical,
  Wheat,
  Users,
  FileText,
  Paperclip,
  
  // Farm operations
  Tractor,
  Sprout,
  Droplets,
  Sun,
  CloudRain,
  Thermometer,
  Wind,
  Zap,
  Fuel,
  Wrench,
  Leaf,
  TreePine,
  Bug,
  Scissors,
  Shovel,
  Pickaxe,
  
  // Weather and environment
  Cloud,
  CloudSnow,
  Umbrella,
  Rainbow,
  
  // Data and analytics
  TrendingUp,
  TrendingDown,
  PieChart,
  LineChart,
  Target,
  DollarSign,
  Calculator,
  
  // Communication
  Share,
  Download,
  Upload,
  Mail,
  Phone,
  MessageSquare,
  
  // System and technical
  Database,
  Server,
  Wifi,
  WifiOff,
  RotateCcw,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  
  // User and permissions
  User,
  UserCheck,
  UserX,
  Shield,
  Lock,
  Unlock,
  
  // Layout and UI
  Menu,
  MoreHorizontal,
  MoreVertical,
  Grid,
  List,
  Maximize,
  Minimize,
  
  // Time management
  CalendarDays,
  CalendarCheck,
  CalendarX,
  Timer,
  
  // Quality control
  Award,
  Star,
  ThumbsUp,
  ThumbsDown,
  CheckSquare,
  
  // Location and mapping
  Map,
  Navigation,
  Compass,
  Route,
  
  // Files and documents
  File,
  FileImage,
  FileSpreadsheet,
  Folder,
  FolderOpen,
  
  // Notifications
  Bell,
  BellRing,
  BellOff,
} from 'lucide-react'

export const Icons = {
  // Core actions
  add: Plus,
  minus: Minus,
  edit: Edit,
  delete: Trash2,
  view: Eye,
  save: Save,
  close: X,
  confirm: Check,
  back: ArrowLeft,
  forward: ArrowRight,
  expand: ChevronRight,
  collapse: ChevronDown,
  
  // Status indicators
  pending: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
  alert: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  pause: Pause,
  play: Play,
  stop: Square,
  
  // Main navigation
  overview: BarChart3,
  observations: Microscope,
  calendar: Calendar,
  location: MapPin,
  settings: Settings,
  
  // Form sections
  products: FlaskConical,
  yield: Wheat,
  resources: Users,
  notes: FileText,
  attachments: Paperclip,
  
  // Farm operations
  equipment: Tractor,
  planting: Sprout,
  irrigation: Droplets,
  weather: Sun,
  rain: CloudRain,
  temperature: Thermometer,
  wind: Wind,
  power: Zap,
  fuel: Fuel,
  maintenance: Wrench,
  crop: Leaf,
  tree: TreePine,
  pest: Bug,
  harvest: Scissors,
  soil: Shovel,
  mining: Pickaxe,
  
  // Weather conditions
  cloudy: Cloud,
  snow: CloudSnow,
  umbrella: Umbrella,
  rainbow: Rainbow,
  
  // Data and analytics
  trending_up: TrendingUp,
  trending_down: TrendingDown,
  pie_chart: PieChart,
  line_chart: LineChart,
  target: Target,
  currency: DollarSign,
  calculator: Calculator,
  
  // Communication
  share: Share,
  download: Download,
  upload: Upload,
  email: Mail,
  phone: Phone,
  message: MessageSquare,
  
  // System
  database: Database,
  server: Server,
  online: Wifi,
  offline: WifiOff,
  refresh: RotateCcw,
  search: Search,
  filter: Filter,
  sort_asc: SortAsc,
  sort_desc: SortDesc,
  
  // Users and security
  user: User,
  user_verified: UserCheck,
  user_blocked: UserX,
  security: Shield,
  locked: Lock,
  unlocked: Unlock,
  
  // Layout
  menu: Menu,
  more_horizontal: MoreHorizontal,
  more_vertical: MoreVertical,
  grid: Grid,
  list: List,
  maximize: Maximize,
  minimize: Minimize,
  
  // Time management
  calendar_days: CalendarDays,
  calendar_check: CalendarCheck,
  calendar_cancel: CalendarX,
  timer: Timer,
  stopwatch: Clock,
  
  // Quality control
  award: Award,
  star: Star,
  thumbs_up: ThumbsUp,
  thumbs_down: ThumbsDown,
  checkbox: CheckSquare,
  
  // Location and mapping
  map: Map,
  navigation: Navigation,
  compass: Compass,
  route: Route,
  
  // Files and documents
  file: File,
  image: FileImage,
  pdf: FileText,
  spreadsheet: FileSpreadsheet,
  folder: Folder,
  folder_open: FolderOpen,
  
  // Notifications
  notification: Bell,
  notification_active: BellRing,
  notification_off: BellOff,
} as const

export type IconName = keyof typeof Icons
