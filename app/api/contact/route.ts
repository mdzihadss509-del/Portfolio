import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const limits = new Map<string,{count:number;expires:number}>();
const WINDOW_MS=10*60*1000;
const MAX_REQUESTS=5;

export async function POST(request:NextRequest) {
  const origin=request.headers.get('origin');
  const expected=new URL(request.url).origin;
  if(origin && origin!==expected) return NextResponse.json({error:'Invalid request origin.'},{status:403});
  const ip=(request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
  const now=Date.now();
  const bucket=limits.get(ip);
  if(bucket && bucket.expires>now && bucket.count>=MAX_REQUESTS) return NextResponse.json({error:'Too many messages. Please try again later.'},{status:429});
  if(!bucket || bucket.expires<=now) limits.set(ip,{count:1,expires:now+WINDOW_MS}); else bucket.count++;
  try {
    const body=await request.json();
    if(typeof body.website==='string' && body.website.trim()) return NextResponse.json({ok:true});
    const name=typeof body.name==='string'?body.name.trim():'';
    const email=typeof body.email==='string'?body.email.trim():'';
    const subject=typeof body.subject==='string'?body.subject.trim():'';
    const message=typeof body.message==='string'?body.message.trim():'';
    if(!name || name.length>120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length>254 || subject.length>160 || message.length<5 || message.length>5000) {
      return NextResponse.json({error:'Please check the form fields and try again.'},{status:400});
    }
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if(!url||!key) return NextResponse.json({error:'Contact form is not configured yet.'},{status:503});
    const supabase=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
    const {error}=await supabase.from('contact_messages').insert({name,email,subject:subject||null,message});
    if(error) throw error;
    return NextResponse.json({ok:true});
  } catch(error) {
    console.error('Contact form error:',error);
    return NextResponse.json({error:'Unable to send your message right now.'},{status:500});
  }
}