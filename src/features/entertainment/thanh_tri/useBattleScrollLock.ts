import {useEffect,type RefObject} from 'react';
import {useBodyScrollLock} from '../../../components/overlay/AppOverlay';

/** Lock the actual app scroll ancestors, as well as the document. Dialogs and
 * the live skill tooltip retain their independent scroll containers. */
export function useBattleScrollLock(root:RefObject<HTMLDivElement|null>,enabled:boolean) {
 useBodyScrollLock(enabled);
 useEffect(()=>{
  const screen=root.current;if(!enabled||!screen)return;
  const ancestors:{node:HTMLElement;overflow:string;overscroll:string;x:number;y:number}[]=[];
  for(let node=screen.parentElement;node&&node!==document.body;node=node.parentElement){
   const style=getComputedStyle(node);
   if(/auto|scroll/.test(style.overflow+style.overflowX+style.overflowY)){
    ancestors.push({node,overflow:node.style.overflow,overscroll:node.style.overscrollBehavior,x:node.scrollLeft,y:node.scrollTop});
    node.style.overflow='hidden';node.style.overscrollBehavior='none';
   }
  }
  const canScroll=(target:EventTarget|null)=>target instanceof Element&&Boolean(target.closest('.tt-veil,.tt-library,.tt-skill-tooltip,.tt-core-overlay'));
  const block=(event:Event)=>{if(!canScroll(event.target)&&event.cancelable)event.preventDefault();};
  const keyboard=(event:KeyboardEvent)=>{
   if(canScroll(event.target)||event.target instanceof HTMLInputElement||event.target instanceof HTMLTextAreaElement)return;
   if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','PageUp','PageDown','Home','End'].includes(event.key)||event.key===' '&&!(event.target instanceof Element&&event.target.closest('button')))event.preventDefault();
  };
  screen.addEventListener('touchmove',block,{passive:false});screen.addEventListener('wheel',block,{passive:false});screen.addEventListener('keydown',keyboard);
  return()=>{
   screen.removeEventListener('touchmove',block);screen.removeEventListener('wheel',block);screen.removeEventListener('keydown',keyboard);
   for(const {node,overflow,overscroll,x,y} of ancestors){node.style.overflow=overflow;node.style.overscrollBehavior=overscroll;node.scrollLeft=x;node.scrollTop=y;}
  };
 },[root,enabled]);
}
