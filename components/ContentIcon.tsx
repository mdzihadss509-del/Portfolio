import * as Icons from 'lucide-react';

const LUCIDE_ICONS: Record<string, keyof typeof Icons> = {
  Globe:'Globe', Mail:'Mail', Send:'Send', MessageCircle:'MessageCircle', Gamepad2:'Gamepad2',
  FolderKanban:'FolderKanban', PanelsTopLeft:'PanelsTopLeft', Info:'Info', Camera:'Camera',
  Link:'Link', Code:'Code', BriefcaseBusiness:'BriefcaseBusiness', GraduationCap:'GraduationCap',
  Wrench:'Wrench', Star:'Star', FileText:'FileText', Sparkles:'Sparkles', Palette:'Palette',
  Monitor:'Monitor', Video:'Video', Shield:'Shield', Cpu:'Cpu', Zap:'Zap', Terminal:'Terminal',
  BookOpen:'BookOpen', Layers:'Layers', Rocket:'Rocket', Heart:'Heart', Lightbulb:'Lightbulb',
  Pencil:'Pencil', Brush:'Brush', Settings:'Settings', Package:'Package', Image:'Image',
  House:'House', Cloud:'Cloud', Database:'Database', CodeXml:'CodeXml', CircleUser:'CircleUser',
  Dribbble:'Dribbble', Music2:'Music2', Twitch:'Twitch'
};

const BRAND_ASSETS: Record<string,string> = {
  YouTube:'/icons/youtube.svg', Youtube:'/icons/youtube.svg',
  Facebook:'/icons/facebook.svg',
  Instagram:'/icons/instagram.svg',
  GitHub:'/icons/github.svg', Github:'/icons/github.svg',
  X:'/icons/x.svg', Twitter:'/icons/x.svg',
  LinkedIn:'/icons/linkedin.svg', Linkedin:'/icons/linkedin.svg',
  WhatsApp:'/icons/whatsapp.svg',
  Discord:'/icons/discord.svg',
  TikTok:'/icons/tiktok.svg', Tiktok:'/icons/tiktok.svg',
  Telegram:'/icons/telegram.svg',
  Twitch:'/icons/twitch.svg'
};

export const SOCIAL_PLATFORMS = [
  {name:'YouTube',icon:'YouTube'},
  {name:'Facebook',icon:'Facebook'},
  {name:'Instagram',icon:'Instagram'},
  {name:'GitHub',icon:'GitHub'},
  {name:'Twitter / X',icon:'Twitter'},
  {name:'LinkedIn',icon:'LinkedIn'},
  {name:'WhatsApp',icon:'WhatsApp'},
  {name:'Discord',icon:'Discord'},
  {name:'TikTok',icon:'TikTok'},
  {name:'Telegram',icon:'Telegram'},
  {name:'Twitch',icon:'Twitch'},
  {name:'Email',icon:'Mail'},
  {name:'Website',icon:'Globe'}
] as const;

export const ICON_CHOICES = [...new Set([...Object.keys(LUCIDE_ICONS),'YouTube','Facebook','Instagram','GitHub','Twitter','LinkedIn','WhatsApp','Discord','TikTok','Telegram','Twitch'])]
  .map((name)=>({name,value:name}));

export function defaultSocialIcon(platform:string):string {
  const value=platform.trim().toLowerCase().replace(/[^a-z0-9]/g,'');
  if(value==='twitter'||value==='x'||value==='twitterx') return 'Twitter';
  if(value==='youtube') return 'YouTube';
  if(value==='github') return 'GitHub';
  if(value==='linkedin') return 'LinkedIn';
  if(value==='whatsapp') return 'WhatsApp';
  if(value==='tiktok') return 'TikTok';
  if(value==='instagram') return 'Instagram';
  if(value==='facebook') return 'Facebook';
  if(value==='discord') return 'Discord';
  if(value==='telegram') return 'Telegram';
  if(value==='twitch') return 'Twitch';
  if(value==='email') return 'Mail';
  return SOCIAL_PLATFORMS.find((p)=>p.name.toLowerCase()===platform.toLowerCase())?.icon || 'Globe';
}

export default function ContentIcon({name='Globe',imageUrl,className='',size=18}:{name?:string|null;imageUrl?:string|null;className?:string;size?:number}) {
  if(imageUrl) return <img src={imageUrl} alt="" className={className} style={{width:size,height:size,objectFit:'contain'}} />;
  const brand=BRAND_ASSETS[name||''];
  if(brand) return <img src={brand} alt="" className={className} style={{width:size,height:size,objectFit:'contain'}} />;
  const key=LUCIDE_ICONS[name||'Globe'] || 'Globe';
  const Icon=(Icons as unknown as Record<string,React.ComponentType<{size?:number;strokeWidth?:number;className?:string;'aria-hidden'?:boolean}>>)[key] || Icons.Globe;
  return <Icon size={size} strokeWidth={1.8} className={className} aria-hidden={true}/>;
}