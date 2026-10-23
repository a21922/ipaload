import { NextResponse } from 'next/server';
import { readCatalog, writeCatalog } from '@/lib/webdav';
import { isAdminRequest } from '@/lib/auth';
export const runtime = 'nodejs';
export async function GET() { try { return NextResponse.json(await readCatalog()); } catch(e) { return NextResponse.json({error:e instanceof Error?e.message:'Storage error'},{status:500}); } }
export async function POST(req:Request) {
 if (!isAdminRequest()) return NextResponse.json({error:'未登录'},{status:401});
 try { const body=await req.json(); const apps=await readCatalog(); const i=apps.findIndex(a=>a.id===body.id); if(body.action==='delete'){if(i>=0) apps.splice(i,1);} else if(body.action==='toggleFeatured'){if(i>=0) apps[i].featured=!apps[i].featured;} else if(body.action==='update'){if(i<0)return NextResponse.json({error:'应用不存在'},{status:404}); apps[i]={...apps[i],...body.app,updatedAt:new Date().toISOString()};} else return NextResponse.json({error:'未知操作'},{status:400}); await writeCatalog(apps); return NextResponse.json({ok:true,apps}); } catch(e){return NextResponse.json({error:e instanceof Error?e.message:'操作失败'},{status:500});}
}
