import { Container, Graphics, GraphicsContext } from 'pixi.js';
/** Retained atmospheric geometry; animate transforms rather than rebuilding
 * rain paths or allocating particle objects on each frame. */
export class FarmWorldWeather {
  readonly root = new Container();
  private rainContext = new GraphicsContext().moveTo(0,0).lineTo(-5,17).stroke({color:0xd4eaf5,alpha:.65,width:1.5});
  private rain = Array.from({length:56},()=>this.root.addChild(new Graphics(this.rainContext)));
  private clouds = Array.from({length:4},()=>this.root.addChild(new Graphics().ellipse(0,0,150,24).ellipse(80,-12,110,26).fill({color:0xe4eff4,alpha:.09})));
  private sun=this.root.addChild(new Graphics().circle(0,0,68).fill({color:0xffe2a1,alpha:.05}).circle(0,0,39).fill({color:0xffe2a1,alpha:.09}).circle(0,0,22).fill({color:0xffe8b0,alpha:.65}));
  private moon=this.root.addChild(new Graphics().circle(0,0,30).fill({color:0xd6e7ff,alpha:.07}).circle(0,0,16).fill({color:0xd6e7ff,alpha:.8}).circle(7,-5,13).fill(0x263c55));
  private stars=Array.from({length:18},(_,i)=>this.root.addChild(new Graphics().circle(0,0,i%4===0?2:1).fill(0xe2f0ff)));
  private breeze=Array.from({length:8},()=>this.root.addChild(new Graphics().moveTo(0,0).quadraticCurveTo(24,-9,48,0).stroke({color:0xdceebc,alpha:.35,width:1.5})));
  update(now: number, width: number, height: number, weather: string, night: boolean, reduced: boolean, low: boolean){
    const t=reduced?0:now/1000;
    this.sun.visible=!night&&weather==='sunny';this.sun.position.set(width*.8,55);this.sun.scale.set(1+Math.sin(t*.5)*.04);
    this.moon.visible=night&&weather!=='rain';this.moon.position.set(width*.8,50);
    this.rain.forEach((drop,i)=>{drop.visible=weather==='rain'&&i<(low?28:56);if(drop.visible)drop.position.set((i*137+t*37)%(width+40)-20,(i*89+t*430)%(height+30)-20);});
    this.clouds.forEach((cloud,i)=>{cloud.visible=weather==='cool'||weather==='rain';cloud.alpha=night?.65:1;cloud.position.set((i*width/3+t*(weather==='cool'?10:5))%(width+400)-200,height*(.18+i*.2));});
    this.stars.forEach((star,i)=>{star.visible=night&&weather!=='rain';star.position.set((i*167+21)%width,20+(i*41)%Math.max(40,height*.4));star.alpha=.3+(Math.sin(t*.8+i)+1)*.3;});
    this.breeze.forEach((wind,i)=>{wind.visible=weather==='cool'||weather==='calm';wind.position.set((i*143+t*28)%(width+80)-60,height*.25+(i*83)%(height*.7));wind.alpha=.25+(Math.sin(t+i)+1)*.3;});
  }
  destroy(){this.root.destroy({children:true});this.rainContext.destroy();}
}
