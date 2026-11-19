'use client';
import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactForm() {
  const [state,setState]=useState<'idle'|'sending'|'sent'|'error'>('idle');
  const [message,setMessage]=useState('');
  async function submit(event:React.FormEvent<HTMLFormElement>) {
    const formElement = event.currentTarget;
    event.preventDefault();
    setState('sending');setMessage('');
    const form=new FormData(formElement);
    const payload={name:String(form.get('name')||''),email:String(form.get('email')||''),subject:String(form.get('subject')||''),message:String(form.get('message')||''),website:String(form.get('website')||'')};
    try {
      const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'Unable to send your message.');
      setState('sent');setMessage('Your message has been sent. Thank you for reaching out.');formElement.reset();
    } catch(error) {setState('error');setMessage(error instanceof Error?error.message:'Something went wrong. Please try again.');}
  }
  return <form className="contact-form" onSubmit={submit}>
    <label>Your name<input name="name" autoComplete="name" maxLength={120} required placeholder="Your name"/></label>
    <label>Email address<input name="email" type="email" autoComplete="email" maxLength={254} required placeholder="you@example.com"/></label>
    <label>Subject<input name="subject" maxLength={160} placeholder="What would you like to discuss?"/></label>
    <label>Message<textarea name="message" rows={5} maxLength={5000} required placeholder="Tell me a little about your idea..."/></label>
    <label className="contact-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
    <button className="button-primary" type="submit" disabled={state==='sending'}>{state==='sending'?'Sending…':'Send message'} <Send size={15}/></button>
    {message&&<p className={'contact-feedback '+(state==='sent'?'success':state==='error'?'error':'')}>{state==='sent'?<CheckCircle2 size={16}/>:state==='error'?<AlertCircle size={16}/>:null}{message}</p>}
  </form>;
}