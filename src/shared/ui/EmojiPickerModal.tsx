import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Check, Search, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/theme/ThemeProvider";
import { radius } from "@/theme/tokens";

export type EmojiCategory =
  | "All"
  | "Smileys"
  | "Gestures"
  | "Hearts"
  | "Party"
  | "Symbols";

export interface EmojiItem {
  emoji: string;
  name: string;
  category: "Smileys" | "Gestures" | "Hearts" | "Party" | "Symbols";
}

export const EMOJI_DICTIONARY: EmojiItem[] = [
  // Smileys & Emotion
  { emoji: "😀", name: "grinning face happy smile", category: "Smileys" },
  { emoji: "😃", name: "smiling face open mouth happy", category: "Smileys" },
  { emoji: "😄", name: "smiling face grinning eyes happy", category: "Smileys" },
  { emoji: "😁", name: "beaming face grinning eyes beam", category: "Smileys" },
  { emoji: "😆", name: "grinning squinting face laugh laughing haha", category: "Smileys" },
  { emoji: "😅", name: "grinning face with sweat relief phew whew", category: "Smileys" },
  { emoji: "😂", name: "tears of joy lol laughing haha crying funny", category: "Smileys" },
  { emoji: "🤣", name: "rolling on floor laughing rofl lmao haha", category: "Smileys" },
  { emoji: "🥲", name: "smiling face with tear bittersweet proud", category: "Smileys" },
  { emoji: "🥹", name: "holding back tears emotional touched puppy eyes", category: "Smileys" },
  { emoji: "😊", name: "smiling face with smiling eyes blush warm", category: "Smileys" },
  { emoji: "😇", name: "smiling face with halo angel innocent blessed", category: "Smileys" },
  { emoji: "🙂", name: "slightly smiling face ok fine", category: "Smileys" },
  { emoji: "🙃", name: "upside down face silly sarcasm ironic", category: "Smileys" },
  { emoji: "😉", name: "winking face wink playful flirt", category: "Smileys" },
  { emoji: "😌", name: "relieved face peaceful calm zen", category: "Smileys" },
  { emoji: "😍", name: "heart eyes love adore romantic crush", category: "Smileys" },
  { emoji: "🥰", name: "smiling face with hearts love affectionate sweet", category: "Smileys" },
  { emoji: "😘", name: "face blowing kiss kiss love flirt mwah", category: "Smileys" },
  { emoji: "😗", name: "kissing face kiss sweet", category: "Smileys" },
  { emoji: "😙", name: "kissing face smiling eyes kiss love", category: "Smileys" },
  { emoji: "😚", name: "kissing face closed eyes kiss cute", category: "Smileys" },
  { emoji: "😋", name: "face savoring food yum delicious yummy tasty", category: "Smileys" },
  { emoji: "😛", name: "face with tongue playful silly joke", category: "Smileys" },
  { emoji: "😝", name: "squinting face tongue playful goofy crazy", category: "Smileys" },
  { emoji: "😜", name: "winking face tongue crazy playful wink", category: "Smileys" },
  { emoji: "🤪", name: "zany face wacky goofy crazy wild derp", category: "Smileys" },
  { emoji: "🤨", name: "raised eyebrow suspicious skeptical doubt suspect", category: "Smileys" },
  { emoji: "🧐", name: "monocle curious investigating smart hm nerd", category: "Smileys" },
  { emoji: "🤓", name: "nerd face geek smart intelligent studious", category: "Smileys" },
  { emoji: "😎", name: "sunglasses cool awesome boss dope stylish", category: "Smileys" },
  { emoji: "🥸", name: "disguised face spy incognito disguise secret", category: "Smileys" },
  { emoji: "🤩", name: "star-struck excited amazing wow stars star", category: "Smileys" },
  { emoji: "🥳", name: "partying face celebrate party birthday woohoo", category: "Smileys" },
  { emoji: "😏", name: "smirking face smirk flirt sly smug suspicious", category: "Smileys" },
  { emoji: "😒", name: "unamused face annoyed unimpressed bored meh", category: "Smileys" },
  { emoji: "😞", name: "disappointed face sad bummed down regret", category: "Smileys" },
  { emoji: "😔", name: "pensive face reflective sad remorseful sorry", category: "Smileys" },
  { emoji: "😟", name: "worried face concern anxious nervous uneasy", category: "Smileys" },
  { emoji: "😕", name: "confused face puzzled huh what shrug", category: "Smileys" },
  { emoji: "🙁", name: "slightly frowning face sad unhappy displeased", category: "Smileys" },
  { emoji: "😣", name: "persevering face struggling tough effort hold on", category: "Smileys" },
  { emoji: "😖", name: "confounded face distressed suffering oof", category: "Smileys" },
  { emoji: "😫", name: "tired face exhausted stressed fed up done", category: "Smileys" },
  { emoji: "😩", name: "weary face tired frustrated oh no whine", category: "Smileys" },
  { emoji: "🥺", name: "pleading face please beg puppy eyes cute ask", category: "Smileys" },
  { emoji: "😢", name: "crying face sad tear upset emotional", category: "Smileys" },
  { emoji: "😭", name: "loudly crying face sob bawling heartbroken cry", category: "Smileys" },
  { emoji: "😤", name: "steam from nose angry proud determined huff", category: "Smileys" },
  { emoji: "😠", name: "angry face mad upset irritated annoyed", category: "Smileys" },
  { emoji: "😡", name: "pouting face enraged furious red angry rage", category: "Smileys" },
  { emoji: "🤬", name: "symbols on mouth swearing cursing fuming mad", category: "Smileys" },
  { emoji: "🤯", name: "exploding head mind blown shock amazed wow boom", category: "Smileys" },
  { emoji: "😳", name: "flushed face embarrassed shocked blush wide eyes", category: "Smileys" },
  { emoji: "🥵", name: "hot face sweating spicy fever heat thirsty", category: "Smileys" },
  { emoji: "🥶", name: "cold face freezing ice frosty chilly brr", category: "Smileys" },
  { emoji: "😱", name: "face screaming fear scared terrified shock omg scream", category: "Smileys" },
  { emoji: "😨", name: "fearful face scared frightened nervous fear", category: "Smileys" },
  { emoji: "😰", name: "anxious face sweat nervous worry pressure panic", category: "Smileys" },
  { emoji: "😥", name: "sad relieved face whew close call phew", category: "Smileys" },
  { emoji: "😓", name: "downcast face sweat stress hard work", category: "Smileys" },
  { emoji: "🤗", name: "smiling face open hands hug warmth embrace", category: "Smileys" },
  { emoji: "🤔", name: "thinking face hmm ponder wonder consider idea question", category: "Smileys" },
  { emoji: "🫣", name: "face with peeking eye shy nervous cannot look peek", category: "Smileys" },
  { emoji: "🤭", name: "face hand over mouth giggle oops secretive chuckle", category: "Smileys" },
  { emoji: "🤫", name: "shushing face shh quiet secret silence mute hush", category: "Smileys" },
  { emoji: "🤥", name: "lying face liar pinocchio dishonest lie", category: "Smileys" },
  { emoji: "😶", name: "face without mouth speechless quiet mute silence", category: "Smileys" },
  { emoji: "😐", name: "neutral face blank deadpan expressionless poker", category: "Smileys" },
  { emoji: "😑", name: "expressionless face unamused straight face done", category: "Smileys" },
  { emoji: "😬", name: "grimacing face awkward yikes cringe oops bite", category: "Smileys" },
  { emoji: "🙄", name: "face rolling eyes eye roll whatever duh boring", category: "Smileys" },
  { emoji: "😯", name: "hushed face surprised wow oh gasped", category: "Smileys" },
  { emoji: "😦", name: "frowning face open mouth gasp shocked dismay", category: "Smileys" },
  { emoji: "😧", name: "anguished face stunned hurt disbelief shocked", category: "Smileys" },
  { emoji: "😮", name: "face with open mouth surprised whoa gasp whoah", category: "Smileys" },
  { emoji: "😲", name: "astonished face amazed shocked unbelievable stunned", category: "Smileys" },
  { emoji: "🥱", name: "yawning face tired sleepy bored yawn exhaust", category: "Smileys" },
  { emoji: "😴", name: "sleeping face sleep bedtime zzz goodnight dream", category: "Smileys" },
  { emoji: "🤤", name: "drooling face craving delicious sleepy hungry drool", category: "Smileys" },
  { emoji: "😪", name: "sleepy face snot bubble tired dozing nap", category: "Smileys" },
  { emoji: "😵", name: "face with crossed eyes dizzy knocked out dead ko", category: "Smileys" },
  { emoji: "🤐", name: "zipper mouth face sealed lips secret zip shutup", category: "Smileys" },
  { emoji: "🥴", name: "woozy face drunk tipsy confused groggy faded", category: "Smileys" },
  { emoji: "🤢", name: "nauseated face sick gross disgusted green illness", category: "Smileys" },
  { emoji: "🤮", name: "face vomiting puke sick gross barf throw up", category: "Smileys" },
  { emoji: "🤧", name: "sneezing face sick cold tissue flu sneeze", category: "Smileys" },
  { emoji: "😷", name: "medical mask sick quarantine covid health doctor", category: "Smileys" },
  { emoji: "🤒", name: "thermometer fever sick ill warm temperature", category: "Smileys" },
  { emoji: "🤕", name: "head bandage hurt injured ouch doctor pain", category: "Smileys" },
  { emoji: "🤑", name: "money mouth face rich cash wealth dollar rich", category: "Smileys" },
  { emoji: "🤠", name: "cowboy hat face western yeehaw howdy rodeo", category: "Smileys" },
  { emoji: "😈", name: "smiling devil horns mischievous evil naughty bad", category: "Smileys" },
  { emoji: "👿", name: "angry devil horns demon furious mad evil", category: "Smileys" },
  { emoji: "👹", name: "ogre monster japanese mask red creature", category: "Smileys" },
  { emoji: "🤡", name: "clown face foolish circus joker prank goofy", category: "Smileys" },
  { emoji: "💩", name: "pile of poo poop crap silly turd stinky", category: "Smileys" },
  { emoji: "👻", name: "ghost spooky halloween boo spirit haunt", category: "Smileys" },
  { emoji: "💀", name: "skull dead dying laughing skeleton bones rip", category: "Smileys" },
  { emoji: "☠️", name: "skull and crossbones poison danger death pirate", category: "Smileys" },
  { emoji: "👽", name: "alien extraterrestrial ufo sci-fi outer space", category: "Smileys" },
  { emoji: "👾", name: "alien monster arcade game 8bit pixel retro", category: "Smileys" },
  { emoji: "🤖", name: "robot bot ai tech machine android cyborg", category: "Smileys" },

  // Gestures & People
  { emoji: "👍", name: "thumbs up good yes approve like agree ok positive", category: "Gestures" },
  { emoji: "👎", name: "thumbs down bad no dislike disapprove negative", category: "Gestures" },
  { emoji: "👏", name: "clapping hands bravo applause congrats great clap", category: "Gestures" },
  { emoji: "🙌", name: "raising hands praise hooray celebration celebrate yay", category: "Gestures" },
  { emoji: "🫶", name: "heart hands love care affection cute sweetheart", category: "Gestures" },
  { emoji: "👐", name: "open hands hug embrace welcome jazz hands open", category: "Gestures" },
  { emoji: "🤲", name: "palms up together prayer bless offer dua humble", category: "Gestures" },
  { emoji: "🤝", name: "handshake deal agreement partnership shake hello", category: "Gestures" },
  { emoji: "🙏", name: "folded hands pray please thank you namaste thanks", category: "Gestures" },
  { emoji: "✌️", name: "peace sign victory two deuces peace out", category: "Gestures" },
  { emoji: "🤞", name: "crossed fingers luck wish hope promise lucky", category: "Gestures" },
  { emoji: "🫰", name: "finger heart snap kpop love money hand", category: "Gestures" },
  { emoji: "🤟", name: "love you gesture ily rock sign language love", category: "Gestures" },
  { emoji: "🤘", name: "sign horns rock on metal party rockstar", category: "Gestures" },
  { emoji: "🤙", name: "call me hand shaka hang loose chill phone surf", category: "Gestures" },
  { emoji: "👈", name: "pointing left point look there backhand", category: "Gestures" },
  { emoji: "👉", name: "pointing right point look that backhand", category: "Gestures" },
  { emoji: "👆", name: "pointing up point above top upward", category: "Gestures" },
  { emoji: "👇", name: "pointing down point below downward look", category: "Gestures" },
  { emoji: "☝️", name: "index pointing up attention first one listen wait", category: "Gestures" },
  { emoji: "✋", name: "raised hand stop high five palm halt pause", category: "Gestures" },
  { emoji: "🤚", name: "raised back of hand backhand stop back", category: "Gestures" },
  { emoji: "🖐️", name: "hand fingers splayed five high five open palm", category: "Gestures" },
  { emoji: "🖖", name: "vulcan salute spock star trek live long prosper", category: "Gestures" },
  { emoji: "👋", name: "waving hand wave hello hi goodbye bye greeting cya", category: "Gestures" },
  { emoji: "👌", name: "ok hand okay perfect fine correct good zero", category: "Gestures" },
  { emoji: "🤌", name: "pinched fingers italian chef kiss mama mia what", category: "Gestures" },
  { emoji: "🤏", name: "pinching hand tiny small little bit close tiny", category: "Gestures" },
  { emoji: "✊", name: "raised fist solidarity power strength protest fist", category: "Gestures" },
  { emoji: "👊", name: "oncoming fist punch fist bump bro pound hit", category: "Gestures" },
  { emoji: "🤛", name: "left-facing fist fist bump bro pound", category: "Gestures" },
  { emoji: "🤜", name: "right-facing fist fist bump bro pound", category: "Gestures" },
  { emoji: "✍️", name: "writing hand write notes pen homework sign", category: "Gestures" },
  { emoji: "💅", name: "nail polish slay sassy fabulous manicure mood", category: "Gestures" },
  { emoji: "🤳", name: "selfie photo camera smartphone pose picture", category: "Gestures" },
  { emoji: "💪", name: "flexed biceps muscle strong power fitness gym flex", category: "Gestures" },
  { emoji: "👀", name: "eyes looking look see watching suspicious ooh whoa", category: "Gestures" },
  { emoji: "👁️", name: "eye look vision observe watch looker", category: "Gestures" },
  { emoji: "👅", name: "tongue taste lick playful mouth", category: "Gestures" },
  { emoji: "👄", name: "mouth lips kiss red lip beauty", category: "Gestures" },
  { emoji: "🫦", name: "biting lip flirt anxious nervous sexy tension bite", category: "Gestures" },
  { emoji: "💋", name: "kiss mark lips romance love smooch makeup", category: "Gestures" },
  { emoji: "🫂", name: "people hugging hug comfort embrace support friends", category: "Gestures" },

  // Hearts & Romance
  { emoji: "❤️", name: "red heart love passion romance favorite heart", category: "Hearts" },
  { emoji: "🧡", name: "orange heart warm friendship love autumn", category: "Hearts" },
  { emoji: "💛", name: "yellow heart friendship happiness gold sunshine", category: "Hearts" },
  { emoji: "💚", name: "green heart nature organic health jealousy", category: "Hearts" },
  { emoji: "💙", name: "blue heart loyalty trust peace blue love ocean", category: "Hearts" },
  { emoji: "💜", name: "purple heart luxury compassion magic purple", category: "Hearts" },
  { emoji: "🤎", name: "brown heart warmth earth chocolate coffee", category: "Hearts" },
  { emoji: "🖤", name: "black heart dark gothic sorrow black emo", category: "Hearts" },
  { emoji: "🤍", name: "white heart pure innocent peace clear angelic", category: "Hearts" },
  { emoji: "💔", name: "broken heart heartbreak sad breakup pain hurt sorrow", category: "Hearts" },
  { emoji: "❤️‍🔥", name: "heart on fire burning passion intense desire lit", category: "Hearts" },
  { emoji: "❤️‍🩹", name: "mending heart healing recovery better bandage heal", category: "Hearts" },
  { emoji: "❣️", name: "heart exclamation punctuation love emphasis", category: "Hearts" },
  { emoji: "💕", name: "two hearts love affection pink hearts floating", category: "Hearts" },
  { emoji: "💞", name: "revolving hearts revolving love passion swirl", category: "Hearts" },
  { emoji: "💓", name: "beating heart heartbeat pulsing love alive pump", category: "Hearts" },
  { emoji: "💗", name: "growing heart pink heart expanding love sweet", category: "Hearts" },
  { emoji: "💖", name: "sparkling heart sparkle shiny love magic special", category: "Hearts" },
  { emoji: "💘", name: "heart with arrow cupid fallen in love shot romance", category: "Hearts" },
  { emoji: "💝", name: "heart with ribbon gift present valentine holiday", category: "Hearts" },
  { emoji: "💟", name: "heart decoration purple badge heart frame", category: "Hearts" },
  { emoji: "💌", name: "love letter envelope note romantic mail message", category: "Hearts" },
  { emoji: "💐", name: "bouquet flowers gift romantic pretty bloom spring", category: "Hearts" },
  { emoji: "🌹", name: "rose flower red romance love plant floral", category: "Hearts" },
  { emoji: "🥀", name: "wilted rose flower sad dying lost love dead", category: "Hearts" },
  { emoji: "🌸", name: "cherry blossom sakura pink spring flower bloom floral", category: "Hearts" },
  { emoji: "✨", name: "sparkles shiny magical stars clean new aesthetic clean", category: "Hearts" },

  // Party & Fun
  { emoji: "🎉", name: "party popper tada celebration celebrate congratulations yay", category: "Party" },
  { emoji: "🎊", name: "confetti ball party celebrate festive fun event", category: "Party" },
  { emoji: "🍾", name: "popping cork champagne celebrate drink booze toast wine", category: "Party" },
  { emoji: "🍻", name: "clinking beer mugs cheers toast drink beers pub alcohol", category: "Party" },
  { emoji: "🥂", name: "clinking glasses cheers toast champagne wine party sip", category: "Party" },
  { emoji: "🎂", name: "birthday cake bday dessert candles celebration food", category: "Party" },
  { emoji: "🍰", name: "shortcake cake sweet dessert slice sweet strawberry", category: "Party" },
  { emoji: "🎈", name: "balloon red party helium festival celebrate float", category: "Party" },
  { emoji: "🎁", name: "wrapped gift present birthday surprise box ribbon holiday", category: "Party" },
  { emoji: "🌟", name: "glowing star bright shining shiny night sky magic gold", category: "Party" },
  { emoji: "⭐", name: "star favorite rating gold star shine astronomy score", category: "Party" },
  { emoji: "💫", name: "dizzy star shooting star spark cosmic swirl magic", category: "Party" },
  { emoji: "🔥", name: "fire flame lit hot blaze trending hype warm heat", category: "Party" },
  { emoji: "💥", name: "collision boom explosion bang pow blast crash", category: "Party" },
  { emoji: "💯", name: "hundred points 100 percent perfect score real legit", category: "Party" },
  { emoji: "🏆", name: "trophy winner award first champion cup gold champion", category: "Party" },
  { emoji: "🥇", name: "1st place medal gold winner champion first win", category: "Party" },
  { emoji: "🥈", name: "2nd place medal silver runner up second silver", category: "Party" },
  { emoji: "🥉", name: "3rd place medal bronze third medal award", category: "Party" },
  { emoji: "🎯", name: "bullseye direct hit target goal archery aim exact spot", category: "Party" },
  { emoji: "🎮", name: "video game controller gaming play console gamer joystick", category: "Party" },
  { emoji: "🎲", name: "game die dice lucky gamble boardgame roll random", category: "Party" },
  { emoji: "🚀", name: "rocket spaceship launch blastoff fast future crypto moon", category: "Party" },
  { emoji: "🛸", name: "flying saucer ufo alien sci-fi spaceship invader", category: "Party" },
  { emoji: "👑", name: "crown king queen royalty royal winner leader boss prince", category: "Party" },
  { emoji: "💎", name: "gem stone diamond jewel precious expensive luxury shiny rich", category: "Party" },
  { emoji: "💰", name: "money bag cash rich wealth dollar finance profit sack", category: "Party" },
  { emoji: "💸", name: "money with wings flying cash spent lost bills paid spend", category: "Party" },

  // Symbols & Everyday
  { emoji: "💡", name: "light bulb idea smart bright eureka innovation concept lamp", category: "Symbols" },
  { emoji: "⚡", name: "high voltage lightning electric storm shock energy zap power", category: "Symbols" },
  { emoji: "🌈", name: "rainbow colors pride weather sky beauty colorful sunny", category: "Symbols" },
  { emoji: "☀️", name: "sun sunny weather bright warm daylight sunshine hot", category: "Symbols" },
  { emoji: "🌙", name: "crescent moon night evening sleep dreams lunar sky", category: "Symbols" },
  { emoji: "☁️", name: "cloud overcast sky weather cloudy puff smoke", category: "Symbols" },
  { emoji: "🌧️", name: "cloud rain rainy weather precipitation storm water drip", category: "Symbols" },
  { emoji: "❄️", name: "snowflake cold winter snow ice freeze chilly crystal", category: "Symbols" },
  { emoji: "☕", name: "hot beverage coffee tea morning break cafe cup espresso", category: "Symbols" },
  { emoji: "🍕", name: "pizza slice cheese italian food fastfood tasty eat", category: "Symbols" },
  { emoji: "🍔", name: "hamburger burger fast food beef lunch snack food", category: "Symbols" },
  { emoji: "🍟", name: "french fries potato fast food salty snack fries", category: "Symbols" },
  { emoji: "🌮", name: "taco mexican food wrap tortilla dinner tasty food", category: "Symbols" },
  { emoji: "🍦", name: "soft ice cream dessert dairy sweet swirl cone cold vanilla", category: "Symbols" },
  { emoji: "🍩", name: "doughnut donut pastry sweet glaze bakery food", category: "Symbols" },
  { emoji: "🍿", name: "popcorn cinema movie snack buttery film snack food", category: "Symbols" },
  { emoji: "🛡️", name: "shield protect defense armor secure guard security safety", category: "Symbols" },
  { emoji: "⚔️", name: "crossed swords fight battle war combat weapon duel blade", category: "Symbols" },
  { emoji: "🔔", name: "bell notification alert ring chime reminder subscribe ding", category: "Symbols" },
  { emoji: "🔕", name: "bell with slash mute silent notifications off silence quiet quiet", category: "Symbols" },
  { emoji: "📢", name: "loudspeaker announcement broadcast news speak loud alert voice", category: "Symbols" },
  { emoji: "💬", name: "speech balloon chat talk message speaking bubble sms conversation", category: "Symbols" },
  { emoji: "💭", name: "thought balloon thinking daydream ponder imagine think", category: "Symbols" },
  { emoji: "✔️", name: "check mark correct right yes done complete verified ok mark", category: "Symbols" },
  { emoji: "❌", name: "cross mark x wrong no incorrect cancel delete reject bad", category: "Symbols" },
  { emoji: "❓", name: "red question mark help ask query confusion what why", category: "Symbols" },
  { emoji: "❗", name: "red exclamation mark warning alert caution danger important wow", category: "Symbols" },
  { emoji: "⚠️", name: "warning sign alert hazard danger careful notice caution yield", category: "Symbols" },
  { emoji: "⛔", name: "no entry stop forbidden denied prohibited barrier banned", category: "Symbols" },
  { emoji: "🚫", name: "prohibited forbidden banned denied no stop restricted ban", category: "Symbols" },
];

const CATEGORIES: EmojiCategory[] = [
  "All",
  "Smileys",
  "Gestures",
  "Hearts",
  "Party",
  "Symbols",
];

export interface EmojiPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  title?: string;
  closeOnSelect?: boolean;
}

export function EmojiPickerModal({
  visible,
  onClose,
  onSelectEmoji,
  title = "Choose Emoji",
  closeOnSelect = false,
}: EmojiPickerModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EmojiCategory>("All");

  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (!visible) {
      setSearchQuery("");
      setSelectedCategory("All");
    }
  }

  const filteredEmojis = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return EMOJI_DICTIONARY.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" || item.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!query) return true;
      return (
        item.emoji.includes(query) ||
        item.name.toLowerCase().includes(query)
      );
    });
  }, [searchQuery, selectedCategory]);

  const handleSelect = (emoji: string) => {
    onSelectEmoji(emoji);
    if (closeOnSelect) {
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable
          accessibilityLabel="Close emoji picker"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.sheetContainer}
        >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surfaceContainer,
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
          >
            {/* Drag Handle */}
            <View style={styles.handleWrap}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: colors.outlineVariant },
                ]}
              />
            </View>

            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.onSurface }]}>
                {title}
              </Text>
              <View style={styles.headerActions}>
                {!closeOnSelect && (
                  <Pressable
                    hitSlop={8}
                    onPress={onClose}
                    style={[
                      styles.doneBtn,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <Check size={16} color={colors.onPrimary} strokeWidth={2.5} />
                    <Text
                      style={[styles.doneBtnText, { color: colors.onPrimary }]}
                    >
                      Done
                    </Text>
                  </Pressable>
                )}
                <Pressable
                  hitSlop={8}
                  onPress={onClose}
                  style={styles.closeBtn}
                >
                  <X size={20} color={colors.onSurfaceVariant} />
                </Pressable>
              </View>
            </View>

            {/* Search Bar */}
            <View
              style={[
                styles.searchBar,
                {
                  backgroundColor: colors.surfaceContainerHighest,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <Search size={18} color={colors.onSurfaceVariant} />
              <TextInput
                autoCorrect={false}
                onChangeText={setSearchQuery}
                placeholder="Search emoji..."
                placeholderTextColor={colors.onSurfaceVariant}
                style={[styles.searchInput, { color: colors.onSurface }]}
                value={searchQuery}
              />
              {searchQuery.length > 0 && (
                <Pressable hitSlop={8} onPress={() => setSearchQuery("")}>
                  <X size={16} color={colors.onSurfaceVariant} />
                </Pressable>
              )}
            </View>

            {/* Category Pills */}
            <View style={styles.categoryScrollWrap}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryList}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      style={[
                        styles.categoryPill,
                        {
                          backgroundColor: isSelected
                            ? colors.primary
                            : colors.surfaceContainerHighest,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          {
                            color: isSelected
                              ? colors.onPrimary
                              : colors.onSurfaceVariant,
                            fontWeight: isSelected ? "700" : "500",
                          },
                        ]}
                      >
                        {cat}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            {/* Emoji Grid */}
            <ScrollView
              keyboardShouldPersistTaps="always"
              showsVerticalScrollIndicator={false}
              style={styles.gridScroll}
              contentContainerStyle={styles.gridContent}
            >
              {filteredEmojis.length > 0 ? (
                <View style={styles.grid}>
                  {filteredEmojis.map((item) => (
                    <Pressable
                      accessibilityLabel={item.name}
                      key={`${item.category}-${item.emoji}`}
                      onPress={() => handleSelect(item.emoji)}
                      style={({ pressed }) => [
                        styles.gridItem,
                        pressed && styles.gridItemPressed,
                      ]}
                    >
                      <Text style={styles.gridEmoji}>{item.emoji}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyWrap}>
                  <Text
                    style={[
                      styles.emptyText,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    {`No emojis found for "${searchQuery}"`}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const createStyles = (
  colors: ReturnType<typeof useTheme>["theme"]["colors"],
) =>
  StyleSheet.create({
    categoryList: {
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    categoryPill: {
      borderRadius: radius.full,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    categoryScrollWrap: {
      marginBottom: 8,
    },
    categoryText: {
      fontSize: 13,
    },
    closeBtn: {
      borderRadius: radius.full,
      padding: 4,
    },
    doneBtn: {
      alignItems: "center",
      borderRadius: radius.full,
      flexDirection: "row",
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    doneBtnText: {
      fontSize: 13,
      fontWeight: "700",
    },
    emptyText: {
      fontSize: 14,
      textAlign: "center",
    },
    emptyWrap: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-start",
    },
    gridContent: {
      paddingBottom: 24,
      paddingHorizontal: 10,
    },
    gridEmoji: {
      fontSize: 28,
    },
    gridItem: {
      alignItems: "center",
      borderRadius: 12,
      height: 44,
      justifyContent: "center",
      width: `${100 / 7}%`,
    },
    gridItemPressed: {
      backgroundColor: colors.surfaceContainerHighest,
      transform: [{ scale: 1.2 }],
    },
    gridScroll: {
      maxHeight: 340,
    },
    handle: {
      borderRadius: 2,
      height: 4,
      width: 36,
    },
    handleWrap: {
      alignItems: "center",
      paddingBottom: 8,
    },
    headerActions: {
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
    },
    overlay: {
      backgroundColor: "rgba(0,0,0,0.35)",
      flex: 1,
      justifyContent: "flex-end",
    },
    searchBar: {
      alignItems: "center",
      borderRadius: 14,
      borderWidth: 1,
      flexDirection: "row",
      gap: 8,
      marginHorizontal: 16,
      marginBottom: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      padding: 0,
    },
    sheet: {
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      maxHeight: 520,
      paddingTop: 12,
      width: "100%",
    },
    sheetContainer: {
      width: "100%",
    },
    sheetHeader: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: 10,
      paddingHorizontal: 16,
    },
    sheetTitle: {
      fontSize: 17,
      fontWeight: "700",
    },
  });
