// ======================
// LUCIDE-REACT-NATIVE USAGE GUIDE
// ======================

import {
// Authentication Icons
Eye,
EyeOff,
Mail,
Lock,
User,
UserPlus,
LogIn,
LogOut,

// Common Icons
Check,
X,
AlertCircle,
Info,
ChevronRight,
ChevronLeft,
Menu,
Search,

// Social Icons
MessageCircle,
Heart,
Share2,

// Navigation
Home,
Settings,
Bell,
MapPin,
Phone,

// Status Icons
Loader,
CheckCircle,
AlertTriangle,

} from "lucide-react-native";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { darkColors } from "@/theme/tokens";

// ✅ BASIC USAGE

// 1. Simple Icon
<Check size={24} color="#10B981" />

// 2. With Stroke Width
<AlertCircle size={28} color="#EF4444" strokeWidth={2.5} />

// 3. In a Button
<TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
<LogIn size={20} color={darkColors.primary} />
<Text>Login</Text>
</TouchableOpacity>

// 4. Password Toggle Button
const [showPassword, setShowPassword] = useState(false);

<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
{showPassword ? (
<EyeOff size={20} color={darkColors.mutedText} />
) : (
<Eye size={20} color={darkColors.mutedText} />
)}
</TouchableOpacity>

// 5. Input Field with Icon
<View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: darkColors.outline }}>
<Mail size={20} color={darkColors.mutedText} />
<TextInput
placeholder="Enter email"
style={{ flex: 1, marginLeft: 8, padding: 8 }}
/>
</View>

// 6. Status Icons
<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
<CheckCircle size={20} color="#10B981" />
<Text>Account verified</Text>
</View>

// 7. Loading Spinner
<Loader size={24} color={darkColors.primary} />

// 8. Custom Sized Icons
<Check size={16} color="white" /> // Small
<Check size={24} color="white" /> // Medium
<Check size={32} color="white" /> // Large
<Check size={48} color="white" /> // Extra Large

// 9. Icon Colors from Theme
<Heart size={24} color={darkColors.accent} />
<Settings size={24} color={darkColors.primary} />
<AlertTriangle size={24} color={darkColors.error} />

// ✅ COMMON ICON SIZES

const ICON_SIZES = {
xs: 16, // Extra small - labels, badges
sm: 20, // Small - navigation, labels
md: 24, // Medium - buttons, inputs
lg: 32, // Large - headers, featured
xl: 48, // Extra large - splash screens
};

// Usage in components
<Check size={ICON_SIZES.md} color={darkColors.primary} />

// ✅ FOR YOUR AUTH SCREENS

// AuthInput with Icon
export function AuthInputWithIcon({ icon: Icon, ...props }) {
return (
<View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1 }}>
<Icon size={20} color={darkColors.mutedText} />
<TextInput {...props} style={{ flex: 1, marginLeft: 8 }} />
</View>
);
}

// Usage
<AuthInputWithIcon 
  icon={Mail} 
  placeholder="Email"
  value={email}
  onChangeText={setEmail}
/>

// ✅ LIST OF USEFUL ICONS FOR YOUR APP

// Authentication & User
Mail, Lock, Eye, EyeOff, User, UserPlus, LogIn, LogOut

// Messages & Chat
MessageCircle, Send, Copy, Share2, Bell

// Navigation
Home, ChevronRight, ChevronLeft, Menu, Settings, MapPin, Phone, Search

// Status
Check, X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader

// Social
Heart, Share2, MessageCircle

// More at: https://lucide.dev/
