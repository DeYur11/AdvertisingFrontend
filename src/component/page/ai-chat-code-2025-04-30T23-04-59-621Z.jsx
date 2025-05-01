import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Divider,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Badge,
  Tooltip,
  AppBar,
  Toolbar,
  InputAdornment,
  Rating,
  Snackbar,
  Alert,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Slider,
  Switch,
  FormControlLabel,
  Backdrop,
  Fade,
  Popper,
  Grow,
  ClickAwayListener,
  MenuList,
  LinearProgress,
  Breadcrumbs,
  Link,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  RadioGroup,
  FormLabel,
  FormGroup,
  Checkbox,
  Autocomplete,
  Skeleton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Pagination,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  ButtonGroup,
  Fab,
  useMediaQuery,
  useTheme,
  alpha,
  Zoom,
  Slide, InputBase
} from '@mui/material';

import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import {
  ErrorSharp,
  Search,
  FilterList,
  Sort,
  CheckCircle,
  Cancel,
  Pending,
  Assignment,
  Description,
  Comment,
  ArrowBack,
  Send,
  AttachFile,
  ThumbUp,
  ThumbDown,
  Info,
  Person,
  Logout,
  Notifications,
  DarkMode,
  LightMode,
  Edit,
  Delete,
  Dashboard,
  Assessment,
  Settings,
  Help,
  ExpandMore,
  ExpandLess,
  Star,
  StarBorder,
  StarHalf,
  Favorite,
  FavoriteBorder,
  Add,
  Close,
  Refresh,
  Home,
  CalendarToday,
  Timeline,
  TrendingUp,
  MoreVert,
  Share,
  GetApp,
  Print,
  FileCopy,
  Bookmark,
  BookmarkBorder,
  Flag,
  Archive,
  Unarchive,
  Visibility,
  VisibilityOff,
  KeyboardArrowUp,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  ChevronLeft,
  ChevronRight,
  FirstPage,
  LastPage,
  NavigateBefore,
  NavigateNext,
  PlayArrow,
  Pause,
  Stop,
  SkipNext,
  SkipPrevious,
  Replay,
  Loop,
  Shuffle,
  VolumeUp,
  VolumeDown,
  VolumeMute,
  Mic,
  MicOff,
  PhotoCamera,
  Videocam,
  VideocamOff,
  InsertPhoto,
  InsertChart,
  PieChart,
  BarChart,
  BubbleChart,
  DonutLarge,
  Equalizer,
  Layers,
  ViewList,
  ViewModule,
  ViewQuilt,
  ViewStream,
  ViewDay,
  ViewWeek,
  ViewAgenda,
  ViewArray,
  ViewCarousel,
  ViewColumn,
  ViewComfy,
  ViewCompact,
  ViewHeadline,
  Folder,
  FolderOpen,
  FolderShared,
  CreateNewFolder,
  Cloud,
  CloudUpload,
  CloudDownload,
  CloudQueue,
  CloudOff,
  CloudDone,
  CloudCircle,
  FilterDrama,
  WbSunny,
  Brightness4,
  Brightness7,
  Brightness5,
  Brightness6,
  BrightnessAuto,
  BrightnessHigh,
  BrightnessLow,
  BrightnessMedium,
  NightsStay,
  Flare,
  Grain,
  Tonality,
  Palette,
  ColorLens,
  Camera,
  CameraAlt,
  CameraRoll,
  CameraEnhance,
  CameraFront,
  CameraRear,
  PhotoLibrary,
  Collections,
  CollectionsBookmark,
  PhotoAlbum,
  PhotoFilter,
  PhotoSizeSelectActual,
  PhotoSizeSelectLarge,
  PhotoSizeSelectSmall,
  AddAPhoto,
  AddPhotoAlternate,
  LinkedCamera,
  Timer,
  Timer10,
  Timer3,
  TimerOff,
  Colorize,
  Loupe,
  FilterVintage,
  FilterHdr,
  FilterBAndW,
  FilterCenterFocus,
  FilterFrames,
  FilterTiltShift,
  Blur,
  BlurCircular,
  BlurLinear,
  BlurOff,
  BlurOn,
  Brightness1,
  Brightness2,
  Brightness3,
  Broken,
  Brush,
  BurstMode,
  Compare,
  ControlPoint,
  ControlPointDuplicate,
  Crop,
  Crop169,
  Crop32,
  Crop54,
  Crop75,
  CropDin,
  CropFree,
  CropLandscape,
  CropOriginal,
  CropPortrait,
  CropRotate,
  CropSquare,
  Dehaze,
  Details,
  Exposure,
  ExposureNeg1,
  ExposureNeg2,
  ExposurePlus1,
  ExposurePlus2,
  ExposureZero,
  Filter,
  Filter1,
  Filter2,
  Filter3,
  Filter4,
  Filter5,
  Filter6,
  Filter7,
  Filter8,
  Filter9,
  Filter9Plus,
  FlashAuto,
  FlashOff,
  FlashOn,
  Flip,
  Gradient,
  GridOff,
  GridOn,
  HdrOff,
  HdrOn,
  HdrStrong,
  HdrWeak,
  Healing,
  Image,
  ImageAspectRatio,
  ImageSearch,
  Iso,
  Landscape,
  LeakAdd,
  LeakRemove,
  Lens,
  Looks,
  Looks3,
  Looks4,
  Looks5,
  Looks6,
  LooksOne,
  LooksTwo,
  MonochromePhotos,
  MovieCreation,
  MovieFilter,
  MusicNote,
  Nature,
  NaturePeople,
  Panorama,
  PanoramaFishEye,
  PanoramaHorizontal,
  PanoramaVertical,
  PanoramaWideAngle,
  Photo,
  PictureAsPdf,
  Portrait,
  RemoveRedEye,
  Rotate90DegreesCcw,
  RotateLeft,
  RotateRight,
  Slideshow,
  StraightenIcon,
  Style,
  SwitchCamera,
  SwitchVideo,
  TagFaces,
  Texture,
  Timelapse,
  Transform,
  Tune,
  Wb,
  WbAuto,
  WbCloudy,
  WbIncandescent,
  WbIridescent,
  AddCircle,
  AddCircleOutline,
  Block,
  Clear,
  CreateIcon,
  DeleteForever,
  DeleteOutline,
  Done,
  DoneAll,
  DoneOutline,
  RemoveCircle,
  RemoveCircleOutline,
  Save,
  SaveAlt,
  Drafts,
  MailOutline,
  MoveToInbox,
  NextWeek,
  Markunread,
  MarkunreadMailbox,
  Report,
  ReportProblem,
  Mail,
  Error,
  ErrorOutline,
  Warning,
  HighlightOff,
  LiveHelp,
  Feedback,
  Chat,
  ChatBubble,
  ChatBubbleOutline,
  Forum,
  Email,
  ContactMail,
  ContactPhone,
  Contacts,
  ImportContacts,
  ImportExport,
  ContactSupport,
  RecentActors,
  LocationOn,
  AddLocation,
  BeenHere,
  DirectionsBike,
  DirectionsBoat,
  DirectionsBus,
  DirectionsCar,
  DirectionsRailway,
  DirectionsRun,
  DirectionsSubway,
  DirectionsTransit,
  DirectionsWalk,
  EditLocation,
  EvStation,
  Flight,
  Hotel,
  LayersClear,
  LocalActivity,
  LocalAirport,
  LocalAtm,
  LocalBar,
  LocalCafe,
  LocalCarWash,
  LocalConvenienceStore,
  LocalDining,
  LocalDrink,
  LocalFlorist,
  LocalGasStation,
  LocalGroceryStore,
  LocalHospital,
  LocalHotel,
  LocalLaundryService,
  LocalLibrary,
  LocalMall,
  LocalMovies,
  LocalOffer,
  LocalParking,
  LocalPharmacy,
  LocalPhone,
  LocalPizza,
  LocalPlay,
  LocalPostOffice,
  LocalPrintshop,
  LocalSee,
  LocalShipping,
  LocalTaxi,
  Map,
  MyLocation,
  Navigation,
  NearMe,
  PersonPin,
  PersonPinCircle,
  PinDrop,
  Place,
  RateReview,
  RestaurantMenu,
  Satellite,
  StoreMallDirectory,
  Streetview,
  Subway,
  Terrain,
  Traffic,
  Train,
  Tram,
  TransferWithinAStation,
  ZoomOutMap,
  Apps,
  ArrowDropDown,
  ArrowDropDownCircle,
  ArrowDropUp,
  ArrowForward,
  ArrowForwardIos,
  ArrowLeft,
  ArrowRight,
  ArrowRightAlt,
  ArrowUpward,
  Check,
  CheckBox,
  CheckBoxOutlineBlank,
  CheckCircleOutline,
  IndeterminateCheckBox,
  RadioButtonChecked,
  RadioButtonUnchecked,
  StarOutline,
  StarRate,
  ThumbDownAlt,
  ThumbUpAlt,
  ThumbsUpDown,
  Update,
  AddBox,
  AddToQueue,
  AirplayIcon,
  Album,
  ArtTrack,
  AvTimer,
  BrandingWatermark,
  CallToAction,
  ClosedCaption,
  ControlCamera,
  Explicit,
  FastForward,
  FastRewind,
  FeaturedPlayList,
  FeaturedVideo,
  FiberDvr,
  FiberManualRecord,
  FiberNew,
  FiberPin,
  FiberSmartRecord,
  Forward10,
  Forward30,
  Forward5,
  Games,
  Hd,
  Hearing,
  HighQuality,
  LibraryAdd,
  LibraryBooks,
  LibraryMusic,
  MicNone,
  MissedVideoCall,
  Movie,
  MusicVideo,
  NewReleases,
  Note,
  NotInterested,
  PauseCircleFilled,
  PauseCircleOutline,
  PermCameraMic,
  PermDataSetting,
  PermDeviceInformation,
  PermIdentity,
  PermMedia,
  PermPhoneMsg,
  PermScanWifi,
  PlayCircleFilled,
  PlayCircleOutline,
  PlaylistAdd,
  PlaylistAddCheck,
  PlaylistPlay,
  QueueMusic,
  QueuePlayNext,
  Radio,
  RemoveFromQueue,
  Repeat,
  RepeatOne,
  Replay10,
  Replay30,
  Replay5,
  SlowMotionVideo,
  Snooze,
  SortByAlpha,
  Subscriptions,
  Subtitles,
  SurroundSound,
  VideoCall,
  VideoLabel,
  VideoLibrary,
  VolumeOff,
  Web,
  WebAsset,
  School,
  Class,
  MenuBook,
  Book,
  Bookmarks,
  Highlight,
  History,
  Receipt,
  Restore,
  RestorePage,
  Schedule,
  Today,
  AccountBalance,
  AccountBalanceWallet,
  AccountBox,
  AccountCircle,
  AssignmentInd,
  AssignmentLate,
  AssignmentReturn,
  AssignmentReturned,
  AssignmentTurnedIn,
  Autorenew,
  Backup,
  BugReport,
  Build,
  Cached,
  CardGiftcard,
  CardMembership,
  CardTravel,
  ChangeHistory,
  ChromeReaderMode,
  Code,
  CommentsDisabled,
  CompareArrows,
  Copyright,
  CreditCard,
  DateRange,
  Dns,
  DonutSmall,
  DragIndicator,
  Eject,
  EuroSymbol,
  Event,
  EventSeat,
  ExitToApp,
  Extension,
  Face,
  FindInPage,
  FindReplace,
  Fingerprint,
  FlightLand,
  FlightTakeoff,
  FlipToBack,
  FlipToFront,
  GTranslate,
  Gif,
  Grade,
  GroupWork,
  HelpOutline,
  HorizontalSplit,
  HourglassEmpty,
  HourglassFull,
  Http,
  Https,
  InfoOutlined,
  Input,
  InvertColors,
  Label,
  LabelImportant,
  LabelOff,
  Language,
  Launch,
  LineStyle,
  LineWeight,
  LockOpen,
  Loyalty,
  MarkEmailRead,
  MarkEmailUnread,
  Maximize,
  Minimize,
  OfflineBolt,
  OfflinePin,
  Opacity,
  OpenInBrowser,
  OpenInNew,
  OpenWith,
  Pageview,
  PanTool,
  Payment,
  PermContactCalendar,
  Pets,
  PictureInPicture,
  PictureInPictureAlt,
  PlayForWork,
  Polymer,
  PowerSettingsNew,
  PregnantWoman,
  QueryBuilder,
  QuestionAnswer,
  RecordVoiceOver,
  Redeem,
  RemoveShoppingCart,
  Reorder,
  RestoreFromTrash,
  Room,
  RoundedCorner,
  Rowing,
  ScheduleSend,
  SettingsApplications,
  SettingsBackupRestore,
  SettingsBluetooth,
  SettingsBrightness,
  SettingsCell,
  SettingsEthernet,
  SettingsInputAntenna,
  SettingsInputComponent,
  SettingsInputComposite,
  SettingsInputHdmi,
  SettingsInputSvideo,
  SettingsOverscan,
  SettingsPhone,
  SettingsPower,
  SettingsRemote,
  SettingsVoice,
  ShoppingBasket,
  ShoppingCart,
  SpeakerNotes,
  SpeakerNotesOff,
  Spellcheck,
  Stars,
  Store,
  Subject,
  SupervisedUserCircle,
  SupervisorAccount,
  SwapHoriz,
  SwapHorizontalCircle,
  SwapVert,
  SwapVerticalCircle,
  SyncAlt,
  SystemUpdate,
  TabUnselected,
  TextRotateUp,
  TextRotateVertical,
  TextRotationDown,
  TextRotationNone,
  Theaters,
  ThreeDRotation,
  Translate,
  TrendingDown,
  TrendingFlat,
  Undo,
  UnfoldLess,
  UnfoldMore,
  VerifiedUser,
  VerticalSplit,
  VoiceOverOff,
  WatchLater,
  Work,
  WorkOff,
  WorkOutline,
  YoutubeSearchedFor,
  ZoomIn,
  ZoomOut,
  AddAlert,
  NotificationImportant,
  NotificationsActive,
  NotificationsNone,
  NotificationsOff,
  NotificationsPaused,
  WifiOff,
  Wifi,
  AcUnit,
  Airport,
  AllInclusive,
  BeachAccess,
  BusinessCenter,
  Casino,
  ChildCare,
  ChildFriendly,
  FitnessCenter,
  FreeBreakfast,
  Golf,
  HotTub,
  Kitchen,
  Pool,
  RoomService,
  SmokeFree,
  SmokingRooms,
  Spa,
  SportsBar,
  Cake,
  Domain,
  Group,
  GroupAdd,
  LocationCity,
  Mood,
  MoodBad,
  Pages,
  PartyMode,
  People,
  PeopleOutline,
  PersonAdd,
  PersonOutline,
  PlusOne,
  Poll,
  Public,
  SentimentDissatisfied,
  SentimentSatisfied,
  SentimentSatisfiedAlt,
  SentimentVeryDissatisfied,
  SentimentVerySatisfied,
  Whatshot,
  ToggleOff,
  ToggleOn,
  Category,
  Business
} from '@mui/icons-material';

// GraphQL queries
const GET_MATERIALS_FOR_REVIEW = gql`
  query GetMaterialsForReview($reviewerId: ID!) {
    tasksByWorker(workerId: $reviewerId) {
      id
      name
      description
      startDate
      endDate
      deadline
      priority
      taskStatus {
        id
        name
      }
      materials {
        id
        name
        description
        status {
          id
          name
        }
        type {
          id
          name
        }
        targetAudience {
          name
        }
        language {
          name
        }
        keywords {
          name
        }
        reviews {
          id
          comments
          suggestedChange
          reviewDate
          materialSummary {
            name
          }
        }
      }
    }
  }
`;

const GET_MATERIAL_DETAILS = gql`
  query GetMaterialDetails($materialId: ID!) {
    material(id: $materialId) {
      id
      name
      description
      status {
        id
        name
      }
      type {
        id
        name
      }
      targetAudience {
        name
      }
      language {
        name
      }
      usageRestrictions {
        description
      }
      licenceType {
        name
      }
      task {
        id
        name
        description
        project {
          id
          name
          client {
            name
          }
        }
      }
      keywords {
        id
        name
      }
      reviews {
        id
        comments
        suggestedChange
        reviewDate
        materialSummary {
          id
          name
        }
        reviewer {
          id
          name
          surname
        }
      }
    }
  }
`;

const GET_MATERIAL_SUMMARIES = gql`
  query {
    materialSummaries {
      id
      name
    }
  }
`;

// GraphQL mutations
const CREATE_MATERIAL_REVIEW = gql`
  mutation CreateMaterialReview($input: CreateMaterialReviewInput!) {
    createMaterialReview(input: $input) {
      id
      comments
      suggestedChange
      reviewDate
      materialSummary {
        id
        name
      }
      reviewer {
        id
        name
        surname
      }
    }
  }
`;

const UPDATE_MATERIAL_REVIEW = gql`
  mutation UpdateMaterialReview($id: ID!, $input: UpdateMaterialReviewInput!) {
    updateMaterialReview(id: $id, input: $input) {
      id
      comments
      suggestedChange
      reviewDate
      materialSummary {
        id
        name
      }
      reviewer {
        id
        name
        surname
      }
    }
  }
`;

const DELETE_MATERIAL_REVIEW = gql`
  mutation DeleteMaterialReview($id: ID!) {
    deleteMaterialReview(id: $id)
  }
`;

// Custom styled components
const StyledCard = styled(motion(Card))(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '16px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
  },
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '5px',
    background: 'linear-gradient(90deg, #3f51b5, #f50057)',
  }
}));

const GlassCard = styled(motion(Paper))(({ theme }) => ({
  background: theme.palette.mode === 'dark'
      ? 'rgba(66, 66, 66, 0.7)'
      : 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  border: theme.palette.mode === 'dark'
      ? '1px solid rgba(255, 255, 255, 0.1)'
      : '1px solid rgba(0, 0, 0, 0.1)',
  boxShadow: theme.palette.mode === 'dark'
      ? '0 8px 32px rgba(0, 0, 0, 0.3)'
      : '0 8px 32px rgba(31, 38, 135, 0.2)',
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-50%',
    width: '200%',
    height: '100%',
    background: 'linear-gradient(60deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%)',
    transform: 'translateX(-100%)',
    animation: 'shimmer 3s infinite',
  },
  '@keyframes shimmer': {
    '100%': {
      transform: 'translateX(100%)',
    },
  }
}));

const StatusChip = styled(Chip)(({ status, theme }) => {
  let color = 'default';
  let backgroundColor, textColor;

  switch(status?.toLowerCase()) {
    case 'approved':
      color = 'success';
      backgroundColor = alpha(theme.palette.success.main, 0.2);
      textColor = theme.palette.success.dark;
      break;
    case 'rejected':
      color = 'error';
      backgroundColor = alpha(theme.palette.error.main, 0.2);
      textColor = theme.palette.error.dark;
      break;
    case 'pending':
      color = 'warning';
      backgroundColor = alpha(theme.palette.warning.main, 0.2);
      textColor = theme.palette.warning.dark;
      break;
    case 'in review':
      color = 'info';
      backgroundColor = alpha(theme.palette.info.main, 0.2);
      textColor = theme.palette.info.dark;
      break;
    default:
      color = 'default';
      backgroundColor = alpha(theme.palette.grey[500], 0.2);
      textColor = theme.palette.grey[700];
  }

  return {
    fontWeight: 'bold',
    backgroundColor,
    color: textColor,
    borderRadius: '12px',
    '& .MuiChip-label': {
      padding: '0 12px',
    }
  };
});

const PriorityIndicator = styled('div')(({ priority }) => {
  let backgroundColor = '#1976d2'; // default blue

  if (priority >= 8) {
    backgroundColor = '#d32f2f'; // high - red
  } else if (priority >= 4) {
    backgroundColor = '#ff9800'; // medium - orange
  } else if (priority >= 1) {
    backgroundColor = '#4caf50'; // low - green
  }

  return {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor,
    marginRight: '8px',
    display: 'inline-block',
    boxShadow: '0 0 8px ' + backgroundColor,
  };
});

const StyledRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconFilled': {
    color: theme.palette.primary.main,
  },
  '& .MuiRating-iconHover': {
    color: theme.palette.primary.light,
  },
  '& .MuiRating-iconEmpty': {
    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
  }
}));

const AnimatedAvatar = styled(motion(Avatar))(({ theme }) => ({
  border: `2px solid ${theme.palette.primary.main}`,
  boxShadow: `0 0 10px ${theme.palette.primary.main}`,
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
  '&:hover': {
    transform: 'scale(1.1)',
  },
  transition: 'transform 0.3s ease',
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 280,
    background: theme.palette.mode === 'dark'
        ? 'linear-gradient(45deg, #424242 30%, #212121 90%)'
        : 'linear-gradient(45deg, #f5f5f5 30%, #e0e0e0 90%)',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
    borderRight: 'none',
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
  background: 'linear-gradient(90deg, #3f51b5, #f50057)',
  color: '#fff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
      ? 'linear-gradient(90deg, #424242, #212121)'
      : 'linear-gradient(90deg, #3f51b5, #f50057)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
}));

const SearchBox = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '50px',
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  transition: theme.transitions.create('width'),
  '&.focused': {
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '40ch',
    },
  }
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
      <div
          role="tabpanel"
          hidden={value !== index}
          id={`simple-tabpanel-${index}`}
          aria-labelledby={`simple-tab-${index}`}
          {...other}
      >
        {value === index && (
            <Box sx={{ p: 3 }}>
              {children}
            </Box>
        )}
      </div>
  );
};

// Main component
const MaterialReviewPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [editReviewId, setEditReviewId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState('deadline');
  const [sortDirection, setSortDirection] = useState('asc');
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Review form state
  const [reviewComment, setReviewComment] = useState('');
  const [suggestedChanges, setSuggestedChanges] = useState('');
  const [selectedSummary, setSelectedSummary] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewStep, setReviewStep] = useState(0);

  // Animation states
  const [animateCards, setAnimateCards] = useState(false);

  // Mock reviewer ID (in a real app, this would come from authentication)
  const reviewerId = "1";

  const { loading, error, data, refetch } = useQuery(GET_MATERIALS_FOR_REVIEW, {
    variables: { reviewerId },
    onCompleted: () => {
      // Trigger card animations after data loads
      setTimeout(() => setAnimateCards(true), 300);
    }
  });

  const { data: summariesData } = useQuery(GET_MATERIAL_SUMMARIES);

  // Setup mutations
  const [createMaterialReview, { loading: createLoading }] = useMutation(CREATE_MATERIAL_REVIEW, {
    onCompleted: () => {
      handleCloseReviewDialog();
      refetch();
      setSnackbar({
        open: true,
        message: 'Review submitted successfully!',
        severity: 'success'
      });
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error submitting review: ${error.message}`,
        severity: 'error'
      });
    }
  });

  const [updateMaterialReview, { loading: updateLoading }] = useMutation(UPDATE_MATERIAL_REVIEW, {
    onCompleted: () => {
      handleCloseReviewDialog();
      refetch();
      setSnackbar({
        open: true,
        message: 'Review updated successfully!',
        severity: 'success'
      });
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error updating review: ${error.message}`,
        severity: 'error'
      });
    }
  });

  const [deleteMaterialReview, { loading: deleteLoading }] = useMutation(DELETE_MATERIAL_REVIEW, {
    onCompleted: () => {
      refetch();
      setSnackbar({
        open: true,
        message: 'Review deleted successfully!',
        severity: 'success'
      });
    },
    onError: (error) => {
      setSnackbar({
        open: true,
        message: `Error deleting review: ${error.message}`,
        severity: 'error'
      });
    }
  });

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#3f51b5',
        light: '#757de8',
        dark: '#002984',
      },
      secondary: {
        main: '#f50057',
        light: '#ff4081',
        dark: '#c51162',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f7fa',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 600,
      },
      h4: {
        fontWeight: 600,
      },
      h5: {
        fontWeight: 500,
      },
      h6: {
        fontWeight: 500,
      },
      button: {
        fontWeight: 600,
        textTransform: 'none',
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '50px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            overflow: 'hidden',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          rounded: {
            borderRadius: '16px',
          },
          elevation1: {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '50px',
            fontWeight: 500,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
          },
        },
      },
    },
  });

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('md'));

  // Filter and sort materials
  const filteredMaterials = useMemo(() => {
    if (!data?.tasksByWorker) return [];

    let materials = [];

    // Collect all materials from tasks
    data.tasksByWorker.forEach(task => {
      if (task.materials && task.materials.length > 0) {
        task.materials.forEach(material => {
          materials.push({
            ...material,
            task: {
              id: task.id,
              name: task.name,
              description: task.description,
              deadline: task.deadline,
              priority: task.priority,
              status: task.taskStatus
            }
          });
        });
      }
    });

    // Filter by status
    if (filterStatus !== 'all') {
      materials = materials.filter(material =>
          material.status?.name.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      materials = materials.filter(material =>
          material.name.toLowerCase().includes(term) ||
          material.description?.toLowerCase().includes(term) ||
          material.type?.name.toLowerCase().includes(term) ||
          material.keywords?.some(k => k.name.toLowerCase().includes(term))
      );
    }

    // Sort materials
    materials.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          comparison = (a.status?.name || '').localeCompare(b.status?.name || '');
          break;
        case 'deadline':
          const dateA = a.task?.deadline ? new Date(a.task.deadline) : new Date(0);
          const dateB = b.task?.deadline ? new Date(b.task.deadline) : new Date(0);
          comparison = dateA - dateB;
          break;
        case 'priority':
          comparison = (b.task?.priority || 0) - (a.task?.priority || 0);
          break;
        case 'reviews':
          comparison = (b.reviews?.length || 0) - (a.reviews?.length || 0);
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return materials;
  }, [data, filterStatus, searchTerm, sortBy, sortDirection]);

  // Pagination
  const paginatedMaterials = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredMaterials.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMaterials, page, itemsPerPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredMaterials.length / itemsPerPage);
  }, [filteredMaterials, itemsPerPage]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1); // Reset to first page when changing tabs

    switch(newValue) {
      case 0: // All
        setFilterStatus('all');
        break;
      case 1: // Pending
        setFilterStatus('pending');
        break;
      case 2: // In Review
        setFilterStatus('in review');
        break;
      case 3: // Completed
        setFilterStatus('approved');
        break;
      default:
        setFilterStatus('all');
    }
  };

  // Open material details
  const handleOpenMaterial = (material) => {
    setSelectedMaterial(material);
    setAnimateCards(false);
  };

  // Close material details
  const handleCloseMaterial = () => {
    setSelectedMaterial(null);
    // Re-trigger card animations when returning to list
    setTimeout(() => setAnimateCards(true), 300);
  };

  // Open review dialog
  const handleOpenReviewDialog = (reviewId = null) => {
    setEditReviewId(reviewId);
    setReviewStep(0);

    if (reviewId) {
      // Find the review to edit
      const reviewToEdit = selectedMaterial.reviews.find(r => r.id === reviewId);
      if (reviewToEdit) {
        setReviewComment(reviewToEdit.comments || '');
        setSuggestedChanges(reviewToEdit.suggestedChange || '');
        setSelectedSummary(reviewToEdit.materialSummary?.id || '');
        setRating(reviewToEdit.rating || 0);
      }
    } else {
      // Reset form for new review
      setReviewComment('');
      setSuggestedChanges('');
      setSelectedSummary('');
      setRating(0);
    }

    setReviewDialogOpen(true);
  };

  // Close review dialog
  const handleCloseReviewDialog = () => {
    setReviewDialogOpen(false);
    setEditReviewId(null);
    setReviewComment('');
    setSuggestedChanges('');
    setSelectedSummary('');
    setRating(0);
    setReviewStep(0);
  };

  // Handle review step navigation
  const handleNextStep = () => {
    setReviewStep((prevStep) => prevStep + 1);
  };

  const handleBackStep = () => {
    setReviewStep((prevStep) => prevStep - 1);
  };

  // Submit review
  const handleSubmitReview = () => {
    const reviewInput = {
      materialId: selectedMaterial.id,
      reviewerId,
      feedback: reviewComment,
      suggestedChange: suggestedChanges,
      materialSummaryId: selectedSummary,
      rating
    };

    if (editReviewId) {
      // Update existing review
      updateMaterialReview({
        variables: {
          id: editReviewId,
          input: reviewInput
        }
      });
    } else {
      // Create new review
      createMaterialReview({
        variables: {
          input: reviewInput
        }
      });
    }
  };

  // Delete review
  const handleDeleteReview = (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteMaterialReview({
        variables: { id: reviewId }
      });
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Toggle drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(parseInt(event.target.value, 10));
    setPage(1); // Reset to first page
  };

  // Toggle view mode (grid/list)
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data?.tasksByWorker) return {
      total: 0,
      pending: 0,
      inReview: 0,
      approved: 0,
      rejected: 0,
      highPriority: 0
    };

    let materials = [];
    data.tasksByWorker.forEach(task => {
      if (task.materials && task.materials.length > 0) {
        materials = [...materials, ...task.materials.map(m => ({
          ...m,
          task: {
            priority: task.priority
          }
        }))];
      }
    });

    return {
      total: materials.length,
      pending: materials.filter(m => m.status?.name.toLowerCase() === 'pending').length,
      inReview: materials.filter(m => m.status?.name.toLowerCase() === 'in review').length,
      approved: materials.filter(m => m.status?.name.toLowerCase() === 'approved').length,
      rejected: materials.filter(m => m.status?.name.toLowerCase() === 'rejected').length,
      highPriority: materials.filter(m => m.task?.priority >= 8).length
    };
  }, [data]);

  // Card animations
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  if (loading) return (
      <ThemeProvider theme={theme}>
        <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              bgcolor: 'background.default'
            }}
        >
          <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
          >
            <CircularProgress size={60} thickness={4} />
          </motion.div>
          <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Typography variant="h6" sx={{ mt: 2 }}>
              Loading materials...
            </Typography>
          </motion.div>
        </Box>
      </ThemeProvider>
  );

  if (error) return (
      <ThemeProvider theme={theme}>
        <Box
            sx={{
              p: 3,
              textAlign: 'center',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              bgcolor: 'background.default'
            }}
        >
          <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
          >
            <ErrorSharp color="error" sx={{ fontSize: 60 }} />
          </motion.div>
          <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Typography color="error" variant="h5" sx={{ mt: 2 }}>
              Error loading materials
            </Typography>
            <Typography color="textSecondary" sx={{ mt: 1 }}>
              {error.message}
            </Typography>
            <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3 }}
                onClick={() => refetch()}
                startIcon={<Refresh />}
            >
              Try Again
            </Button>
          </motion.div>
        </Box>
      </ThemeProvider>
  );

  return (
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
          {/* Sidebar Drawer */}
          <StyledDrawer
              variant={isMobile ? "temporary" : "persistent"}
              anchor="left"
              open={drawerOpen}
              onClose={toggleDrawer}
          >
            <DrawerHeader>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', px: 2 }}>
                <RateReview sx={{ mr: 1 }} />
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                  Review System
                </Typography>
                <IconButton onClick={toggleDrawer} sx={{ color: 'white' }}>
                  <ChevronLeft />
                </IconButton>
              </Box>
            </DrawerHeader>

            <Box sx={{ p: 2 }}>
              <Box sx={{
                p: 2,
                borderRadius: '12px',
                bgcolor: 'rgba(0, 0, 0, 0.04)',
                display: 'flex',
                alignItems: 'center'
              }}>
                <StyledBadge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    color="success"
                >
                  <Avatar sx={{ bgcolor: 'primary.main' }}>R</Avatar>
                </StyledBadge>
                <Box sx={{ ml: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Reviewer
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Now
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider />

            <List>
              <ListItem button selected>
                <ListItemIcon>
                  <Dashboard />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>

              <ListItem button>
                <ListItemIcon>
                  <Assignment />
                </ListItemIcon>
                <ListItemText primary="My Reviews" />
              </ListItem>

              <ListItem button>
                <ListItemIcon>
                  <Timeline />
                </ListItemIcon>
                <ListItemText primary="Analytics" />
              </ListItem>

              <ListItem button>
                <ListItemIcon>
                  <Notifications />
                </ListItemIcon>
                <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Notifications</span>
                        <Chip
                            label="4"
                            size="small"
                            color="primary"
                            sx={{ height: 20, minWidth: 20 }}
                        />
                      </Box>
                    }
                />
              </ListItem>
            </List>

            <Divider />

            <List>
              <ListItem button>
                <ListItemIcon>
                  <Settings />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItem>

              <ListItem button>
                <ListItemIcon>
                  <Help />
                </ListItemIcon>
                <ListItemText primary="Help & Support" />
              </ListItem>

              <ListItem button onClick={toggleDarkMode}>
                <ListItemIcon>
                  {darkMode ? <LightMode /> : <DarkMode />}
                </ListItemIcon>
                <ListItemText primary={darkMode ? "Light Mode" : "Dark Mode"} />
              </ListItem>
            </List>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ p: 2 }}>
              <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  startIcon={<Logout />}
              >
                Sign Out
              </Button>
            </Box>
          </StyledDrawer>

          {/* Main content */}
          <Box sx={{ flexGrow: 1 }}>
            <StyledAppBar position="fixed" elevation={0}>
              <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={toggleDrawer}
                    edge="start"
                    sx={{ mr: 2 }}
                >

                </IconButton>

                <Typography variant="h6" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Material Review System
                </Typography>

                <SearchBox className={searchFocused ? 'focused' : ''}>
                  <SearchIconWrapper>
                    <Search />
                  </SearchIconWrapper>
                  <StyledInputBase
                      placeholder="Search materials…"
                      inputProps={{ 'aria-label': 'search' }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setSearchFocused(false)}
                  />
                </SearchBox>

                <Box sx={{ flexGrow: 1 }} />

                <Box sx={{ display: 'flex' }}>
                  <IconButton color="inherit">
                    <Badge badgeContent={4} color="error">
                      <Notifications />
                    </Badge>
                  </IconButton>

                  <IconButton color="inherit" onClick={toggleDarkMode}>
                    {darkMode ? <LightMode /> : <DarkMode />}
                  </IconButton>

                  <IconButton
                      edge="end"
                      aria-label="account of current user"
                      aria-haspopup="true"
                      color="inherit"
                  >
                    <AccountCircle />
                  </IconButton>
                </Box>
              </Toolbar>
            </StyledAppBar>

            {/* Main content area */}
            <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  pt: 10,
                  pb: 8,
                  px: { xs: 2, sm: 4, md: 6 },
                  bgcolor: 'background.default',
                  minHeight: '100vh',
                }}
            >
              {selectedMaterial ? (
                  <MaterialDetailView
                      material={selectedMaterial}
                      onBack={handleCloseMaterial}
                      onReview={handleOpenReviewDialog}
                      onEditReview={handleOpenReviewDialog}
                      onDeleteReview={handleDeleteReview}
                      reviewerId={reviewerId}
                  />
              ) : (
                  <>
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" gutterBottom fontWeight="bold">
                          Materials for Review
                        </Typography>
                        <Breadcrumbs aria-label="breadcrumb">
                          <Link
                              underline="hover"
                              color="inherit"
                              href="#"
                              sx={{ display: 'flex', alignItems: 'center' }}
                          >
                            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
                            Home
                          </Link>
                          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Assignment sx={{ mr: 0.5 }} fontSize="inherit" />
                            Materials
                          </Typography>
                        </Breadcrumbs>
                      </Box>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={4} lg={2}>
                          <GlassCard>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography color="textSecondary" variant="body2">
                                  Total Materials
                                </Typography>
                                <Typography variant="h4" fontWeight="bold">
                                  {stats.total}
                                </Typography>
                              </Box>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <Description />
                              </Avatar>
                            </Box>
                          </GlassCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4} lg={2}>
                          <GlassCard>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography color="textSecondary" variant="body2">
                                  Pending
                                </Typography>
                                <Typography variant="h4" fontWeight="bold">
                                  {stats.pending}
                                </Typography>
                              </Box>
                              <Avatar sx={{ bgcolor: 'warning.main' }}>
                                <Pending />
                              </Avatar>
                            </Box>
                          </GlassCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4} lg={2}>
                          <GlassCard>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography color="textSecondary" variant="body2">
                                  In Review
                                </Typography>
                                <Typography variant="h4" fontWeight="bold">
                                  {stats.inReview}
                                </Typography>
                              </Box>
                              <Avatar sx={{ bgcolor: 'info.main' }}>
                                <RateReview />
                              </Avatar>
                            </Box>
                          </GlassCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4} lg={2}>
                          <GlassCard>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography color="textSecondary" variant="body2">
                                  Approved
                                </Typography>
                                <Typography variant="h4" fontWeight="bold">
                                  {stats.approved}
                                </Typography>
                              </Box>
                              <Avatar sx={{ bgcolor: 'success.main' }}>
                                <CheckCircle />
                              </Avatar>
                            </Box>
                          </GlassCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4} lg={2}>
                          <GlassCard>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography color="textSecondary" variant="body2">
                                  Rejected
                                </Typography>
                                <Typography variant="h4" fontWeight="bold">
                                  {stats.rejected}
                                </Typography>
                              </Box>
                              <Avatar sx={{ bgcolor: 'error.main' }}>
                                <Cancel />
                              </Avatar>
                            </Box>
                          </GlassCard>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4} lg={2}>
                          <GlassCard>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Box>
                                <Typography color="textSecondary" variant="body2">
                                  High Priority
                                </Typography>
                                <Typography variant="h4" fontWeight="bold">
                                  {stats.highPriority}
                                </Typography>
                              </Box>
                              <Avatar sx={{ bgcolor: 'error.dark' }}>
                                <Flag />
                              </Avatar>
                            </Box>
                          </GlassCard>
                        </Grid>
                      </Grid>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <Paper sx={{ p: 3, mb: 3 }} elevation={0}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                          <Tabs
                              value={tabValue}
                              onChange={handleTabChange}
                              aria-label="material status tabs"
                              variant={isMobile ? "scrollable" : "fullWidth"}
                              scrollButtons={isMobile ? "auto" : false}
                              allowScrollButtonsMobile
                              textColor="primary"
                              indicatorColor="primary"
                          >
                            <Tab
                                icon={<FilterList />}
                                iconPosition="start"
                                label="All Materials"
                            />
                            <Tab
                                icon={<Pending />}
                                iconPosition="start"
                                label="Pending"
                            />
                            <Tab
                                icon={<Assignment />}
                                iconPosition="start"
                                label="In Review"
                            />
                            <Tab
                                icon={<CheckCircle />}
                                iconPosition="start"
                                label="Completed"
                            />
                          </Tabs>
                        </Box>

                        <Grid container spacing={3} alignItems="center">
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" sx={{ mr: 2 }}>
                                View:
                              </Typography>
                              <ToggleButtonGroup
                                  value={viewMode}
                                  exclusive
                                  onChange={handleViewModeChange}
                                  size="small"
                              >
                                <ToggleButton value="grid" aria-label="grid view">
                                  <ViewModule />
                                </ToggleButton>
                                <ToggleButton value="list" aria-label="list view">
                                  <ViewList />
                                </ToggleButton>
                              </ToggleButtonGroup>
                            </Box>
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <FormControl fullWidth variant="outlined" size="small">
                              <InputLabel id="sort-by-label">Sort By</InputLabel>
                              <Select
                                  labelId="sort-by-label"
                                  value={sortBy}
                                  onChange={(e) => setSortBy(e.target.value)}
                                  label="Sort By"
                                  startAdornment={
                                    <InputAdornment position="start">
                                      <Sort />
                                    </InputAdornment>
                                  }
                              >
                                <MenuItem value="name">Name</MenuItem>
                                <MenuItem value="status">Status</MenuItem>
                                <MenuItem value="deadline">Deadline</MenuItem>
                                <MenuItem value="priority">Priority</MenuItem>
                                <MenuItem value="reviews">Review Count</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} md={3}>
                            <FormControl fullWidth variant="outlined" size="small">
                              <InputLabel id="sort-direction-label">Direction</InputLabel>
                              <Select
                                  labelId="sort-direction-label"
                                  value={sortDirection}
                                  onChange={(e) => setSortDirection(e.target.value)}
                                  label="Direction"
                              >
                                <MenuItem value="asc">Ascending</MenuItem>
                                <MenuItem value="desc">Descending</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </Paper>
                    </motion.div>

                    {filteredMaterials.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                          <Paper sx={{ p: 5, textAlign: 'center', borderRadius: '16px' }} elevation={0}>
                            <Box sx={{ mb: 3 }}>
                              Search Off
                            </Box>
                            <Typography variant="h5" color="textSecondary" gutterBottom>
                              No materials found
                            </Typography>
                            <Typography variant="body1" color="textSecondary" paragraph>
                              We couldn't find any materials matching your criteria
                            </Typography>
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<Refresh />}
                                onClick={() => {
                                  setSearchTerm('');
                                  setFilterStatus('all');
                                  setTabValue(0);
                                }}
                            >
                              Reset Filters
                            </Button>
                          </Paper>
                        </motion.div>
                    ) : (
                        <>
                          {viewMode === 'grid' ? (
                              <Grid container spacing={3}>
                                <AnimatePresence>
                                  {paginatedMaterials.map((material, index) => (
                                      <Grid item key={material.id} xs={12} sm={6} md={4} lg={3}>
                                        <motion.div
                                            custom={index}
                                            initial="hidden"
                                            animate={animateCards ? "visible" : "hidden"}
                                            variants={cardVariants}
                                            whileHover={{ y: -10, transition: { duration: 0.2 } }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                          <StyledCard onClick={() => handleOpenMaterial(material)}>
                                            <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                <Typography variant="subtitle2" color="textSecondary">
                                                  {material.type?.name || 'Unknown Type'}
                                                </Typography>
                                                <StatusChip
                                                    label={material.status?.name || 'Unknown'}
                                                    status={material.status?.name}
                                                    size="small"
                                                />
                                              </Box>

                                              <Typography variant="h6" component="h2" gutterBottom noWrap>
                                                {material.name}
                                              </Typography>

                                              <Typography variant="body2" color="textSecondary" sx={{
                                                mb: 2,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                height: '4.5em',
                                              }}>
                                                {material.description || 'No description available'}
                                              </Typography>

                                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <PriorityIndicator priority={material.task?.priority || 0} />
                                                <Typography variant="body2">
                                                  Priority: {material.task?.priority || 'Not set'}
                                                </Typography>
                                              </Box>

                                              {material.task?.deadline && (
                                                  <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <CalendarToday fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                                                    {new Date(material.task.deadline).toLocaleDateString()}
                                                  </Typography>
                                              )}

                                              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {material.keywords?.slice(0, 3).map((keyword, index) => (
                                                    <Chip
                                                        key={index}
                                                        label={keyword.name}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                                {material.keywords?.length > 3 && (
                                                    <Chip
                                                        label={`+${material.keywords.length - 3}`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                )}
                                              </Box>
                                            </CardContent>

                                            <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                                              <Button
                                                  size="small"
                                                  startIcon={<Visibility />}
                                                  color="primary"
                                              >
                                                View
                                              </Button>

                                              <Box sx={{ flexGrow: 1 }} />

                                              <Tooltip title={`${material.reviews?.length || 0} reviews`}>
                                                <Badge
                                                    badgeContent={material.reviews?.length || 0}
                                                    color="primary"
                                                    sx={{ mr: 1 }}
                                                >
                                                  <Comment fontSize="small" />
                                                </Badge>
                                              </Tooltip>
                                            </CardActions>
                                          </StyledCard>
                                        </motion.div>
                                      </Grid>
                                  ))}
                                </AnimatePresence>
                              </Grid>
                          ) : (
                              <Paper elevation={0} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
                                <List>
                                  <AnimatePresence>
                                    {paginatedMaterials.map((material, index) => (
                                        <motion.div
                                            key={material.id}
                                            custom={index}
                                            initial="hidden"
                                            animate={animateCards ? "visible" : "hidden"}
                                            variants={cardVariants}
                                            whileHover={{ backgroundColor: alpha(theme.palette.primary.main, 0.05) }}
                                        >
                                          <ListItem
                                              button
                                              divider
                                              onClick={() => handleOpenMaterial(material)}
                                              sx={{ py: 2 }}
                                          >
                                            <Grid container spacing={2} alignItems="center">
                                              <Grid item xs={12} sm={6}>
                                                <Box>
                                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <PriorityIndicator priority={material.task?.priority || 0} />
                                                    <Typography variant="h6" noWrap>
                                                      {material.name}
                                                    </Typography>
                                                  </Box>
                                                  <Typography variant="body2" color="textSecondary" noWrap>
                                                    {material.description || 'No description available'}
                                                  </Typography>
                                                </Box>
                                              </Grid>

                                              <Grid item xs={6} sm={2}>
                                                <Typography variant="body2" color="textSecondary">
                                                  Type: {material.type?.name || 'Unknown'}
                                                </Typography>
                                              </Grid>

                                              <Grid item xs={6} sm={2}>
                                                <StatusChip
                                                    label={material.status?.name || 'Unknown'}
                                                    status={material.status?.name}
                                                    size="small"
                                                />
                                              </Grid>

                                              <Grid item xs={6} sm={1} sx={{ textAlign: 'center' }}>
                                                <Tooltip title="Deadline">
                                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <CalendarToday fontSize="small" color="action" sx={{ mr: 0.5 }} />
                                                    <Typography variant="body2">
                                                      {material.task?.deadline ? new Date(material.task.deadline).toLocaleDateString() : 'N/A'}
                                                    </Typography>
                                                  </Box>
                                                </Tooltip>
                                              </Grid>

                                              <Grid item xs={6} sm={1} sx={{ textAlign: 'center' }}>
                                                <Tooltip title="Reviews">
                                                  <Badge
                                                      badgeContent={material.reviews?.length || 0}
                                                      color="primary"
                                                  >
                                                    <Comment fontSize="small" color="action" />
                                                  </Badge>
                                                </Tooltip>
                                              </Grid>
                                            </Grid>
                                          </ListItem>
                                        </motion.div>
                                    ))}
                                  </AnimatePresence>
                                </List>
                              </Paper>
                          )}

                          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                size={isMobile ? "small" : "medium"}
                                showFirstButton
                                showLastButton
                            />
                          </Box>

                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography variant="body2" color="textSecondary" sx={{ mr: 2 }}>
                              Items per page:
                            </Typography>
                            <Select
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                size="small"
                                sx={{ minWidth: 80 }}
                            >
                              <MenuItem value={4}>4</MenuItem>
                              <MenuItem value={8}>8</MenuItem>
                              <MenuItem value={12}>12</MenuItem>
                              <MenuItem value={16}>16</MenuItem>
                              <MenuItem value={24}>24</MenuItem>
                            </Select>
                          </Box>
                        </>
                    )}
                  </>
              )}
            </Box>
          </Box>

          {/* Review Dialog */}
          <Dialog
              open={reviewDialogOpen}
              onClose={handleCloseReviewDialog}
              fullWidth
              maxWidth="md"
              TransitionComponent={Zoom}
              PaperProps={{
                sx: {
                  borderRadius: '16px',
                  overflow: 'hidden',
                }
              }}
          >
            <DialogTitle sx={{
              background: 'linear-gradient(90deg, #3f51b5, #f50057)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <RateReview sx={{ mr: 1 }} />
                {editReviewId ? 'Edit Review' : 'Review Material'}: {selectedMaterial?.name}
              </Box>
              <IconButton
                  edge="end"
                  color="inherit"
                  onClick={handleCloseReviewDialog}
                  aria-label="close"
              >
                <Close />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              <Stepper activeStep={reviewStep} orientation="vertical">
                <Step>
                  <StepLabel>
                    <Typography variant="subtitle1">Rate the Material</Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 4, mt: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        How would you rate this material?
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <StyledRating
                            name="material-rating"
                            value={rating}
                            onChange={(event, newValue) => {
                              setRating(newValue);
                            }}
                            precision={0.5}
                            size="large"
                            sx={{ mr: 2 }}
                        />
                        <Typography variant="body1">
                          {rating === 0 ? 'No rating' :
                              rating <= 1 ? 'Poor' :
                                  rating <= 2 ? 'Fair' :
                                      rating <= 3 ? 'Good' :
                                          rating <= 4 ? 'Very Good' : 'Excellent'}
                        </Typography>
                      </Box>

                      <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                        <InputLabel id="summary-label">Final Assessment</InputLabel>
                        <Select
                            labelId="summary-label"
                            value={selectedSummary}
                            onChange={(e) => setSelectedSummary(e.target.value)}
                            label="Final Assessment"
                            required
                        >
                          {summariesData?.materialSummaries.map(summary => (
                              <MenuItem key={summary.id} value={summary.id}>
                                {summary.name}
                              </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Box sx={{ mb: 2, mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            onClick={handleNextStep}
                            disabled={!selectedSummary || rating === 0}
                            endIcon={<NavigateNext />}
                        >
                          Next
                        </Button>
                      </Box>
                    </Box>
                  </StepContent>
                </Step>

                <Step>
                  <StepLabel>
                    <Typography variant="subtitle1">Provide Feedback</Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 4, mt: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Write your review comments
                      </Typography>

                      <TextField
                          label="Comments"
                          multiline
                          rows={4}
                          fullWidth
                          variant="outlined"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Provide your feedback about this material..."
                          sx={{ mb: 3 }}
                      />

                      <Typography variant="h6" gutterBottom>
                        Suggest improvements
                      </Typography>

                      <TextField
                          label="Suggested Changes"
                          multiline
                          rows={4}
                          fullWidth
                          variant="outlined"
                          value={suggestedChanges}
                          onChange={(e) => setSuggestedChanges(e.target.value)}
                          placeholder="Suggest specific changes or improvements..."
                      />

                      <Box sx={{ mb: 2, mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            onClick={handleBackStep}
                            startIcon={<NavigateBefore />}
                        >
                          Back
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleNextStep}
                            disabled={!reviewComment}
                            endIcon={<NavigateNext />}
                        >
                          Next
                        </Button>
                      </Box>
                    </Box>
                  </StepContent>
                </Step>

                <Step>
                  <StepLabel>
                    <Typography variant="subtitle1">Review Summary</Typography>
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 4, mt: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Review your feedback before submitting
                      </Typography>

                      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Rating
                          </Typography>
                          <StyledRating value={rating} readOnly precision={0.5} />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Final Assessment
                          </Typography>
                          <Chip
                              label={summariesData?.materialSummaries.find(s => s.id === selectedSummary)?.name || 'Unknown'}
                              color={
                                summariesData?.materialSummaries.find(s => s.id === selectedSummary)?.name?.toLowerCase().includes('approve') ? 'success' :
                                    summariesData?.materialSummaries.find(s => s.id === selectedSummary)?.name?.toLowerCase().includes('reject') ? 'error' :
                                        'default'
                              }
                          />
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Comments
                          </Typography>
                          <Typography variant="body2">
                            {reviewComment}
                          </Typography>
                        </Box>

                        {suggestedChanges && (
                            <Box>
                              <Typography variant="subtitle2" color="textSecondary">
                                Suggested Changes
                              </Typography>
                              <Typography variant="body2">
                                {suggestedChanges}
                              </Typography>
                            </Box>
                        )}
                      </Paper>

                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                            onClick={handleBackStep}
                            startIcon={<NavigateBefore />}
                        >
                          Back
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmitReview}
                            disabled={createLoading || updateLoading}
                            startIcon={editReviewId ? <Edit /> : <Send />}
                        >
                          {createLoading || updateLoading ? (
                              <CircularProgress size={24} />
                          ) : (
                              editReviewId ? 'Update Review' : 'Submit Review'
                          )}
                        </Button>
                      </Box>
                    </Box>
                  </StepContent>
                </Step>
              </Stepper>
            </DialogContent>
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              TransitionComponent={Slide}
          >
            <Alert
                onClose={handleCloseSnackbar}
                severity={snackbar.severity}
                sx={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)' }}
                variant="filled"
            >
              {snackbar.message}
            </Alert>
          </Snackbar>

          {/* Floating action button */}
          {!selectedMaterial && (
              <StyledFab
                  color="primary"
                  aria-label="help"
                  onClick={() => {
                    setSnackbar({
                      open: true,
                      message: 'Help system will be available soon!',
                      severity: 'info'
                    });
                  }}
              >
                <Help />
              </StyledFab>
          )}
        </Box>
      </ThemeProvider>
  );
};

// Material Detail View Component
const MaterialDetailView = ({ material, onBack, onReview, onEditReview, onDeleteReview, reviewerId }) => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  // Check if the current reviewer is the author of a review
  const isReviewAuthor = (review) => {
    return review.reviewer?.id === reviewerId;
  };

  // Check if the material has been reviewed by the current reviewer
  const hasReviewedMaterial = material.reviews?.some(review => isReviewAuthor(review));

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
      <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={onBack}
              sx={{ mr: 2 }}
          >
            Back
          </Button>

          <Breadcrumbs aria-label="breadcrumb">
            <Link
                underline="hover"
                color="inherit"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onBack();
                }}
                sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Home sx={{ mr: 0.5 }} fontSize="inherit" />
              Home
            </Link>
            <Link
                underline="hover"
                color="inherit"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onBack();
                }}
                sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Assignment sx={{ mr: 0.5 }} fontSize="inherit" />
              Materials
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <Description sx={{ mr: 0.5 }} fontSize="inherit" />
              {material.name}
            </Typography>
          </Breadcrumbs>
        </Box>

        <motion.div variants={itemVariants}>
          <GlassCard sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                  {material.name}
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip
                      label={material.type?.name || 'Unknown Type'}
                      icon={<Category />}
                      variant="outlined"
                  />
                  <StatusChip
                      label={material.status?.name || 'Unknown'}
                      status={material.status?.name}
                  />
                  <Chip
                      label={`Language: ${material.language?.name || 'Unknown'}`}
                      icon={<Translate />}
                      variant="outlined"
                  />
                  <Chip
                      label={`Target: ${material.targetAudience?.name || 'General'}`}
                      icon={<People />}
                      variant="outlined"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
                {!hasReviewedMaterial && (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<RateReview />}
                        onClick={() => onReview()}
                        sx={{
                          borderRadius: '50px',
                          px: 3,
                          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                          background: 'linear-gradient(45deg, #3f51b5, #f50057)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #303f9f, #c51162)',
                            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                          }
                        }}
                    >
                      Add Review
                    </Button>
                )}
              </Grid>
            </Grid>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Box sx={{ mb: 3 }}>
            <AppBar position="static" color="default" elevation={0} sx={{ borderRadius: '16px' }}>
              <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  aria-label="material details tabs"
                  variant={isMobile ? "scrollable" : "fullWidth"}
                  scrollButtons={isMobile ? "auto" : false}
                  allowScrollButtonsMobile
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{ borderRadius: '16px' }}
              >
                <Tab label="Description" icon={<Description />} iconPosition="start" />
                <Tab label="Task Context" icon={<Assignment />} iconPosition="start" />
                <Tab label="Reviews" icon={<Comment />} iconPosition="start" />
                <Tab label="Additional Info" icon={<Info />} iconPosition="start" />
              </Tabs>
            </AppBar>
          </Box>
        </motion.div>

        <motion.div variants={itemVariants}>
          <TabPanel value={activeTab} index={0}>
            <GlassCard>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {material.description || 'No description available for this material.'}
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Keywords
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {material.keywords?.length > 0 ?
                    material.keywords.map((keyword, index) => (
                        <Chip
                            key={index}
                            label={keyword.name}
                            variant="outlined"
                            sx={{
                              background: alpha(theme.palette.primary.main, 0.1),
                              borderColor: 'transparent'
                            }}
                        />
                    )) :
                    <Typography variant="body2" color="textSecondary">
                      No keywords specified
                    </Typography>
                }
              </Box>
            </GlassCard>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <GlassCard>
                  <Typography variant="h6" gutterBottom>
                    Task Information
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      {material.task?.name || 'Unknown Task'}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {material.task?.description || 'No task description available.'}
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Deadline
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {formatDate(material.task?.deadline)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Flag sx={{ mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Priority
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {material.task?.priority || 'Not set'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Info sx={{ mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Status
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {material.task?.status?.name || 'Unknown'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </GlassCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <GlassCard>
                  <Typography variant="h6" gutterBottom>
                    Project Context
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      {material.task?.project?.name || 'Unknown Project'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Business sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Client
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {material.task?.project?.client?.name || 'Unknown Client'}
                      </Typography>
                    </Box>
                  </Box>
                </GlassCard>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            {material.reviews?.length > 0 ? (
                <Stack spacing={3}>
                  {material.reviews.map((review, index) => (
                      <GlassCard key={index}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AnimatedAvatar
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.2 }}
                                sx={{ width: 40, height: 40, mr: 2 }}
                            >
                              {review.reviewer?.name?.[0] || 'R'}
                            </AnimatedAvatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {review.reviewer?.name} {review.reviewer?.surname}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {formatDate(review.reviewDate)}
                              </Typography>
                            </Box>
                          </Box>

                          <Box>
                            {/* Edit/Delete buttons for reviewer's own reviews */}
                            {isReviewAuthor(review) && (
                                <Box>
                                  <IconButton
                                      size="small"
                                      color="primary"
                                      onClick={() => onEditReview(review.id)}
                                      sx={{ mr: 1 }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => onDeleteReview(review.id)}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Box>
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                          <Chip
                              label={review.materialSummary?.name || 'No assessment'}
                              color={
                                review.materialSummary?.name?.toLowerCase().includes('approve') ? 'success' :
                                    review.materialSummary?.name?.toLowerCase().includes('reject') ? 'error' :
                                        'default'
                              }
                          />

                          {review.rating > 0 && (
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <StyledRating value={review.rating} readOnly precision={0.5} />
                                <Typography variant="body2" sx={{ ml: 1 }}>
                                  ({review.rating})
                                </Typography>
                              </Box>
                          )}
                        </Box>

                        <Box sx={{ mb: 3 }}>
                          <Typography variant="h6" gutterBottom>
                            Comments
                          </Typography>
                          <Typography variant="body1" sx={{
                            p: 2,
                            borderRadius: '12px',
                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                            border: '1px solid',
                            borderColor: alpha(theme.palette.divider, 0.1)
                          }}>
                            {review.comments || 'No comments provided.'}
                          </Typography>
                        </Box>

                        {review.suggestedChange && (
                            <Box>
                              <Typography variant="h6" gutterBottom>
                                Suggested Changes
                              </Typography>
                              <Typography variant="body1" sx={{
                                p: 2,
                                borderRadius: '12px',
                                bgcolor: alpha(theme.palette.background.paper, 0.5),
                                border: '1px solid',
                                borderColor: alpha(theme.palette.divider, 0.1)
                              }}>
                                {review.suggestedChange}
                              </Typography>
                            </Box>
                        )}
                      </GlassCard>
                  ))}
                </Stack>
            ) : (
                <GlassCard sx={{ textAlign: 'center', py: 5 }}>
                  <Comment sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No reviews yet
                  </Typography>
                  <Typography variant="body1" color="textSecondary" paragraph>
                    Be the first to review this material
                  </Typography>

                  {!hasReviewedMaterial && (
                      <Button
                          variant="contained"
                          color="primary"
                          startIcon={<RateReview />}
                          onClick={() => onReview()}
                          sx={{ mt: 2 }}
                      >
                        Add Review
                      </Button>
                  )}
                </GlassCard>
            )}

            {/* Add review button at the bottom if no review exists */}
            {!hasReviewedMaterial && material.reviews?.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Button
                      variant="contained"
                      color="primary"
                      startIcon={<RateReview />}
                      onClick={() => onReview()}
                  >
                    Add Your Review
                  </Button>
                </Box>
            )}
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <GlassCard>
                  <Typography variant="h6" gutterBottom>
                    Usage Information
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      License Type
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {material.licenceType?.name || 'Not specified'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Usage Restrictions
                    </Typography>
                    <Typography variant="body1">
                      {material.usageRestrictions?.description || 'No specific restrictions'}
                    </Typography>
                  </Box>
                </GlassCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <GlassCard>
                  <Typography variant="h6" gutterBottom>
                    Target Information
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Target Audience
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {material.targetAudience?.name || 'General audience'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Language
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {material.language?.name || 'Not specified'}
                    </Typography>
                  </Box>
                </GlassCard>
              </Grid>
            </Grid>
          </TabPanel>
        </motion.div>
      </motion.div>
  );
};


export default MaterialReviewPage;