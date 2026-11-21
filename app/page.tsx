
import { ArrowUpRight, Gamepad2, Youtube, Mail, MoveUpRight, ExternalLink, Wrench, Star, FileText, Play, Zap } from 'lucide-react';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';
import Reveal from '@/components/Reveal';
import ContactForm from '@/components/ContactForm';
import ContentIcon,{defaultSocialIcon} from '@/components/ContentIcon';
import MotionSurface from '@/components/MotionSurface';
import MediaShowcase from '@/components/MediaShowcase';
import SkillsExplorer from '@/components/SkillsExplorer';
import { getPortfolioData, type PortfolioRow } from '@/lib/public-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function videoId(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1);
    if (u.hostname.includes('youtube.com')) return u.searchParams.get('v') || u.pathname.split('/').filter(Boolean).pop() || '';
  } catch {}
  return '';
}
function Brand({ settings }: { settings: Record<string, unknown> }) {
  const branding = (settings.branding || {}) as Record<string, string>;
  return <a className="brand" href="#home">{branding.logo_url ? <Image src={branding.logo_url} alt="" width={34} height={34} unoptimized style={{objectFit:'contain'}}/> : <span className="brand-mark">{branding.logo_text || 'H.'}</span>}<span>{branding.site_name || 'HADES'}<span className="brand-muted"> / PORTFOLIO</span></span></a>;
}
function ProjectCard({ project, index }: { project: PortfolioRow; index: number }) {
  return <Reveal className="project-reveal"><MotionSurface as="article" className="project-card blue" intensity={0.7}>
    <div className="project-top"><span>{String(index + 1).padStart(2,'0')} &mdash; {(project.category || 'PROJECT').toString().toUpperCase()}</span>{(project.icon_url||project.icon_name) ? <ContentIcon name={project.icon_name||'FolderKanban'} imageUrl={project.icon_url} className="cms-icon-image small" size={18}/> : <span className="project-symbol">↗</span>}</div>
    <div className="project-art" style={project.cover_url ? {backgroundImage:'linear-gradient(180deg,transparent,#100b1acc),url('+JSON.stringify(project.cover_url)+')',backgroundSize:'cover',backgroundPosition:'center'} : undefined}><div className="art-lines"/><span className="art-word">{project.title}</span><span className="art-corner">↗</span></div>
    <div className="project-info"><h3>{project.title}</h3><p>{project.summary || project.body || ''}</p><div className="tag-row">{(project.tags || []).map((tag:string)=><span key={tag}>{tag}</span>)}</div>{project.live_url && <a className="text-link" href={project.live_url} target="_blank" rel="noreferrer">View project <ExternalLink size={14}/></a>}</div>
  </MotionSurface></Reveal>;
}
export default async function Home() {
  const data = await getPortfolioData();
  const section = (slug:string) => data.sections.find((s) => s.slug === slug);
  const content = (slug:string) => section(slug)?.content || {};
  const enabled = (slug:string) => !!section(slug);
  const home = content('home'), about = content('about'), work = content('work'), skills = content('skills'), creator = content('creator'), contact = content('contact');
  const general = (data.settings.general || {}) as Record<string, string>, contactSettings = (data.settings.contact || {}) as Record<string, string>;
  const email = contactSettings.email || '';
  const baseNav: PortfolioRow[] = data.navigation.length ? data.navigation : [{label:'About',href:'#about'},{label:'Selected work',href:'#work'},{label:'Expertise',href:'#skills'},{label:'Contact',href:'#contact'}];
  const nav: PortfolioRow[] = data.mediaAssets.length && !baseNav.some((item) => item.href === '#media-library')
    ? [...baseNav, { id: 'media-library', label: 'Media archive', href: '#media-library' }]
    : baseNav;
  const youtubeUrl = creator.youtube_url || data.socials.find((s)=>s.platform?.toLowerCase()==='youtube')?.url || 'https://youtube.com/@blackflash-hades';
  const socials = data.socials;
  const experienceGroupDefinitions = [
    { title: 'Web & Software Development', summary: 'Frontend, backend, databases and interface design', roles: ['Full-Stack Web Development', 'Frontend Development & UI Engineering', 'Backend Development & API Integration', 'Database & CMS Development', 'UI/UX & Responsive Web Design'] },
    { title: 'Minecraft Development & Server Systems', summary: 'Mods, add-ons, plugins and server administration', roles: ['Minecraft Mods & Add-on Development', 'Minecraft Plugin Development', 'Minecraft Server Setup & Administration'] },
    { title: 'Content & Creative Production', summary: 'Channel management, video, visual design and streaming', roles: ['Minecraft Content Creation', 'YouTube Channel & Content Management', 'Video Editing & Production', 'Thumbnail & Graphic Design', 'Live Streaming & Recording'] },
    { title: 'AI & Media Automation', summary: 'AI-assisted workflows, Python and FFmpeg', roles: ['AI-Assisted Development & Workflow Automation', 'Python & FFmpeg Media Automation'] },
  ];
  const featuredExperience = data.experiences.find((item) => item.role === 'Founder & Creator');
  const groupedExperiences = experienceGroupDefinitions.map((group) => ({
    ...group,
    items: data.experiences.filter((item) => group.roles.includes(String(item.role))),
  })).filter((group) => group.items.length > 0);
  const currentEducation = data.education.filter((item) => item.qualification === 'Ongoing College Education');
  const educationGroupDefinitions = [
    { title: 'University Preparation', summary: 'Academic qualification and English proficiency', qualifications: ['Higher Secondary Certificate (HSC)', 'IELTS Academic / English Proficiency'] },
    { title: 'Software Engineering Pathway', summary: 'Computer science degree and full-stack specialization', qualifications: ["Bachelor's in Computer Science / Software Engineering", 'Full-Stack Software Development Specialization'] },
    { title: 'Business & Entrepreneurship Pathway', summary: 'Business administration, innovation and startup development', qualifications: ["Bachelor's in International Business Administration & Entrepreneurship", 'Innovation & Startup Management'] },
    { title: 'Postgraduate Study Options', summary: 'Long-term technology management and business leadership study', qualifications: ["Master's in Technology Management / Entrepreneurship / MBA"] },
  ];
  const groupedEducation = educationGroupDefinitions.map((group) => ({
    ...group,
    items: data.education.filter((item) => group.qualifications.includes(String(item.qualification))),
  })).filter((group) => group.items.length > 0);
  return <main>
    <nav className="nav wrap nav-entrance"><Brand settings={data.settings}/><div className="nav-links">{nav.map((item)=><a key={item.id || item.href} href={item.href}>{(item.icon_url||item.icon_name)&&<ContentIcon name={item.icon_name||'Link'} imageUrl={item.icon_url} className="nav-custom-icon" size={15}/>}{item.label}</a>)}</div><div className="nav-actions"><ThemeToggle/><a className="nav-cta" href="#contact">Let&apos;s talk <ArrowUpRight size={15}/></a></div></nav>
    {enabled('home') && <section className="hero hero-studio wrap" id="home">
      <div className="hero-studio-top">
        <span className="hero-studio-status"><span className="live-dot"/>{home.open_to || 'OPEN TO SELECT PROJECTS & COLLABORATIONS'}</span>
        <span className="hero-studio-index">{home.hero_index || 'HADES / INDEPENDENT PORTFOLIO'}</span>
      </div>
      <div className="hero-studio-grid">
        <div className="hero-studio-copy">
          <p className="hero-studio-kicker"><span className="hero-kicker-line"/> {home.hero_kicker || 'INDEPENDENT CREATIVE / BUILDER'}</p>
          <h1 className="hero-studio-title"><span>ZIHAD</span><em>BEYOND THE ORDINARY<span className="hero-title-period">.</span></em></h1>
          <p className="hero-studio-manifesto">DRIVEN BY <span>CURIOSITY.</span></p>
          <p className="hero-studio-description">{home.intro || 'Hi, I’m Zihad — founder of Black Flash Hades. I’ve always been curious about how things work and what can be created beyond the familiar. That curiosity leads me to explore technology, build websites and applications, and experiment with creative digital projects. I learn by making things, testing ideas, and refining them through hands-on work. Each project gives me a new way to explore, solve problems, and keep building.'}</p>
          <div className="hero-studio-actions">
            <a className="hero-explore-link" href="#work"><span>Explore selected work</span><span className="hero-explore-icon"><ArrowUpRight size={17}/></span></a>
            <span className="hero-studio-note">IDEAS / SYSTEMS / EXPERIENCES</span>
          </div>
        </div>
        <div className="hero-art-column">
          <div className="hero-art-heading"><span>HADES / SIGNATURE MARK</span><span>H — 001</span></div>
          <MotionSurface className="emblem-interactive" intensity={0.45}><div className="emblem-stage" role="img" aria-label="HADES dimensional H monogram surrounded by four orbital rings">
            <span className="emblem-coordinate emblem-coordinate-top">SIGNATURE MARK / 001</span>
            <span className="emblem-coordinate emblem-coordinate-bottom">FORM STUDY&nbsp; / &nbsp;NO. 01</span>
            <span className="emblem-crosshair emblem-crosshair-x"/>
            <span className="emblem-crosshair emblem-crosshair-y"/>
            <span className="emblem-halo" aria-hidden="true"/>
            <span className="emblem-orbit emblem-orbit-back emblem-orbit-one"/>
            <span className="emblem-orbit emblem-orbit-back emblem-orbit-two"/>
            <span className="emblem-orbit emblem-orbit-back emblem-orbit-three"/>
            <span className="emblem-orbit emblem-orbit-back emblem-orbit-four"/>
            <span className="emblem-core">
              <span className="emblem-core-rim"/>
              <span className="emblem-letter">H</span>
              <span className="emblem-core-reflection"/>
            </span>
            <span className="emblem-orbit emblem-orbit-front emblem-orbit-one"/>
            <span className="emblem-orbit emblem-orbit-front emblem-orbit-two"/>
            <span className="emblem-orbit emblem-orbit-front emblem-orbit-three"/>
            <span className="emblem-orbit emblem-orbit-front emblem-orbit-four"/>
            <span className="emblem-satellite emblem-satellite-one"/>
            <span className="emblem-satellite emblem-satellite-two"/>
            <span className="emblem-satellite emblem-satellite-three"/>
            <span className="emblem-stage-caption">H <i/> THE CREATIVE CONSTANT</span>
          </div></MotionSurface>
          <div className="hero-art-footer"><span>OBSIDIAN / GRAPHITE / LIGHT</span><span>DESIGNED TO EXPLORE</span></div>
        </div>
      </div>
      <div className="hero-studio-bottom"><span>{home.location || general.location || 'DIGITAL CREATOR / WORLDWIDE'}</span><span>{home.scroll_text || 'SCROLL TO EXPLORE'} <i>↓</i></span></div>
    </section>}
    <section className="ticker" aria-label="Creative principles"><div className="ticker-track"><div className="ticker-group"><span>BUILD WITH PURPOSE</span><i>✳</i><span>CREATE WITH CURIOSITY</span><i>✳</i><span>EXPERIMENT OFTEN</span><i>✳</i></div><div className="ticker-group" aria-hidden="true"><span>BUILD WITH PURPOSE</span><i>✳</i><span>CREATE WITH CURIOSITY</span><i>✳</i><span>EXPERIMENT OFTEN</span><i>✳</i></div></div></section>
    {enabled('about') && <section className="section wrap" id="about"><Reveal><div className="section-head"><span className="section-no">{(section('about')?.icon_url||section('about')?.icon_name)&&<ContentIcon name={section('about')?.icon_name||"Info"} imageUrl={section('about')?.icon_url} className="section-custom-icon" size={16}/>}01 / ABOUT</span><span className="section-note">A LITTLE CONTEXT</span></div><div className="about-grid"><h2>{about.heading || 'About'}<br/><span className="muted">{about.subheading || ''}</span></h2><div className="about-copy"><p className="lead">{about.lead || ''}</p><p>{about.body || ''}</p><div className="about-meta"><div><span>FOCUS</span><b>{about.focus || ''}</b></div><div><span>APPROACH</span><b>{about.approach || ''}</b></div></div></div></div></Reveal></section>}
    {enabled('work') && <section className="section work-section" id="work"><div className="wrap"><Reveal><div className="section-head"><span className="section-no">{(section('work')?.icon_url||section('work')?.icon_name)&&<ContentIcon name={section('work')?.icon_name||"FolderKanban"} imageUrl={section('work')?.icon_url} className="section-custom-icon" size={16}/>}02 / SELECTED WORK</span><span className="section-note">A FEW THINGS IN MOTION</span></div><div className="work-heading"><h2>{work.heading || 'Selected'}<br/><em>{work.subheading || 'work.'}</em></h2><p>{work.description || ''}</p></div></Reveal><div className="project-grid">{data.projects.map((project,index)=><ProjectCard key={project.id} project={project} index={index}/>)}</div>{!data.projects.length && <p className="placeholder-note">New projects will appear here as they are published from the admin workspace.</p>}</div></section>}
    {enabled('skills') && <section className="section wrap" id="skills"><Reveal><div className="section-head"><span className="section-no">{(section('skills')?.icon_url||section('skills')?.icon_name)&&<ContentIcon name={section('skills')?.icon_name||"Wrench"} imageUrl={section('skills')?.icon_url} className="section-custom-icon" size={16}/>}03 / EXPERTISE</span><span className="section-note">{skills.note || ''}</span></div><div className="skills-layout"><h2>{skills.heading || 'Expertise'}<br/><span className="muted">{skills.subheading || ''}</span></h2>{data.skills.length ? <SkillsExplorer skills={data.skills}/> : <p className="placeholder-note">Expertise will appear here once added in the admin workspace.</p>}</div></Reveal></section>}
    {data.services.length>0 && <section className="section wrap" id="services"><Reveal><div className="section-head"><span className="section-no">{(section('services')?.icon_url||section('services')?.icon_name)&&<ContentIcon name={section('services')?.icon_name||"Wrench"} imageUrl={section('services')?.icon_url} className="section-custom-icon" size={16}/>}04 / SERVICES</span><span className="section-note">WHAT I CAN HELP WITH</span></div><div className="admin-overview-grid">{data.services.map((service)=><article key={service.id}>{(service.icon_url||service.icon_name||service.icon) ? <ContentIcon name={service.icon_name||service.icon||'Wrench'} imageUrl={service.icon_url} className="cms-icon-image" size={22}/> : <Wrench/>}<h3>{service.title}</h3><p>{service.description}</p></article>)}</div></Reveal></section>}
    {enabled('creator') && <Reveal className="creator-reveal"><section className="creator-band" id="creator"><div className="wrap creator-inner"><div><span className="section-no">{(section('creator')?.icon_url||section('creator')?.icon_name)&&<ContentIcon name={section('creator')?.icon_name||"Gamepad2"} imageUrl={section('creator')?.icon_url} className="section-custom-icon" size={16}/>}05 / CREATOR SPACE</span><h2>{creator.heading || 'Creator'}<br/>{creator.subheading || ''}</h2><p>{creator.description || ''}</p><div className="creator-actions"><a href={youtubeUrl} target="_blank" rel="noreferrer" className="button-primary"><Youtube size={17}/> {creator.youtube_label || 'Watch on YouTube'} <ArrowUpRight size={15}/></a><a href="#contact" className="button-ghost">Collaborate <ArrowUpRight size={15}/></a></div></div><div className="creator-visual"><div className="pixel-grid"/><div className="creator-stamp">{(creator.icon_url||creator.icon_name) ? <ContentIcon name={creator.icon_name||'Gamepad2'} imageUrl={creator.icon_url} className="creator-custom-icon" size={40}/> : <Gamepad2 size={40}/>}<span>PLAY<br/>CREATE<br/>REPEAT</span></div><Zap className="creator-bolt creator-bolt-one" size={27}/><Zap className="creator-bolt creator-bolt-two" size={20}/><Zap className="creator-bolt creator-bolt-three" size={16}/><span className="creator-caption">A DIFFERENT KIND OF PLAYGROUND</span></div></div></section></Reveal>}
    {data.videos.length>0 && <section className="section wrap" id="videos"><Reveal><div className="section-head"><span className="section-no">{(section('videos')?.icon_url||section('videos')?.icon_name)&&<ContentIcon name={section('videos')?.icon_name||"Youtube"} imageUrl={section('videos')?.icon_url} className="section-custom-icon" size={16}/>}06 / VIDEOS</span><span className="section-note">WATCH & EXPLORE</span></div><div className="project-grid">{data.videos.map((video)=><article className="project-card" key={video.id}><div className="video-frame">{videoId(video.youtube_url) ? <iframe src={'https://www.youtube-nocookie.com/embed/'+videoId(video.youtube_url)} title={video.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/> : <a href={video.youtube_url}><Play/></a>}</div><div className="project-info"><h3>{video.title}</h3><p>{video.description}</p></div></article>)}</div></Reveal></section>}
    {data.experiences.length>0 && <section className="section wrap career-section" id="experience"><Reveal><div className="section-head"><span className="section-no">{(section('experience')?.icon_url||section('experience')?.icon_name)&&<ContentIcon name={section('experience')?.icon_name||"BriefcaseBusiness"} imageUrl={section('experience')?.icon_url} className="section-custom-icon" size={16}/>}07 / EXPERIENCE</span><span className="section-note">INDEPENDENT PROJECTS & CREATIVE WORK</span></div>{featuredExperience && <article className="career-feature"><span className="career-feature-label">FOUNDER / CREATOR</span><div><h3>{featuredExperience.role}</h3><p>{featuredExperience.company}{featuredExperience.current_role ? ' · Present' : ''}</p><p>{featuredExperience.description}</p></div></article>}<div className="career-grid">{groupedExperiences.map((group,index)=><details className="career-group" key={group.title}><summary><span className="career-group-main"><span className="career-group-index">{String(index+1).padStart(2,'0')}</span><span className="career-group-copy"><strong>{group.title}</strong><small>{group.summary}</small></span></span><span className="career-group-count">{group.items.length} {group.items.length===1?'entry':'entries'}</span><span className="career-group-chevron" aria-hidden="true">+</span></summary><div className="career-items">{group.items.map((item)=><article className="career-item" key={item.id}><div className="career-item-heading"><h3>{item.role}</h3><span>{item.company}{item.current_role ? ' · Present' : ''}</span></div><p>{item.description}</p></article>)}</div></details>)}</div></Reveal></section>}
    {data.education.length>0 && <section className="section wrap career-section" id="education"><Reveal><div className="section-head"><span className="section-no">{(section('education')?.icon_url||section('education')?.icon_name)&&<ContentIcon name={section('education')?.icon_name||"GraduationCap"} imageUrl={section('education')?.icon_url} className="section-custom-icon" size={16}/>}08 / EDUCATION</span><span className="section-note">CURRENT STUDY & FUTURE ACADEMIC PATHWAYS</span></div>{currentEducation.map((item)=><article className="career-feature education-current" key={item.id}><span className="career-feature-label">CURRENTLY ENROLLED</span><div><h3>{item.qualification}</h3><p>{item.institution}</p><p>{item.description}</p></div></article>)}<div className="career-grid education-pathways">{groupedEducation.map((group,index)=><details className="career-group" key={group.title}><summary><span className="career-group-main"><span className="career-group-index">{String(index+1).padStart(2,'0')}</span><span className="career-group-copy"><strong>{group.title}</strong><small>{group.summary}</small></span></span><span className="career-group-count">{group.items.length} {group.items.length===1?'entry':'entries'}</span><span className="career-group-chevron" aria-hidden="true">+</span></summary><div className="career-items">{group.items.map((item)=><article className="career-item" key={item.id}><div className="career-item-heading"><h3>{item.qualification}</h3><span>{item.institution}</span></div><p>{item.description}</p></article>)}</div></details>)}</div></Reveal></section>}
    {data.articles.length>0 && <section className="section wrap" id="journal"><Reveal><div className="section-head"><span className="section-no">{(section('articles')?.icon_url||section('articles')?.icon_name)&&<ContentIcon name={section('articles')?.icon_name||"FileText"} imageUrl={section('articles')?.icon_url} className="section-custom-icon" size={16}/>}09 / JOURNAL</span><span className="section-note">NOTES & ARTICLES</span></div><div className="article-glass-grid">{data.articles.map((article)=><MotionSurface key={article.id} className="article-glass-card" intensity={0.55}><a className="article-glass-link" href={'/blog/'+article.slug}>{article.cover_url ? <div className="article-glass-media"><Image src={article.cover_url} alt={article.title+' cover'} width={1200} height={800} unoptimized loading="lazy"/><span className="article-glass-media-label">FIELD NOTES / {String(article.category||'JOURNAL').toUpperCase()}</span></div> : <div className="article-glass-placeholder"><FileText size={30}/><span>HADES JOURNAL</span></div>}<div className="article-glass-info"><span className="article-glass-meta">{article.published_at ? new Date(article.published_at).toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}) : 'LATEST NOTES'}</span><h3>{article.title}</h3><p>{article.excerpt}</p><span className="article-glass-read">READ ARTICLE <ArrowUpRight size={15}/></span></div></a></MotionSurface>)}</div></Reveal></section>}
    <MediaShowcase assets={data.mediaAssets}/>
    {data.testimonials.length>0 && <section className="section wrap"><Reveal><div className="section-head"><span className="section-no">{(section('testimonials')?.icon_url||section('testimonials')?.icon_name)&&<ContentIcon name={section('testimonials')?.icon_name||"Star"} imageUrl={section('testimonials')?.icon_url} className="section-custom-icon" size={16}/>}11 / TESTIMONIALS</span><span className="section-note">WORDS FROM OTHERS</span></div><div className="project-grid">{data.testimonials.map((item)=><article className="project-card" key={item.id}><div className="project-info">{(item.icon_url||item.icon_name) ? <ContentIcon name={item.icon_name||'Star'} imageUrl={item.icon_url} className="cms-icon-image" size={20}/> : <Star/>}<p className="lead">“{item.quote}”</p><h3>{item.person}</h3><p>{item.role}</p></div></article>)}</div></Reveal></section>}
    {enabled('contact') && <section className="section wrap" id="contact"><Reveal><div className="section-head"><span className="section-no">{(section('contact')?.icon_url||section('contact')?.icon_name)&&<ContentIcon name={section('contact')?.icon_name||"Mail"} imageUrl={section('contact')?.icon_url} className="section-custom-icon" size={16}/>}12 / CONTACT</span><span className="section-note">HAVE SOMETHING IN MIND?</span></div><div className="contact-grid"><h2>{contact.heading || "Let's connect"}<br/><em>{contact.subheading || ''}</em></h2><div className="contact-copy"><p className="lead">{contact.lead || ''}</p>{email && <a className="email-link" href={'mailto:'+email}>{email} <MoveUpRight size={18}/></a>}<ContactForm/><div className="socials">{socials.map((social)=><a key={social.id} href={social.url} aria-label={social.label || social.platform} target="_blank" rel="noreferrer"><ContentIcon name={social.icon_name||defaultSocialIcon(social.platform||'')} imageUrl={social.icon_url} className="social-custom-icon" size={17}/></a>)}{email&&<a href={'mailto:'+email} aria-label="Email"><Mail/></a>}</div></div></div></Reveal></section>}
    <section className="site-endcap wrap" aria-label="Explore and connect">
      <div className="site-endcap-top"><div><span className="section-no">ONE LAST THING / KEEP EXPLORING</span><h2>GOOD THINGS<br/><em>START HERE.</em></h2></div><a className="site-endcap-cta" href="#contact">START A CONVERSATION <ArrowUpRight size={16}/></a></div>
      <div className="site-endcap-bottom"><div className="site-endcap-links"><span>EXPLORE</span>{nav.map((item)=><a key={'end-'+(item.id || item.href)} href={item.href}>{item.label}</a>)}</div><div className="site-endcap-socials"><span>ELSEWHERE</span>{socials.map((social)=><a key={'end-social-'+social.id} href={social.url} aria-label={social.label || social.platform} target="_blank" rel="noreferrer"><ContentIcon name={social.icon_name||defaultSocialIcon(social.platform||'')} imageUrl={social.icon_url} size={17}/></a>)}</div></div>
    </section>
    <a className="back-to-top" href="#home" aria-label="Back to top">&uarr;</a><Reveal className="footer-reveal"><footer className="footer wrap"><Brand settings={data.settings}/><span>{general.footer_note || 'BUILT WITH CURIOSITY'} &middot; &copy; {new Date().getFullYear()}</span><a href="#home">BACK TO TOP &uarr;</a></footer></Reveal>
  </main>;
}
