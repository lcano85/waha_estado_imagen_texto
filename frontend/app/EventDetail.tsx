'use client';
import {useState} from 'react';
import {terranovaApi} from '../services/api';
import DayPicker from './DayPicker';
const days=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
export default function EventDetail({promotion,schedules=[],configurations,startEditing=false,onClose,onSaved}:{promotion:any;schedules:any[];configurations:any[];startEditing?:boolean;onClose:()=>void;onSaved:()=>void}){
 const[editing,setEditing]=useState(startEditing),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const[form,setForm]=useState({...promotion,selectedDays:schedules.map(s=>s.dayOfWeek),sendTime:schedules[0]?.sendTime?.slice(0,5)||'09:00'});
 const config=configurations.find(c=>c.id===form.configurationId);
 const save=async()=>{setBusy(true);setError('');try{
  await terranovaApi.updatePromotion(promotion.id,{name:form.name,imageUrl:form.imageUrl,message:form.message,shift:form.shift,configurationId:+form.configurationId,active:form.active});
  await terranovaApi.replaceSchedules(promotion.id,form.selectedDays,form.sendTime,form.active);
  onSaved();
 }catch(e){setError(String(e))}finally{setBusy(false)}};
 return <div className="overlay detailOverlay"><section className="eventDetail">
  <button className="x" onClick={onClose}>×</button><div className="detailColor" style={{background:config?.color}}/>
  <label>DETALLE DE PROMOCIÓN</label><h2>{editing?'Editar evento':form.name}</h2>{error&&<div className="loginError">{error}</div>}
  <div className="detailLayout"><div>{form.imageUrl&&<img src={form.imageUrl} alt={form.name}/>}<span className="pill" style={{background:config?.color}}>{config?.name}</span></div>
  <div className="detailFields">{editing?<>
   <label>Nombre<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
   <label>URL de imagen<input value={form.imageUrl} onChange={e=>setForm({...form,imageUrl:e.target.value})}/></label>
   <label>Mensaje<textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/></label>
   <label>Configuración<select value={form.configurationId} onChange={e=>setForm({...form,configurationId:+e.target.value})}>{configurations.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
   <label className="editStatus">Estado<select value={form.active?'active':'inactive'} onChange={e=>setForm({...form,active:e.target.value==='active'})}><option value="active">Activa — habilita envío y cron</option><option value="inactive">Inactiva — bloquea envío y cron</option></select></label>
   <div className="row"><label>Turno<select value={form.shift} onChange={e=>setForm({...form,shift:e.target.value})}><option value="MORNING">Mañana</option><option value="AFTERNOON">Tarde</option></select></label><label>Hora<input type="time" value={form.sendTime} onChange={e=>setForm({...form,sendTime:e.target.value})}/></label></div><DayPicker value={form.selectedDays} onChange={selectedDays=>setForm({...form,selectedDays})}/>
  </>:<><p>{form.message}</p><dl><div><dt>Configuración</dt><dd>{config?.name}</dd></div><div><dt>Turno</dt><dd>{form.shift==='MORNING'?'Mañana':'Tarde'}</dd></div><div><dt>Días programados</dt><dd>{form.selectedDays.map((d:number)=>days[d-1]).join(', ')} · {form.sendTime}</dd></div><div><dt>Estado</dt><dd className={form.active?'activeText':'inactiveText'}>{form.active?'● Activa':'○ Inactiva'}</dd></div></dl></>}</div></div>
  <footer>{editing&&<button className="ghost" onClick={()=>setEditing(false)}>Cancelar</button>}<button className="primary" disabled={busy} onClick={editing?save:()=>setEditing(true)}>{busy?'⏳ Guardando…':editing?'Guardar cambios':'Editar información'}</button></footer>
 </section></div>
}
