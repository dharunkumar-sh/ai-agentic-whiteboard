"use client";
import React, { useState, useMemo, useDeferredValue, useCallback } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as LucideIcons from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { toast } from "@/components/ui/toast";

type Props = {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
};

interface NoteStyle {
  id: string;
  name: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  bgColor: string;
  strokeColor: string;
  accentColor: string;
  textColor: string;
  defaultText: string;
  previewBg: string;
  previewBorder: string;
}

const NOTE_STYLES: NoteStyle[] = [
  {
    id: "sticky",
    name: "Sticky Note",
    subtitle: "Warm idea card",
    tag: "New",
    tagColor: "bg-amber-100/90 text-amber-900 border-amber-200/90",
    bgColor: "#FEF9C3",
    strokeColor: "#F59E0B",
    accentColor: "#F59E0B",
    textColor: "#78350F",
    defaultText: "💡 Warm Idea\n\nWrite your thoughts here...",
    previewBg: "bg-[#FEF9C3]",
    previewBorder: "border-[#FDE68A]",
  },
  {
    id: "glass",
    name: "Glass Note",
    subtitle: "Polished meeting note",
    tag: "New",
    tagColor: "bg-blue-100/90 text-blue-900 border-blue-200/90",
    bgColor: "#EFF6FF",
    strokeColor: "#3B82F6",
    accentColor: "#2563EB",
    textColor: "#1E3A8A",
    defaultText: "📋 Meeting Notes\n\n• Discussion point 1\n• Discussion point 2\n• Next steps",
    previewBg: "bg-[#EFF6FF]",
    previewBorder: "border-[#BFDBFE]",
  },
  {
    id: "task",
    name: "Task Card",
    subtitle: "Structured checklist tile",
    tag: "New",
    tagColor: "bg-emerald-100/90 text-emerald-900 border-emerald-200/90",
    bgColor: "#ECFDF5",
    strokeColor: "#10B981",
    accentColor: "#059669",
    textColor: "#064E3B",
    defaultText: "✅ Task Checklist\n\n[ ] Todo item 1\n[ ] Todo item 2\n[ ] Review & deploy",
    previewBg: "bg-[#ECFDF5]",
    previewBorder: "border-[#A7F3D0]",
  },
  {
    id: "sprint",
    name: "Sprint Card",
    subtitle: "Roadmap & feature milestone",
    tag: "New",
    tagColor: "bg-purple-100/90 text-purple-900 border-purple-200/90",
    bgColor: "#FAF5FF",
    strokeColor: "#A855F7",
    accentColor: "#9333EA",
    textColor: "#581C87",
    defaultText: "🚀 Feature Milestone\n\n• Goal:\n• Owner:\n• Target Date:",
    previewBg: "bg-[#FAF5FF]",
    previewBorder: "border-[#E9D5FF]",
  },
  {
    id: "rose",
    name: "Brainstorm Note",
    subtitle: "Creative feedback & ideation",
    tag: "New",
    tagColor: "bg-rose-100/90 text-rose-900 border-rose-200/90",
    bgColor: "#FFF1F2",
    strokeColor: "#F43F5E",
    accentColor: "#E11D48",
    textColor: "#881337",
    defaultText: "✨ Creative Spark\n\n• Inspiration:\n• Key takeaway:",
    previewBg: "bg-[#FFF1F2]",
    previewBorder: "border-[#FECDD3]",
  },
  {
    id: "dark",
    name: "Dark Obsidian",
    subtitle: "Sleek SaaS dark card",
    tag: "New",
    tagColor: "bg-slate-800 text-sky-300 border-slate-700",
    bgColor: "#0F172A",
    strokeColor: "#38BDF8",
    accentColor: "#38BDF8",
    textColor: "#F8FAFC",
    defaultText: "🖤 Obsidian Card\n\n• System architecture\n• High performance\n• Encrypted nodes",
    previewBg: "bg-[#0F172A]",
    previewBorder: "border-sky-500/50",
  },
  {
    id: "neon",
    name: "Neon Cyber",
    subtitle: "Electric highlight tile",
    tag: "New",
    tagColor: "bg-fuchsia-100/90 text-fuchsia-900 border-fuchsia-200/90",
    bgColor: "#FDF4FF",
    strokeColor: "#D946EF",
    accentColor: "#C026D3",
    textColor: "#701A75",
    defaultText: "⚡ High Priority\n\n• Urgent blocker\n• Action required ASAP",
    previewBg: "bg-[#FDF4FF]",
    previewBorder: "border-[#F5D0FE]",
  },
  {
    id: "blueprint",
    name: "Blueprint Card",
    subtitle: "Technical specification card",
    tag: "New",
    tagColor: "bg-teal-100/90 text-teal-900 border-teal-200/90",
    bgColor: "#F0FDFA",
    strokeColor: "#0D9488",
    accentColor: "#0F766E",
    textColor: "#134E4A",
    defaultText: "📐 Technical Spec\n\n• Schema & Contract:\n• API Endpoint:\n• Latency SLA:",
    previewBg: "bg-[#F0FDFA]",
    previewBorder: "border-[#99F6E4]",
  },
];

interface EmojiItem {
  char: string;
  name: string;
  keywords: string;
}

interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  items: EmojiItem[];
}

const EMOJI_DATA: EmojiCategory[] = [
  {
    id: "popular",
    name: "Popular & Frequent",
    icon: "🔥",
    items: [
      { char: "💡", name: "Light Bulb", keywords: "idea bulb smart light think innovate solution bright" },
      { char: "🚀", name: "Rocket", keywords: "rocket launch startup fast blast space speed fly" },
      { char: "🔥", name: "Fire", keywords: "fire flame lit hot trend trending burn popular" },
      { char: "✨", name: "Sparkles", keywords: "sparkles magic shine clean star polish new glitter ai" },
      { char: "🎯", name: "Target", keywords: "target goal aim focus bullseye hit accurate" },
      { char: "⭐", name: "Star", keywords: "star favorite rating bookmark yellow golden" },
      { char: "🎉", name: "Party Popper", keywords: "party celebrate celebration tada congratulations congrats" },
      { char: "❤️", name: "Red Heart", keywords: "heart love like favorite red romance" },
      { char: "👍", name: "Thumbs Up", keywords: "thumbs up approve yes ok like agree good perfect accept" },
      { char: "👏", name: "Clapping Hands", keywords: "clap clapping hands applause praise bravo" },
      { char: "✅", name: "Check Mark", keywords: "check mark green done verified success correct complete task" },
      { char: "⚡", name: "Lightning", keywords: "lightning bolt electric power energy fast zap flash shock" },
      { char: "💯", name: "Hundred Points", keywords: "hundred 100 percent score perfect keep it real" },
      { char: "💎", name: "Diamond", keywords: "diamond gem jewel luxury premium crystal valuable" },
      { char: "🏆", name: "Trophy", keywords: "trophy winner award first champion cup gold victory" },
      { char: "🌟", name: "Glowing Star", keywords: "star glowing shine glitter bright special" },
      { char: "🙌", name: "Raising Hands", keywords: "hands raise celebrate hooray praise high five" },
      { char: "🤩", name: "Star-Struck", keywords: "star eyes excited wow amazed starstruck" },
      { char: "🧠", name: "Brain", keywords: "brain think mind smart intelligent memory idea genius" },
      { char: "📌", name: "Pushpin", keywords: "pin pushpin note remember notice mark location" },
      { char: "🎨", name: "Artist Palette", keywords: "art paint palette color design creative draw" },
      { char: "📊", name: "Bar Chart", keywords: "chart stats graph analytics report diagram business metric" },
      { char: "🔒", name: "Lock", keywords: "lock secure security safe privacy password encrypted" },
      { char: "🔑", name: "Key", keywords: "key unlock access password auth security secret" },
    ],
  },
  {
    id: "smileys",
    name: "Smileys & People",
    icon: "😀",
    items: [
      { char: "😀", name: "Grinning Face", keywords: "smile happy joy laugh grinning cheerful" },
      { char: "😃", name: "Big Eyed Smile", keywords: "happy joy smile cheerful delighted" },
      { char: "😄", name: "Smiling Eyes", keywords: "happy laugh joy smile pleased" },
      { char: "😁", name: "Beaming Face", keywords: "grin beaming teeth smile happy" },
      { char: "😆", name: "Grinning Squinting", keywords: "laugh haha lol amused satisfied" },
      { char: "😅", name: "Sweat Smile", keywords: "sweat relief nervous awkward whew" },
      { char: "😂", name: "Tears of Joy", keywords: "laugh lol cry laughing crying dying dead rofl" },
      { char: "🤣", name: "Rolling on Floor Laughing", keywords: "rofl laugh haha hilarious lmao" },
      { char: "🥲", name: "Smiling Tear", keywords: "tear bittersweet proud happy crying emotional" },
      { char: "☺️", name: "Smiling Face", keywords: "blush calm warm content gentle" },
      { char: "😊", name: "Smiling with Eyes", keywords: "blush happy pleased friendly shy" },
      { char: "😇", name: "Angel", keywords: "angel halo innocent good holy pure" },
      { char: "🙂", name: "Slight Smile", keywords: "fine okay smile friendly polite" },
      { char: "🙃", name: "Upside-Down Face", keywords: "sarcasm ironic upside down silly goofy" },
      { char: "😉", name: "Winking Face", keywords: "wink playful flirt joke kidding" },
      { char: "😌", name: "Relieved Face", keywords: "relieved zen calm peaceful relaxed" },
      { char: "😍", name: "Heart Eyes", keywords: "love heart eyes crush romance adore" },
      { char: "🥰", name: "Smiling with Hearts", keywords: "hearts loved loved loved in love affection" },
      { char: "😘", name: "Blowing Kiss", keywords: "kiss kissy love affection blow kiss" },
      { char: "😋", name: "Yummy Face", keywords: "yum tasty delicious tongue lick hungry" },
      { char: "😛", name: "Tongue Out", keywords: "tongue silly playful goofy joke" },
      { char: "😜", name: "Wink Tongue", keywords: "wink tongue crazy party funny" },
      { char: "🤪", name: "Zany Face", keywords: "crazy zany wild weird party goofy" },
      { char: "🤨", name: "Raised Eyebrow", keywords: "skeptical doubt suspicious eyebrow mistrust" },
      { char: "🧐", name: "Monocle Face", keywords: "monocle analyze investigate smart classy inspect" },
      { char: "🤓", name: "Nerd Face", keywords: "nerd geek glasses smart study tech code" },
      { char: "😎", name: "Cool Sunglasses", keywords: "cool sunglasses shades chill confident boss" },
      { char: "🥸", name: "Disguise", keywords: "disguise undercover spy mustache glasses" },
      { char: "🥳", name: "Partying Face", keywords: "party celebrate birthday hat horn festive" },
      { char: "😏", name: "Smirking Face", keywords: "smirk sly playful flirt teasing" },
      { char: "😒", name: "Unamused Face", keywords: "unamused annoyed bored unimpressed side eye" },
      { char: "😞", name: "Disappointed Face", keywords: "sad disappointed down regret sorry" },
      { char: "😔", name: "Pensive Face", keywords: "sad thoughtful depressed down melancholy" },
      { char: "😟", name: "Worried Face", keywords: "worried anxious concerned nervous" },
      { char: "😕", name: "Confused Face", keywords: "confused unsure puzzled puzzled" },
      { char: "🙁", name: "Slightly Frowning", keywords: "frown unhappy sad upset" },
      { char: "☹️", name: "Frowning Face", keywords: "frown very sad unhappy distressed" },
      { char: "😣", name: "Persevering Face", keywords: "struggle pain endure suffering" },
      { char: "😖", name: "Confounded Face", keywords: "quiver frustrated annoyed upset" },
      { char: "😫", name: "Tired Face", keywords: "tired exhausted yawn sleepy overwhelmed" },
      { char: "😩", name: "Weary Face", keywords: "weary frustrated distressed drained" },
      { char: "🥺", name: "Pleading Face", keywords: "please puppy eyes begging cute emotional" },
      { char: "😢", name: "Crying Face", keywords: "cry tear sad heartbroken upset" },
      { char: "😭", name: "Loudly Crying", keywords: "sob crying tears stream bawling overwhelmed" },
      { char: "😤", name: "Triumph / Steam", keywords: "steam nose proud victory huff angry" },
      { char: "😠", name: "Angry Face", keywords: "angry mad annoyed furious grumpy" },
      { char: "😡", name: "Pouting Face", keywords: "rage red furious extreme anger" },
      { char: "🤬", name: "Swearing Face", keywords: "cursing swear angry rage censored" },
      { char: "🤯", name: "Exploding Head", keywords: "mind blown explode shock unbelievable crazy" },
      { char: "😳", name: "Flushed Face", keywords: "flushed embarrassed blush wide eyes shock" },
      { char: "🥵", name: "Hot Face", keywords: "hot sweat fever summer heat burning" },
      { char: "🥶", name: "Cold Face", keywords: "cold freezing ice winter shivering" },
      { char: "😱", name: "Screaming in Fear", keywords: "scream fear scared horrified shock gasp" },
      { char: "😨", name: "Fearful Face", keywords: "fear scared terrified frightened" },
      { char: "😰", name: "Anxious with Sweat", keywords: "nervous worried blue anxious" },
      { char: "😥", name: "Sad but Relieved", keywords: "relieved phew close call sad" },
      { char: "😓", name: "Downcast with Sweat", keywords: "hard work sweat tired stress" },
      { char: "🤗", name: "Hugging Face", keywords: "hug embrace warm friendly welcome" },
      { char: "🤔", name: "Thinking Face", keywords: "think hmm wonder ponder consider evaluate" },
      { char: "🤭", name: "Hand over Mouth", keywords: "giggle oops whisper surprise cover mouth" },
      { char: "🤫", name: "Shushing Face", keywords: "shh quiet secret silent hush silence" },
      { char: "🤥", name: "Lying Face", keywords: "lie pinocchio nose dishonest fake" },
      { char: "😶", name: "Face without Mouth", keywords: "speechless silent quiet blank no words" },
      { char: "😐", name: "Neutral Face", keywords: "neutral poker face blank okay whatever" },
      { char: "😑", name: "Expressionless Face", keywords: "flat expressionless deadpan blank unimpressed" },
      { char: "😬", name: "Grimacing Face", keywords: "grimace awkward yikes oof nervous teeth" },
      { char: "🙄", name: "Face with Rolling Eyes", keywords: "eye roll whatever duh annoying dismissive" },
      { char: "😯", name: "Hushed Face", keywords: "surprised hushed stunned wow" },
      { char: "😦", name: "Frowning with Open Mouth", keywords: "gasp shocked stunned upset" },
      { char: "😧", name: "Anguished Face", keywords: "anguish troubled stunned pain" },
      { char: "😮", name: "Face with Open Mouth", keywords: "surprised wow whoa amazed" },
      { char: "😲", name: "Astonished Face", keywords: "astonished shocked stunned speechless" },
      { char: "🥱", name: "Yawning Face", keywords: "yawn tired sleepy bored exhaust" },
      { char: "😴", name: "Sleeping Face", keywords: "sleep zzz resting bedtime snore" },
      { char: "🤤", name: "Drooling Face", keywords: "drool delicious craving asleep desire" },
      { char: "😪", name: "Sleepy Face", keywords: "sleepy tired bubble rest" },
      { char: "😵", name: "Dizzy Face", keywords: "dizzy spiral knocked out unconscious confused" },
      { char: "🤐", name: "Zipper-Mouth", keywords: "zip secret lock shut up silent" },
      { char: "🥴", name: "Woozy Face", keywords: "woozy drunk dizzy tipsy intoxicated" },
      { char: "🤢", name: "Nauseated Face", keywords: "nausea gross sick green disgusted" },
      { char: "🤮", name: "Vomiting", keywords: "vomit puke barf sick disgusted" },
      { char: "🤧", name: "Sneezing Face", keywords: "sneeze allergy tissue sick cold" },
      { char: "😷", name: "Face with Medical Mask", keywords: "mask health virus medical sick doctor" },
      { char: "🤒", name: "Face with Thermometer", keywords: "sick fever illness temperature ill" },
      { char: "🤕", name: "Face with Head-Bandage", keywords: "hurt injury bandage wound pain" },
    ],
  },
  {
    id: "gestures",
    name: "Hands & Gestures",
    icon: "👋",
    items: [
      { char: "👋", name: "Waving Hand", keywords: "wave hello hi goodbye bye greeting" },
      { char: "🤚", name: "Raised Back of Hand", keywords: "raised back stop hand" },
      { char: "🖐️", name: "Hand with Fingers Splayed", keywords: "five palm splay hand" },
      { char: "✋", name: "Raised Hand", keywords: "stop high five halt palm volunteer" },
      { char: "🖖", name: "Vulcan Salute", keywords: "spock star trek vulcan live long" },
      { char: "👌", name: "OK Hand", keywords: "ok okay perfect fine correct good" },
      { char: "🤌", name: "Pinched Fingers", keywords: "italian chef kiss what do you want gesture" },
      { char: "🤏", name: "Pinching Hand", keywords: "pinch tiny little small bit size" },
      { char: "✌️", name: "Victory Hand", keywords: "peace victory v sign two deuce" },
      { char: "🤞", name: "Crossed Fingers", keywords: "luck hope wish fingers crossed promise" },
      { char: "🫰", name: "Hand with Index and Thumb Crossed", keywords: "finger heart money kpop snap" },
      { char: "🤟", name: "Love-You Gesture", keywords: "love you sign ily rock on" },
      { char: "🤘", name: "Sign of the Horns", keywords: "rock on metal heavy metal horns" },
      { char: "🤙", name: "Call Me Hand", keywords: "call me shaka hang loose surf phone" },
      { char: "👈", name: "Backhand Index Pointing Left", keywords: "point left backhand direction previous" },
      { char: "👉", name: "Backhand Index Pointing Right", keywords: "point right forward direction next" },
      { char: "👆", name: "Backhand Index Pointing Up", keywords: "point up above top direction" },
      { char: "👇", name: "Backhand Index Pointing Down", keywords: "point down below under direction" },
      { char: "☝️", name: "Index Pointing Up", keywords: "point up one attention first listen" },
      { char: "🫵", name: "Index Pointing at Viewer", keywords: "you point user audience viewer" },
      { char: "👍", name: "Thumbs Up", keywords: "thumbs up approve yes ok like agree good perfect accept" },
      { char: "👎", name: "Thumbs Down", keywords: "thumbs down dislike no bad disapprove decline" },
      { char: "✊", name: "Raised Fist", keywords: "fist power strength solid solidarity" },
      { char: "👊", name: "Oncoming Fist", keywords: "fist bump punch hit impact" },
      { char: "🤛", name: "Left-Facing Fist", keywords: "fist bump punch left" },
      { char: "🤜", name: "Right-Facing Fist", keywords: "fist bump punch right" },
      { char: "👏", name: "Clapping Hands", keywords: "clap clapping hands applause praise bravo" },
      { char: "🙌", name: "Raising Hands", keywords: "hands raise celebrate hooray praise high five" },
      { char: "🫶", name: "Heart Hands", keywords: "heart hands love care support affection" },
      { char: "👐", name: "Open Hands", keywords: "open hands welcome hug offer" },
      { char: "🤲", name: "Palms Up Together", keywords: "prayer offer open palms request" },
      { char: "🤝", name: "Handshake", keywords: "deal agree agreement contract partnership handshake meeting" },
      { char: "🙏", name: "Folded Hands", keywords: "pray please thank you thanks namaste hope wish" },
      { char: "✍️", name: "Writing Hand", keywords: "write sign note pencil pen draw author" },
      { char: "💪", name: "Flexed Biceps", keywords: "muscle strong strength flex power gym workout" },
    ],
  },
  {
    id: "tech",
    name: "Tech, Dev & Work",
    icon: "💻",
    items: [
      { char: "💻", name: "Laptop", keywords: "laptop computer tech pc code coding dev work screen" },
      { char: "🖥️", name: "Desktop Computer", keywords: "desktop computer monitor screen workstation tech" },
      { char: "⌨️", name: "Keyboard", keywords: "keyboard type typing input code dev" },
      { char: "🖱️", name: "Computer Mouse", keywords: "mouse click cursor pointer tech device" },
      { char: "🖲️", name: "Trackball", keywords: "trackball mouse cursor controller" },
      { char: "💾", name: "Floppy Disk", keywords: "save disk storage memory file record" },
      { char: "📱", name: "Mobile Phone", keywords: "phone mobile cell smartphone call app screen" },
      { char: "🔋", name: "Battery", keywords: "battery power charge energy full charging" },
      { char: "🔌", name: "Electric Plug", keywords: "plug power electric connect adapter cable" },
      { char: "💡", name: "Light Bulb", keywords: "idea bulb smart light think innovate solution bright" },
      { char: "🧰", name: "Toolbox", keywords: "tools toolbox fix repair build engineer gear" },
      { char: "🔧", name: "Wrench", keywords: "wrench tool fix setting configuration repair" },
      { char: "🔨", name: "Hammer", keywords: "hammer tool build construct fix create" },
      { char: "⚙️", name: "Gear", keywords: "gear settings config options machinery mechanics" },
      { char: "🔒", name: "Lock", keywords: "lock secure security safe privacy password encrypted" },
      { char: "🔓", name: "Unlock", keywords: "unlock open accessible security access" },
      { char: "🔑", name: "Key", keywords: "key unlock access password auth security secret" },
      { char: "🧪", name: "Test Tube", keywords: "test chemistry experiment lab science beta test" },
      { char: "🔬", name: "Microscope", keywords: "microscope science research inspect detail explore" },
      { char: "📡", name: "Satellite Antenna", keywords: "satellite network signal antenna broadcast transmit" },
      { char: "🚀", name: "Rocket", keywords: "rocket launch startup fast blast space speed fly" },
    ],
  },
  {
    id: "badges",
    name: "Symbols, Badges & Charts",
    icon: "📊",
    items: [
      { char: "📊", name: "Bar Chart", keywords: "chart stats graph analytics report diagram business metric" },
      { char: "📈", name: "Chart Increasing", keywords: "chart trending up growth success profit market stock" },
      { char: "📉", name: "Chart Decreasing", keywords: "chart trending down loss drop decline fall" },
      { char: "📋", name: "Clipboard", keywords: "clipboard todo task list plan checklist document" },
      { char: "📌", name: "Pushpin", keywords: "pin pushpin note remember notice mark location" },
      { char: "📍", name: "Round Pushpin", keywords: "pin map location place mark point spot" },
      { char: "📎", name: "Paperclip", keywords: "clip attach attachment paperclip link connect" },
      { char: "📁", name: "File Folder", keywords: "folder directory files archive storage organize" },
      { char: "📂", name: "Open Folder", keywords: "folder open directory browse data explore" },
      { char: "📅", name: "Calendar", keywords: "calendar date schedule event deadline plan agenda" },
      { char: "🏷️", name: "Label", keywords: "tag label price tag metadata category ticket" },
      { char: "✉️", name: "Envelope", keywords: "mail email message letter inbox send contact" },
      { char: "📦", name: "Package", keywords: "package box deliver delivery ship shipment parcel" },
      { char: "💬", name: "Speech Balloon", keywords: "chat comment message talk bubble conversation discussion" },
      { char: "💭", name: "Thought Balloon", keywords: "think thought idea wonder dream cloud bubble" },
      { char: "✅", name: "Check Mark", keywords: "check mark green done verified success correct complete task" },
      { char: "❌", name: "Cross Mark", keywords: "cross mark x red wrong error cancel delete fail reject" },
      { char: "⚠️", name: "Warning", keywords: "warning alert danger caution problem attention notice" },
      { char: "⛔", name: "No Entry", keywords: "stop forbidden restricted no entry block halt" },
      { char: "🚩", name: "Triangular Flag", keywords: "flag red flag mark milestone priority report" },
      { char: "💎", name: "Diamond", keywords: "diamond gem jewel luxury premium crystal valuable" },
      { char: "💯", name: "Hundred Points", keywords: "hundred 100 percent score perfect keep it real" },
      { char: "🔔", name: "Bell", keywords: "bell notification alert ring alarm chime" },
      { char: "🎯", name: "Target", keywords: "target goal aim focus bullseye hit accurate" },
    ],
  },
  {
    id: "arrows",
    name: "Arrows & Shapes",
    icon: "➡️",
    items: [
      { char: "⬆️", name: "Up Arrow", keywords: "arrow up north direction above top" },
      { char: "↗️", name: "Up-Right Arrow", keywords: "arrow up right diagonal northeast growth" },
      { char: "➡️", name: "Right Arrow", keywords: "arrow right east next forward direction" },
      { char: "↘️", name: "Down-Right Arrow", keywords: "arrow down right diagonal southeast" },
      { char: "⬇️", name: "Down Arrow", keywords: "arrow down south direction below under" },
      { char: "↙️", name: "Down-Left Arrow", keywords: "arrow down left diagonal southwest" },
      { char: "⬅️", name: "Left Arrow", keywords: "arrow left west back previous direction" },
      { char: "↖️", name: "Up-Left Arrow", keywords: "arrow up left diagonal northwest" },
      { char: "↕️", name: "Up-Down Arrow", keywords: "arrow up down vertical height" },
      { char: "↔️", name: "Left-Right Arrow", keywords: "arrow left right horizontal width" },
      { char: "↩️", name: "Right Arrow Curving Left", keywords: "arrow return back undo turn left" },
      { char: "↪️", name: "Left Arrow Curving Right", keywords: "arrow forward redo turn right" },
      { char: "🔄", name: "Counterclockwise Arrows", keywords: "arrows repeat refresh sync reload loop spin" },
      { char: "🔴", name: "Red Circle", keywords: "red circle dot round status stop offline error" },
      { char: "🟢", name: "Green Circle", keywords: "green circle dot round status live online active ready" },
      { char: "🟡", name: "Yellow Circle", keywords: "yellow circle dot round status warning pending away" },
      { char: "🔵", name: "Blue Circle", keywords: "blue circle dot round info status primary" },
      { char: "🟣", name: "Purple Circle", keywords: "purple circle dot round badge" },
      { char: "⚫", name: "Black Circle", keywords: "black circle dot round dark" },
      { char: "⚪", name: "White Circle", keywords: "white circle dot round light" },
      { char: "🟥", name: "Red Square", keywords: "red square block shape" },
      { char: "🟩", name: "Green Square", keywords: "green square block shape" },
      { char: "🟦", name: "Blue Square", keywords: "blue square block shape" },
      { char: "🟨", name: "Yellow Square", keywords: "yellow square block shape" },
    ],
  },
  {
    id: "nature",
    name: "Nature & Food",
    icon: "🌿",
    items: [
      { char: "☕", name: "Coffee", keywords: "coffee hot tea cafe mug drink beverage morning cafe" },
      { char: "🍵", name: "Tea", keywords: "green tea matcha cup hot drink herbal" },
      { char: "🍕", name: "Pizza", keywords: "pizza food slice cheese fast food meal dinner" },
      { char: "🍔", name: "Burger", keywords: "burger hamburger cheeseburger food lunch beef" },
      { char: "🍟", name: "French Fries", keywords: "fries french potato snack fast food" },
      { char: "🍩", name: "Doughnut", keywords: "donut doughnut sweet dessert pastry breakfast" },
      { char: "🍰", name: "Shortcake", keywords: "cake sweet dessert birthday slice party celebration" },
      { char: "🍎", name: "Red Apple", keywords: "apple fruit healthy fresh red food snack" },
      { char: "🌿", name: "Herb", keywords: "herb leaf plant nature green organic eco fresh" },
      { char: "🍀", name: "Four Leaf Clover", keywords: "clover leaf luck lucky irish st patrick fortune" },
      { char: "🌸", name: "Cherry Blossom", keywords: "flower blossom cherry pink spring floral bloom" },
      { char: "🌺", name: "Hibiscus", keywords: "flower hibiscus tropical floral red bloom" },
      { char: "🌻", name: "Sunflower", keywords: "sunflower flower yellow summer sun bright" },
      { char: "🌲", name: "Evergreen Tree", keywords: "tree pine forest nature wood outdoor" },
      { char: "🐶", name: "Dog Face", keywords: "dog puppy pet animal friend canine bark" },
      { char: "🐱", name: "Cat Face", keywords: "cat kitten kitty pet animal feline meow" },
      { char: "🦊", name: "Fox", keywords: "fox clever animal wildlife red orange" },
      { char: "🐻", name: "Bear", keywords: "bear animal wild forest grizzly" },
      { char: "🐼", name: "Panda", keywords: "panda bear cute animal bamboo china" },
      { char: "🦁", name: "Lion", keywords: "lion king wild cat brave animal safari" },
      { char: "🦄", name: "Unicorn", keywords: "unicorn magic fantasy dream mythical horn rainbow" },
      { char: "🐝", name: "Honeybee", keywords: "bee honey insect bug nature pollinate" },
      { char: "🦋", name: "Butterfly", keywords: "butterfly insect wings beauty nature transformation" },
      { char: "🐢", name: "Turtle", keywords: "turtle reptile slow shell ocean sea" },
    ],
  },
];

// Curated Lucide Icons Catalog
interface LucideIconEntry {
  id: string;
  name: string;
  componentName: keyof typeof LucideIcons;
  colorBg: string;
  colorText: string;
}

const PASTEL_THEMES = [
  { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-500" },
  { bg: "bg-purple-50 dark:bg-purple-950/40", text: "text-purple-500" },
  { bg: "bg-rose-50 dark:bg-rose-950/40", text: "text-rose-500" },
  { bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-500" },
  { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-500" },
  { bg: "bg-teal-50 dark:bg-teal-950/40", text: "text-teal-500" },
  { bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-500" },
  { bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-500" },
];

const LUCIDE_ICON_NAMES: { id: string; name: string; componentName: keyof typeof LucideIcons }[] = [
  { id: "activity", name: "Activity", componentName: "Activity" },
  { id: "airplay", name: "Airplay", componentName: "Airplay" },
  { id: "alarm-clock", name: "Alarm Clock", componentName: "AlarmClock" },
  { id: "alarm-check", name: "Alarm Check", componentName: "AlarmClockCheck" },
  { id: "alarm-minus", name: "Alarm Minus", componentName: "AlarmClockMinus" },
  { id: "alarm-plus", name: "Alarm Plus", componentName: "AlarmClockPlus" },
  { id: "alert-circle", name: "Alert Circle", componentName: "AlertCircle" },
  { id: "alert-triangle", name: "Alert Triangle", componentName: "AlertTriangle" },
  { id: "archive", name: "Archive", componentName: "Archive" },
  { id: "arrow-down", name: "Arrow Down", componentName: "ArrowDown" },
  { id: "arrow-left", name: "Arrow Left", componentName: "ArrowLeft" },
  { id: "arrow-right", name: "Arrow Right", componentName: "ArrowRight" },
  { id: "arrow-up", name: "Arrow Up", componentName: "ArrowUp" },
  { id: "arrow-up-right", name: "Arrow Up Right", componentName: "ArrowUpRight" },
  { id: "award", name: "Award", componentName: "Award" },
  { id: "badge-check", name: "Badge Check", componentName: "BadgeCheck" },
  { id: "bar-chart", name: "Bar Chart", componentName: "BarChart" },
  { id: "bar-chart-2", name: "Bar Chart 2", componentName: "BarChart2" },
  { id: "bar-chart-3", name: "Bar Chart 3", componentName: "BarChart3" },
  { id: "battery", name: "Battery", componentName: "Battery" },
  { id: "bell", name: "Bell", componentName: "Bell" },
  { id: "bluetooth", name: "Bluetooth", componentName: "Bluetooth" },
  { id: "book", name: "Book", componentName: "Book" },
  { id: "bookmark", name: "Bookmark", componentName: "Bookmark" },
  { id: "box", name: "Box", componentName: "Box" },
  { id: "briefcase", name: "Briefcase", componentName: "Briefcase" },
  { id: "calendar", name: "Calendar", componentName: "Calendar" },
  { id: "camera", name: "Camera", componentName: "Camera" },
  { id: "cast", name: "Cast", componentName: "Cast" },
  { id: "check", name: "Check", componentName: "Check" },
  { id: "check-circle", name: "Check Circle", componentName: "CheckCircle2" },
  { id: "check-square", name: "Check Square", componentName: "CheckSquare" },
  { id: "chevron-down", name: "Chevron Down", componentName: "ChevronDown" },
  { id: "chevron-left", name: "Chevron Left", componentName: "ChevronLeft" },
  { id: "chevron-right", name: "Chevron Right", componentName: "ChevronRight" },
  { id: "chevron-up", name: "Chevron Up", componentName: "ChevronUp" },
  { id: "circle", name: "Circle", componentName: "Circle" },
  { id: "clipboard", name: "Clipboard", componentName: "Clipboard" },
  { id: "clipboard-check", name: "Clipboard Check", componentName: "ClipboardCheck" },
  { id: "clock", name: "Clock", componentName: "Clock" },
  { id: "cloud", name: "Cloud", componentName: "Cloud" },
  { id: "code", name: "Code", componentName: "Code" },
  { id: "coffee", name: "Coffee", componentName: "Coffee" },
  { id: "command", name: "Command", componentName: "Command" },
  { id: "compass", name: "Compass", componentName: "Compass" },
  { id: "copy", name: "Copy", componentName: "Copy" },
  { id: "cpu", name: "CPU", componentName: "Cpu" },
  { id: "credit-card", name: "Credit Card", componentName: "CreditCard" },
  { id: "crop", name: "Crop", componentName: "Crop" },
  { id: "database", name: "Database", componentName: "Database" },
  { id: "download", name: "Download", componentName: "Download" },
  { id: "edit", name: "Edit", componentName: "Edit" },
  { id: "eye", name: "Eye", componentName: "Eye" },
  { id: "file", name: "File", componentName: "File" },
  { id: "file-text", name: "File Text", componentName: "FileText" },
  { id: "film", name: "Film", componentName: "Film" },
  { id: "filter", name: "Filter", componentName: "Filter" },
  { id: "flag", name: "Flag", componentName: "Flag" },
  { id: "flame", name: "Flame", componentName: "Flame" },
  { id: "folder", name: "Folder", componentName: "Folder" },
  { id: "globe", name: "Globe", componentName: "Globe" },
  { id: "grid", name: "Grid", componentName: "Grid" },
  { id: "hard-drive", name: "Hard Drive", componentName: "HardDrive" },
  { id: "headphones", name: "Headphones", componentName: "Headphones" },
  { id: "heart", name: "Heart", componentName: "Heart" },
  { id: "help-circle", name: "Help Circle", componentName: "HelpCircle" },
  { id: "home", name: "Home", componentName: "Home" },
  { id: "image", name: "Image", componentName: "Image" },
  { id: "inbox", name: "Inbox", componentName: "Inbox" },
  { id: "info", name: "Info", componentName: "Info" },
  { id: "key", name: "Key", componentName: "Key" },
  { id: "layers", name: "Layers", componentName: "Layers" },
  { id: "layout", name: "Layout", componentName: "Layout" },
  { id: "life-buoy", name: "Life Buoy", componentName: "LifeBuoy" },
  { id: "link", name: "Link", componentName: "Link" },
  { id: "list", name: "List", componentName: "List" },
  { id: "lock", name: "Lock", componentName: "Lock" },
  { id: "mail", name: "Mail", componentName: "Mail" },
  { id: "map", name: "Map", componentName: "Map" },
  { id: "map-pin", name: "Map Pin", componentName: "MapPin" },
  { id: "maximize", name: "Maximize", componentName: "Maximize" },
  { id: "menu", name: "Menu", componentName: "Menu" },
  { id: "message-circle", name: "Message Circle", componentName: "MessageCircle" },
  { id: "message-square", name: "Message Square", componentName: "MessageSquare" },
  { id: "mic", name: "Mic", componentName: "Mic" },
  { id: "minimize", name: "Minimize", componentName: "Minimize" },
  { id: "minus", name: "Minus", componentName: "Minus" },
  { id: "monitor", name: "Monitor", componentName: "Monitor" },
  { id: "moon", name: "Moon", componentName: "Moon" },
  { id: "mouse-pointer", name: "Mouse Pointer", componentName: "MousePointer" },
  { id: "music", name: "Music", componentName: "Music" },
  { id: "navigation", name: "Navigation", componentName: "Navigation" },
  { id: "package", name: "Package", componentName: "Package" },
  { id: "palette", name: "Palette", componentName: "Palette" },
  { id: "paperclip", name: "Paperclip", componentName: "Paperclip" },
  { id: "pause", name: "Pause", componentName: "Pause" },
  { id: "pen-tool", name: "Pen Tool", componentName: "PenTool" },
  { id: "percent", name: "Percent", componentName: "Percent" },
  { id: "phone", name: "Phone", componentName: "Phone" },
  { id: "pie-chart", name: "Pie Chart", componentName: "PieChart" },
  { id: "play", name: "Play", componentName: "Play" },
  { id: "plus", name: "Plus", componentName: "Plus" },
  { id: "power", name: "Power", componentName: "Power" },
  { id: "printer", name: "Printer", componentName: "Printer" },
  { id: "radio", name: "Radio", componentName: "Radio" },
  { id: "refresh-cw", name: "Refresh", componentName: "RefreshCw" },
  { id: "repeat", name: "Repeat", componentName: "Repeat" },
  { id: "save", name: "Save", componentName: "Save" },
  { id: "scissors", name: "Scissors", componentName: "Scissors" },
  { id: "search", name: "Search", componentName: "Search" },
  { id: "send", name: "Send", componentName: "Send" },
  { id: "server", name: "Server", componentName: "Server" },
  { id: "settings", name: "Settings", componentName: "Settings" },
  { id: "share", name: "Share", componentName: "Share" },
  { id: "shield", name: "Shield", componentName: "Shield" },
  { id: "shield-check", name: "Shield Check", componentName: "ShieldCheck" },
  { id: "shopping-bag", name: "Shopping Bag", componentName: "ShoppingBag" },
  { id: "shopping-cart", name: "Shopping Cart", componentName: "ShoppingCart" },
  { id: "shuffle", name: "Shuffle", componentName: "Shuffle" },
  { id: "sliders", name: "Sliders", componentName: "Sliders" },
  { id: "smartphone", name: "Smartphone", componentName: "Smartphone" },
  { id: "smile", name: "Smile", componentName: "Smile" },
  { id: "sparkles", name: "Sparkles", componentName: "Sparkles" },
  { id: "speaker", name: "Speaker", componentName: "Speaker" },
  { id: "square", name: "Square", componentName: "Square" },
  { id: "star", name: "Star", componentName: "Star" },
  { id: "sun", name: "Sun", componentName: "Sun" },
  { id: "tag", name: "Tag", componentName: "Tag" },
  { id: "target", name: "Target", componentName: "Target" },
  { id: "terminal", name: "Terminal", componentName: "Terminal" },
  { id: "thumbs-down", name: "Thumbs Down", componentName: "ThumbsDown" },
  { id: "thumbs-up", name: "Thumbs Up", componentName: "ThumbsUp" },
  { id: "toggle-left", name: "Toggle Left", componentName: "ToggleLeft" },
  { id: "toggle-right", name: "Toggle Right", componentName: "ToggleRight" },
  { id: "trash", name: "Trash", componentName: "Trash" },
  { id: "trending-down", name: "Trending Down", componentName: "TrendingDown" },
  { id: "trending-up", name: "Trending Up", componentName: "TrendingUp" },
  { id: "truck", name: "Truck", componentName: "Truck" },
  { id: "tv", name: "TV", componentName: "Tv" },
  { id: "type", name: "Type", componentName: "Type" },
  { id: "unlock", name: "Unlock", componentName: "Unlock" },
  { id: "upload", name: "Upload", componentName: "Upload" },
  { id: "user", name: "User", componentName: "User" },
  { id: "user-check", name: "User Check", componentName: "UserCheck" },
  { id: "user-plus", name: "User Plus", componentName: "UserPlus" },
  { id: "users", name: "Users", componentName: "Users" },
  { id: "video", name: "Video", componentName: "Video" },
  { id: "voicemail", name: "Voicemail", componentName: "Voicemail" },
  { id: "volume-2", name: "Volume", componentName: "Volume2" },
  { id: "watch", name: "Watch", componentName: "Watch" },
  { id: "wifi", name: "WiFi", componentName: "Wifi" },
  { id: "wind", name: "Wind", componentName: "Wind" },
  { id: "zap", name: "Zap", componentName: "Zap" },
  { id: "zoom-in", name: "Zoom In", componentName: "ZoomIn" },
  { id: "zoom-out", name: "Zoom Out", componentName: "ZoomOut" },
];

const ALL_LUCIDE_ICONS: LucideIconEntry[] = LUCIDE_ICON_NAMES.map((item, index) => {
  const theme = PASTEL_THEMES[index % PASTEL_THEMES.length];
  return {
    ...item,
    colorBg: theme.bg,
    colorText: theme.text,
  };
});

// Memoized Individual Emoji Button for 0ms lag
const EmojiButton = React.memo(({ item, onSelect }: { item: EmojiItem; onSelect: (char: string) => void }) => (
  <button
    type="button"
    title={`${item.name} (${item.keywords})`}
    onClick={() => onSelect(item.char)}
    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-slate-800 text-lg hover:scale-130 transition-transform duration-75 cursor-pointer shadow-2xs hover:shadow-xs"
  >
    {item.char}
  </button>
));
EmojiButton.displayName = "EmojiButton";

// Memoized Lucide Icon Card matching the exact screenshot layout
const LucideIconCard = React.memo(({ icon, onSelect }: { icon: LucideIconEntry; onSelect: (icon: LucideIconEntry) => void }) => {
  const IconComp = (LucideIcons as any)[icon.componentName];
  if (!IconComp) return null;

  return (
    <button
      type="button"
      title={icon.name}
      onClick={() => onSelect(icon)}
      className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white hover:bg-slate-50/80 border border-border-divider/70 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer group"
    >
      <div
        className={`w-11 h-11 rounded-2xl ${icon.colorBg} ${icon.colorText} flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xs`}
      >
        <IconComp className="w-5 h-5" strokeWidth={2.2} />
      </div>
      <span className="text-[11px] font-medium text-slate-700 w-full text-center truncate mt-1.5 leading-tight">
        {icon.name}
      </span>
    </button>
  );
});
LucideIconCard.displayName = "LucideIconCard";

// Memoized Note Card Button matching the exact screenshot layout
const NoteCardButton = React.memo(({ style, onSelect }: { style: NoteStyle; onSelect: (style: NoteStyle) => void }) => (
  <button
    type="button"
    onClick={() => onSelect(style)}
    className="flex items-center gap-4 p-3 rounded-2xl border border-border-divider/70 hover:border-slate-300 bg-white hover:bg-slate-50/80 transition-all text-left group cursor-pointer shadow-2xs hover:shadow-xs hover:scale-[1.01] active:scale-[0.99]"
  >
    {/* Visual Preview Thumbnail Box */}
    <div
      className={`w-16 h-16 rounded-2xl border ${style.previewBorder} ${style.previewBg} flex flex-col justify-between p-2 shrink-0 transition-transform group-hover:scale-105 shadow-2xs`}
    >
      <div className="flex items-center justify-start">
        <span
          className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full border ${style.tagColor}`}
        >
          {style.tag}
        </span>
      </div>
      <div
        className="w-full h-2.5 rounded-full opacity-90 shadow-2xs"
        style={{ backgroundColor: style.accentColor }}
      />
      <div className="w-3/4 h-1.5 rounded-full bg-white/70 dark:bg-white/40" />
    </div>

    {/* Note Details */}
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-bold text-navy group-hover:text-primary-blue transition-colors">
        {style.name}
      </h4>
      <p className="text-xs text-muted-text mt-0.5 truncate">
        {style.subtitle}
      </p>
    </div>
  </button>
));
NoteCardButton.displayName = "NoteCardButton";

const BottomDock = ({ excalidrawAPI }: Props) => {
  const [activePanel, setActivePanel] = useState<"none" | "notes" | "emojis">("none");
  const [activeTab, setActiveTab] = useState<"emojis" | "icons">("emojis");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);

  const handleAddNote = useCallback((style: NoteStyle) => {
    if (!excalidrawAPI) {
      toast.add({
        type: "error",
        title: "Canvas not ready",
        description: "Please wait for the whiteboard canvas to load.",
      });
      return;
    }

    const appState = excalidrawAPI.getAppState();
    const zoom = appState.zoom?.value || 1;
    const scrollX = appState.scrollX || 0;
    const scrollY = appState.scrollY || 0;

    // Place note in viewport center
    const width = 240;
    const height = 180;
    const x = -scrollX + window.innerWidth / (2 * zoom) - width / 2;
    const y = -scrollY + window.innerHeight / (2 * zoom) - height / 2;

    const cardId = `note_card_${Date.now()}`;
    const textId = `note_text_${Date.now()}`;

    const cardElement: any = {
      id: cardId,
      type: "rectangle",
      x,
      y,
      width,
      height,
      angle: 0,
      strokeColor: style.strokeColor,
      backgroundColor: style.bgColor,
      fillStyle: "solid",
      strokeWidth: 2,
      strokeStyle: "solid",
      roughness: 0,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: { type: 3 },
      seed: Math.floor(Math.random() * 100000),
      version: 1,
      versionNonce: Math.floor(Math.random() * 1000000000),
      isDeleted: false,
      boundElements: [{ id: textId, type: "text" }],
      updated: Date.now(),
      link: null,
      locked: false,
    };

    const textElement: any = {
      id: textId,
      type: "text",
      x: x + 16,
      y: y + 16,
      width: width - 32,
      height: height - 32,
      angle: 0,
      text: style.defaultText,
      originalText: style.defaultText,
      fontSize: 16,
      fontFamily: 1,
      textAlign: "left",
      verticalAlign: "top",
      baseline: 16,
      lineHeight: 1.25,
      strokeColor: style.textColor,
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 0,
      opacity: 100,
      groupIds: [],
      frameId: null,
      boundElements: null,
      seed: Math.floor(Math.random() * 100000),
      version: 1,
      versionNonce: Math.floor(Math.random() * 1000000000),
      isDeleted: false,
      containerId: cardId,
      updated: Date.now(),
      link: null,
      locked: false,
    };

    const currentElements = excalidrawAPI.getSceneElements();

    excalidrawAPI.updateScene({
      elements: [...currentElements, cardElement, textElement],
      appState: {
        ...appState,
        selectedElementIds: { [cardId]: true },
      },
    });

    toast.add({
      type: "success",
      title: `${style.name} Added!`,
      description: "Click inside to edit text or drag to move.",
    });

    setActivePanel("none");
  }, [excalidrawAPI]);

  const handleAddEmoji = useCallback((emoji: string) => {
    if (!excalidrawAPI) return;

    const appState = excalidrawAPI.getAppState();
    const zoom = appState.zoom?.value || 1;
    const scrollX = appState.scrollX || 0;
    const scrollY = appState.scrollY || 0;

    const x = -scrollX + window.innerWidth / (2 * zoom) - 30;
    const y = -scrollY + window.innerHeight / (2 * zoom) - 30;

    const emojiId = `emoji_${Date.now()}`;
    const emojiElement: any = {
      id: emojiId,
      type: "text",
      x,
      y,
      width: 60,
      height: 60,
      angle: 0,
      text: emoji,
      originalText: emoji,
      fontSize: 48,
      fontFamily: 1,
      textAlign: "center",
      verticalAlign: "middle",
      baseline: 40,
      lineHeight: 1.25,
      strokeColor: "#000000",
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 0,
      opacity: 100,
      groupIds: [],
      frameId: null,
      boundElements: null,
      seed: Math.floor(Math.random() * 100000),
      version: 1,
      versionNonce: Math.floor(Math.random() * 1000000000),
      isDeleted: false,
      updated: Date.now(),
      link: null,
      locked: false,
    };

    const currentElements = excalidrawAPI.getSceneElements();

    excalidrawAPI.updateScene({
      elements: [...currentElements, emojiElement],
      appState: {
        ...appState,
        selectedElementIds: { [emojiId]: true },
      },
    });

    toast.add({
      type: "success",
      title: "Emoji Placed!",
      description: `Added ${emoji} to canvas.`,
    });

    setActivePanel("none");
  }, [excalidrawAPI]);

  const handleAddIcon = useCallback((icon: LucideIconEntry) => {
    if (!excalidrawAPI) return;

    const IconComp = (LucideIcons as any)[icon.componentName];
    if (!IconComp) return;

    const appState = excalidrawAPI.getAppState();
    const zoom = appState.zoom?.value || 1;
    const scrollX = appState.scrollX || 0;
    const scrollY = appState.scrollY || 0;

    const width = 64;
    const height = 64;
    const x = -scrollX + window.innerWidth / (2 * zoom) - width / 2;
    const y = -scrollY + window.innerHeight / (2 * zoom) - height / 2;

    const fileId = `lucide_${icon.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const elementId = `lucide_el_${Date.now()}`;

    // Render static SVG string from the Lucide component
    const svgString = renderToStaticMarkup(
      <IconComp size={64} color="#1E293B" strokeWidth={2} />
    );

    const base64Data =
      typeof window !== "undefined"
        ? window.btoa(unescape(encodeURIComponent(svgString)))
        : Buffer.from(svgString).toString("base64");
    const svgDataUrl = `data:image/svg+xml;base64,${base64Data}`;

    excalidrawAPI.addFiles([
      {
        id: fileId as any,
        dataURL: svgDataUrl as any,
        mimeType: "image/svg+xml",
        created: Date.now(),
      },
    ]);

    const imageElement: any = {
      id: elementId,
      type: "image",
      x,
      y,
      width,
      height,
      angle: 0,
      strokeColor: "transparent",
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 0,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: null,
      seed: Math.floor(Math.random() * 100000),
      version: 1,
      versionNonce: Math.floor(Math.random() * 1000000000),
      isDeleted: false,
      fileId: fileId,
      status: "saved",
      scale: [1, 1],
      updated: Date.now(),
      link: null,
      locked: false,
    };

    const currentElements = excalidrawAPI.getSceneElements();

    excalidrawAPI.updateScene({
      elements: [...currentElements, imageElement],
      appState: {
        ...appState,
        selectedElementIds: { [elementId]: true },
      },
    });

    toast.add({
      type: "success",
      title: "Icon Placed!",
      description: `Added ${icon.name} icon to canvas.`,
    });

    setActivePanel("none");
  }, [excalidrawAPI]);

  // Filter Emojis across all categories with deferred rendering for 0ms typing lag
  const filteredEmojiCategories = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) {
      return EMOJI_DATA;
    }
    return EMOJI_DATA.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.char.includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.keywords.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [deferredSearch]);

  // Filter Lucide Icons with deferred rendering for 0ms typing lag
  const filteredLucideIcons = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) {
      return ALL_LUCIDE_ICONS;
    }
    return ALL_LUCIDE_ICONS.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.componentName.toLowerCase().includes(q)
    );
  }, [deferredSearch]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/95 dark:bg-card/95 backdrop-blur-xl border border-border-divider/90 shadow-xl shadow-navy/10 text-foreground">
        {/* 1. Add Notes Popover */}
        <Popover
          open={activePanel === "notes"}
          onOpenChange={(open) => setActivePanel(open ? "notes" : "none")}
        >
          <PopoverTrigger
            render={
              <button
                type="button"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activePanel === "notes"
                    ? "bg-secondary text-navy shadow-xs"
                    : "text-slate-text hover:text-navy hover:bg-secondary/70"
                }`}
              >
                <LucideIcons.MessageSquare className="w-4 h-4 text-primary-blue" />
                <span>Notes</span>
              </button>
            }
          />
          <PopoverContent
            side="top"
            align="center"
            sideOffset={14}
            className="w-96 p-4 rounded-3xl shadow-2xl bg-white border border-border-divider/80 flex flex-col gap-3 animate-in fade-in-50 zoom-in-95 duration-100"
          >
            {/* Header matching screenshot */}
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-navy tracking-tight">
                Add notes
              </h3>
              <p className="text-xs text-muted-text mt-0.5">
                Pick a blank note style for the whiteboard.
              </p>
            </div>

            {/* Note Options List (No Scrollbar) */}
            <div className="flex flex-col gap-2.5 max-h-[62vh] overflow-y-auto pr-0.5 no-scrollbar">
              {NOTE_STYLES.map((style) => (
                <NoteCardButton
                  key={style.id}
                  style={style}
                  onSelect={handleAddNote}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-5 bg-border-divider mx-0.5" />

        {/* 2. Unified Emojis & Icons Popover with Tab Switcher */}
        <Popover
          open={activePanel === "emojis"}
          onOpenChange={(open) => setActivePanel(open ? "emojis" : "none")}
        >
          <PopoverTrigger
            render={
              <button
                type="button"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activePanel === "emojis"
                    ? "bg-secondary text-navy shadow-xs"
                    : "text-slate-text hover:text-navy hover:bg-secondary/70"
                }`}
              >
                <LucideIcons.Smile className="w-4 h-4 text-amber-500" />
                <span>Emoji & Icons</span>
              </button>
            }
          />
          <PopoverContent
            side="top"
            align="center"
            sideOffset={14}
            className="w-96 p-4 rounded-3xl shadow-2xl bg-white border border-border-divider/80 flex flex-col gap-3 animate-in fade-in-50 zoom-in-95 duration-100"
          >
            {/* Header */}
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-navy tracking-tight">
                Emoji and icons
              </h3>
              <p className="text-xs text-muted-text mt-0.5">
                Choose from the picker or scroll the icon library.
              </p>
            </div>

            {/* Fast Tab Switcher (0ms CSS toggle) */}
            <div className="flex items-center p-1 bg-secondary/80 rounded-2xl border border-border-divider/70">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("emojis");
                  setSearchQuery("");
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "emojis"
                    ? "bg-white text-navy shadow-xs"
                    : "text-slate-text hover:text-navy"
                }`}
              >
                <span>Emoji</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("icons");
                  setSearchQuery("");
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "icons"
                    ? "bg-white text-navy shadow-xs"
                    : "text-slate-text hover:text-navy"
                }`}
              >
                <span>Icons</span>
              </button>
            </div>

            {/* Instant Search Input */}
            <div className="relative">
              <LucideIcons.Search className="w-3.5 h-3.5 text-muted-text absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-8 pr-8 py-1.5 rounded-xl border border-border-divider text-xs focus:outline-none focus:border-primary-blue bg-secondary/30 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-text hover:text-navy cursor-pointer"
                >
                  <LucideIcons.X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Content for EMOJI Tab (Kept mounted for 0ms switch lag) */}
            <div
              className={`flex flex-col gap-3.5 max-h-64 overflow-y-auto pr-0.5 no-scrollbar ${
                activeTab === "emojis" ? "block" : "hidden"
              }`}
            >
              {filteredEmojiCategories.length === 0 ? (
                <div className="py-10 text-center text-xs text-muted-text">
                  No emojis found matching &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredEmojiCategories.map((cat) => (
                  <div key={cat.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] font-bold text-navy flex items-center gap-1.5">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </span>
                      <span className="text-[9.5px] text-muted-text font-mono">
                        {cat.items.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-8 gap-1 p-1.5 bg-secondary/20 rounded-2xl border border-border-divider/40">
                      {cat.items.map((item, idx) => (
                        <EmojiButton
                          key={`${cat.id}_${idx}`}
                          item={item}
                          onSelect={handleAddEmoji}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Content for LUCIDE ICONS Tab (4-column pastel squircle cards matching screenshot) */}
            <div
              className={`max-h-64 overflow-y-auto pr-0.5 no-scrollbar ${
                activeTab === "icons" ? "block" : "hidden"
              }`}
            >
              {filteredLucideIcons.length === 0 ? (
                <div className="py-10 text-center text-xs text-muted-text">
                  No icons found matching &quot;{searchQuery}&quot;
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2.5 p-1">
                  {filteredLucideIcons.map((icon) => (
                    <LucideIconCard
                      key={icon.id}
                      icon={icon}
                      onSelect={handleAddIcon}
                    />
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default BottomDock;
