/* Original vector rig and local playback. No CoinPoker character animation is implied. */
(() => {
  'use strict';
  const asset = 'support/prototype/assets/momo.svg';
  async function load() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    try {
      const response = await fetch(asset, {signal:controller.signal});
      if (!response.ok) throw new Error('Character artwork could not load');
      const document = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
      if (document.querySelector('parsererror') || !document.querySelector('[data-part="character"]')) throw new Error('Invalid character artwork');
      return document.documentElement;
    } finally { clearTimeout(timeout); }
  }
  function create({ artwork, ui, anchor, targetAnchor, canThrow, enabled, notify }) {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let scene, source, rig, facing, home, emotePose, geometry, recipient;
    let animations=[], timers=[], walking=[], generation=0, pending=null, handFrame=0, active=false;
    const pose=(x,y,scale=.6)=>`translate(${x}px, ${y}px) scale(${scale})`;
    const schedule=(callback,delay)=>{
      const token=generation;
      timers.push(setTimeout(()=>{if(token===generation){try{callback();}catch(error){reset();notify('Momo was restored after a playback error.');console.error(error);}}},delay));
    };
    function stopWalking(){walking.forEach(animation=>animation.cancel());walking=[];}
    function stopPlayback(){
      generation++;timers.forEach(clearTimeout);timers=[];
      animations.forEach(animation=>animation.cancel());animations=[];
      stopWalking();cancelAnimationFrame(handFrame);handFrame=0;
    }
    function reset(){
      stopPlayback();pending=null;active=false;
      source?.classList.remove('cms-character-performing');
      scene?.remove();scene=source=rig=facing=recipient=null;
    }
    function finish(){const next=pending;reset();if(next)run(next.action,next.prepare);}
    function animate(element,frames,duration,options={}){
      const animation=element.animate(frames,{duration,easing:'ease-in-out',fill:'forwards',...options});
      animations.push(animation);return animation;
    }
    function joint(name,frames,duration,options){return animate(rig.querySelector(`[data-joint="${name}"]`),frames,duration,options);}
    function setPhase(value){scene.dataset.phase=value;}
    function mount(expression){
      source=anchor();if(!source?.isConnected)return false;
      const a=source.getBoundingClientRect(),bounds=ui.getBoundingClientRect();
      const unit=Math.max(.62,Math.min(.88,a.width/100*1.5));
      const size=a.width/unit, cx=150, cy=330-size/2;
      geometry={unit,size,cx,cy,left:a.left-bounds.left+a.width/2-150*unit,top:a.bottom-bounds.top-330*unit,bounds};
      // Only the body changes scale. The ring matches the original seat at every phase.
      const portraitScale=size*.92/140;
      home=pose(cx-90*portraitScale,cy-73*portraitScale,portraitScale);
      emotePose=pose(96,208);
      scene=document.createElementNS('http://www.w3.org/2000/svg','svg');
      scene.id='cms-character-scene';scene.classList.add('cms-character-scene');
      scene.setAttribute('viewBox','0 0 300 360');scene.setAttribute('aria-hidden','true');scene.dataset.expression=expression;
      Object.assign(scene.style,{width:300*unit+'px',height:360*unit+'px',left:geometry.left+'px',top:geometry.top+'px'});
      scene.innerHTML=`<defs><clipPath id="cms-momo-portal"><circle cx="${cx}" cy="${cy}" r="${size*.46}"/></clipPath></defs><circle cx="${cx}" cy="${cy}" r="${size*.46}" fill="#153f3b"/><image data-character-ring="" x="${cx-size/2}" y="${330-size}" width="${size}" height="${size}"/><g data-character-window="" clip-path="url(#cms-momo-portal)"><g data-character-motion=""><g data-character-facing=""></g></g><g data-grip-arms="" fill="none" stroke-linecap="round" opacity="0"><path data-grip-left="" stroke="#422823" stroke-width="7"/><path data-grip-left="" stroke="#de773d" stroke-width="4"/><path data-grip-right="" stroke="#422823" stroke-width="7"/><path data-grip-right="" stroke="#de773d" stroke-width="4"/></g></g><g data-character-grips="" fill="#fff0c9" stroke="#422823" stroke-width="1.5"><ellipse cx="${cx-size*.38}" cy="${cy-size*.26}" rx="4" ry="3"/><ellipse cx="${cx+size*.38}" cy="${cy-size*.26}" rx="4" ry="3"/></g><g data-character-effects=""></g>`;
      scene.append(artwork.querySelector('style').cloneNode(true));
      rig=scene.querySelector('[data-character-motion]');facing=scene.querySelector('[data-character-facing]');
      facing.append(artwork.querySelector('[data-part="character"]').cloneNode(true));
      rig.style.transform=home;
      scene.querySelector('[data-character-ring]').setAttribute('href',source.querySelector('.cms-avatar-ring').getAttribute('src'));
      ui.append(scene);source.classList.add('cms-character-performing');return true;
    }
    function openPortal(){scene.querySelector('[data-character-window]').removeAttribute('clip-path');}
    function expression(name){
      openPortal();
      if(reduced.matches){rig.style.transform=emotePose;setPhase('expression');schedule(finish,900);return;}
      setPhase('emerging');animate(rig,[{transform:home},{transform:emotePose}],240,{easing:'cubic-bezier(.2,.8,.3,1)'});
      schedule(()=>{
        setPhase('expression');
        const body=name==='happy'?[emotePose,pose(96,198),emotePose]:name==='sad'?[emotePose,emotePose]:[emotePose,pose(93,208),pose(99,208),emotePose];
        animate(rig,body.map(transform=>({transform})),name==='angry'?240:650,{iterations:name==='angry'?3:2});
        if(name==='happy'){
          joint('arm-left',[{transform:'rotate(0deg)'},{transform:'rotate(135deg)'},{transform:'rotate(110deg)'},{transform:'rotate(135deg)'}],650,{iterations:2});
          joint('arm-right',[{transform:'rotate(0deg)'},{transform:'rotate(-135deg)'},{transform:'rotate(-110deg)'},{transform:'rotate(-135deg)'}],650,{iterations:2});
          animate(rig.querySelector('[data-part="ears"]'),[{transform:'rotate(-4deg)'},{transform:'rotate(4deg)'},{transform:'rotate(-4deg)'}],400,{iterations:3});
          animate(rig.querySelector('[data-part="tail"]'),[{transform:'rotate(-7deg)'},{transform:'rotate(7deg)'},{transform:'rotate(-7deg)'}],400,{iterations:3});
        }
        if(name==='sad'){
          animate(rig.querySelector('[data-part="head"]'),[{transform:'rotate(0deg)'},{transform:'rotate(-7deg)'},{transform:'rotate(0deg)'}],1350);
          animate(rig.querySelector('[data-face="sad"] path[fill="#79d3ed"]'),[{transform:'translateY(-3px)',opacity:0},{transform:'translateY(0)',opacity:1},{transform:'translateY(9px)',opacity:0}],750,{iterations:2});
        }
        if(name==='angry'){
          joint('arm-left',[{transform:'rotate(0deg)'},{transform:'rotate(55deg)'}],200);
          joint('arm-right',[{transform:'rotate(0deg)'},{transform:'rotate(-55deg)'}],200);
          animate(rig.querySelector('[data-part="head"]'),[{transform:'translateY(0)'},{transform:'translateY(-2px)'},{transform:'translateY(0)'}],320,{iterations:3});
          joint('leg-left',[{transform:'rotate(0deg)'},{transform:'rotate(12deg)'},{transform:'rotate(0deg)'}],320,{iterations:3});
        }
      },260);
      schedule(()=>returnHome(true),1800);
    }
    function returnHome(keepPending=false){
      if(!scene){reset();return false;}
      if(reduced.matches){if(keepPending)finish();else reset();return true;}
      const from=getComputedStyle(rig).transform;
      stopPlayback();if(!keepPending)pending=null;setPhase('returning');releaseGrip();
      scene.querySelector('[data-character-effects]').replaceChildren();facing.querySelector('[data-held-prop]')?.remove();
      facing.removeAttribute('transform');rig.style.opacity='1';
      // Restore the portrait crop only after the body has returned to its seat.
      openPortal();animate(rig,[{transform:from},{transform:home}],450);
      schedule(()=>{scene.querySelector('[data-character-window]').setAttribute('clip-path','url(#cms-momo-portal)');},400);
      schedule(finish,470);return true;
    }
    function grip(){
      const token=generation,arms=scene.querySelector('[data-grip-arms]');
      rig.querySelector('[data-part="arms"]').style.opacity='0';arms.setAttribute('opacity','1');scene.querySelector('[data-character-grips]').style.opacity='1';
      const follow=()=>{
        if(token!==generation||!scene)return;
        const matrix=scene.getScreenCTM().inverse().multiply(rig.querySelector('[data-part="character"]').getScreenCTM());
        for(const [side,x,sign] of [['left',55,-1],['right',125,1]]){
          const shoulder=new DOMPoint(x,116).matrixTransform(matrix),end=geometry.cx+geometry.size*.38*sign;
          const path=`M${shoulder.x} ${shoulder.y} Q${end} ${shoulder.y+8} ${end} ${geometry.cy-geometry.size*.26}`;
          scene.querySelectorAll(`[data-grip-${side}]`).forEach(el=>el.setAttribute('d',path));
        }
        handFrame=requestAnimationFrame(follow);
      };follow();
    }
    function releaseGrip(){
      cancelAnimationFrame(handFrame);handFrame=0;
      scene.querySelector('[data-grip-arms]').setAttribute('opacity','0');scene.querySelector('[data-character-grips]').style.opacity='0';
      rig.querySelector('[data-part="arms"]').style.opacity='1';
    }
    function climb(next){
      if(reduced.matches){rig.style.transform=emotePose;openPortal();setPhase('reduced');schedule(finish,900);return;}
      setPhase('climbing');openPortal();scene.dataset.step='reach';scene.dataset.expression='idle';
      const duration=next?1100:1850;
      joint('arm-left',[{transform:'rotate(0deg)'},{transform:'rotate(145deg)',offset:.2},{transform:'rotate(90deg)',offset:.48},{transform:'rotate(0deg)'}],duration);
      joint('arm-right',[{transform:'rotate(0deg)'},{transform:'rotate(-145deg)',offset:.2},{transform:'rotate(-80deg)',offset:.48},{transform:'rotate(0deg)'}],duration);
      joint('leg-left',[{transform:'rotate(0deg)'},{transform:'rotate(0deg)',offset:.4},{transform:'rotate(65deg)',offset:.62},{transform:'rotate(-15deg)',offset:.83},{transform:'rotate(0deg)'}],duration);
      joint('leg-right',[{transform:'rotate(0deg)'},{transform:'rotate(-45deg)',offset:.63},{transform:'rotate(30deg)',offset:.85},{transform:'rotate(0deg)'}],duration);
      animate(rig.querySelector('[data-part="character"]'),[{transform:'rotate(0deg)'},{transform:'rotate(-10deg)',offset:.6},{transform:'rotate(5deg)',offset:.82},{transform:'rotate(0deg)'}],duration);
      animate(rig,[{transform:home},{transform:pose(96,185),offset:.66},{transform:pose(96,200),offset:.85},{transform:emotePose}],duration);
      schedule(()=>{scene.dataset.step='grip';grip();},duration*.18);
      schedule(()=>{scene.dataset.step='pull';},duration*.35);
      schedule(()=>{releaseGrip();scene.dataset.step='step-over';},duration*.53);
      schedule(()=>{
        setPhase('outside');scene.dataset.step='land';scene.dataset.expression='happy';
        if(next)next();else schedule(()=>returnHome(true),900);
      },duration+20);
    }
    function walk(from,to,duration,next){
      stopWalking();
      for(const [name,angle] of [['leg-left',26],['leg-right',-26],['arm-left',-18],['arm-right',18]]){
        walking.push(joint(name,[{transform:`rotate(${-angle}deg)`},{transform:`rotate(${angle}deg)`},{transform:`rotate(${-angle}deg)`}],240,{iterations:Infinity}));
      }
      walking.push(animate(facing,[{transform:'translateY(0)'},{transform:'translateY(-3px)'},{transform:'translateY(0)'}],240,{iterations:Infinity}));
      animate(rig,[{transform:from},{transform:to}],duration,{easing:'linear'});
      schedule(()=>{stopWalking();next();},duration+10);
    }
    function point(x,y){return {x:(x-geometry.left)/geometry.unit,y:(y-geometry.top)/geometry.unit};}
    function route(target){
      const a=targetAnchor(target)?.getBoundingClientRect();if(!a)return null;
      const b=geometry.bounds,u=geometry.unit;
      const targetX=a.left-b.left+a.width/2,targetY=a.top-b.top+a.height/2;
      const side=target===1?'right':target===2?'top':'left';
      let direction=side==='left'?1:-1;
      const gap=a.width/2+49*u;
      // At narrow edge seats, stand on the available side instead of over the target.
      const preferred=targetX-direction*gap;
      if(preferred<50*u||preferred>b.width-50*u)direction*=-1;
      const center=Math.max(50*u,Math.min(b.width-50*u,targetX-direction*gap));
      const feet=Math.max(210*.6*u+8,Math.min(b.height-8,a.bottom-b.top+8*u));
      const destination=point(center-90*.6*u,feet-203*.6*u);
      const entrance={...destination};
      if(side==='right')entrance.x=(b.width-geometry.left)/u+30;
      if(side==='left')entrance.x=(-geometry.left)/u-140;
      if(side==='top')entrance.y=(-geometry.top)/u-150;
      return {side,direction,destination,entrance,target:point(targetX,targetY)};
    }
    function svg(markup){const group=document.createElementNS('http://www.w3.org/2000/svg','g');group.innerHTML=markup;return group;}
    function impact(action,target){
      const effects=scene.querySelector('[data-character-effects]');
      const splash=svg(action==='A'
        ? '<path d="M-22-9L-9-5L-11-22L1-9L14-24L13-7L28-7L15 3L24 17L8 11L0 26L-6 10L-24 16L-16 2Z" fill="#75ddf4" fill-opacity=".75" stroke="#d8faff" stroke-width="2"/><circle cx="-28" cy="-17" r="3" fill="#a9efff"/><circle cx="30" cy="18" r="4" fill="#a9efff"/>'
        : '<path d="M-20-15L-5-9L-1-26L7-8L22-16L15 0L28 8L10 10L13 26L-1 14L-17 22L-12 7L-28 1L-12-4Z" fill="#ffdb67" fill-opacity=".7"/><path d="M-15-8Q-11 17 17 10Q1 33-19 15Q-28 2-15-8Z" fill="#ffd343" stroke="#836329" stroke-width="2"/>');
      splash.setAttribute('data-character-impact',action);splash.setAttribute('transform',`translate(${target.x} ${target.y})`);effects.append(splash);
      if(!reduced.matches){
        animate(splash,[{opacity:0},{opacity:1,offset:.2},{opacity:1,offset:.7},{opacity:0}],650);
        animate(recipient,[{transform:'rotate(0deg)'},{transform:'rotate(-9deg)'},{transform:'rotate(9deg)'},{transform:'rotate(0deg)'}],400);
      }
    }
    function act(action,trip,next){
      if(!canThrow(action.target)){reset();return;}
      setPhase('acting');scene.dataset.expression='happy';
      facing.setAttribute('transform',trip.direction===-1?'translate(180 0) scale(-1 1)':'');
      const prop=svg(action.action==='A'
        ? '<path d="M153 97H185V109H168L163 124H153L156 108H149V101Z" fill="#58c9dd" stroke="#245567" stroke-width="3"/><rect x="160" y="88" width="17" height="10" rx="3" fill="#f5b24e" stroke="#734e2b" stroke-width="2"/>'
        : '<path d="M151 91Q158 114 179 103Q169 124 151 113Q140 103 151 91Z" fill="#ffda48" stroke="#886225" stroke-width="3"/>');
      prop.setAttribute('data-held-prop',action.action);facing.append(prop);
      const arm=rig.querySelector('[data-joint="arm-right"]');
      if(reduced.matches){arm.style.transform='rotate(-65deg)';impact(action.action,trip.target);schedule(finish,1000);return;}
      joint('arm-right',[{transform:'rotate(0deg)'},{transform:'rotate(-65deg)'}],180);
      schedule(()=>{
        const muzzle={x:trip.destination.x+(trip.direction===1?186:-6)*.6,y:trip.destination.y+102*.6};
        const effects=scene.querySelector('[data-character-effects]');
        if(action.action==='A'){
          const stream=svg(`<path d="M${muzzle.x} ${muzzle.y} Q${(muzzle.x+trip.target.x)/2} ${trip.target.y-18} ${trip.target.x} ${trip.target.y}" fill="none" stroke="#9cecff" stroke-width="5" stroke-linecap="round" stroke-dasharray="8 6"/>`);
          effects.append(stream);animate(stream,[{opacity:0},{opacity:1,offset:.2},{opacity:1,offset:.75},{opacity:0}],600);impact('A',trip.target);
        }else{
          prop.style.visibility='hidden';
          const banana=svg('<path d="M-10-12Q-4 9 13 1Q8 22-10 11Q-21 0-10-12Z" fill="#ffda48" stroke="#886225" stroke-width="2"/>');
          effects.append(banana);
          animate(banana,[{transform:pose(muzzle.x,muzzle.y,1)},{transform:pose((muzzle.x+trip.target.x)/2,Math.min(muzzle.y,trip.target.y)-40,1),offset:.5},{transform:pose(trip.target.x,trip.target.y,1)}],350);
          schedule(()=>{banana.remove();impact('B',trip.target);},350);
        }
      },220);
      schedule(()=>{prop.remove();scene.querySelector('[data-character-effects]').replaceChildren();next();},1250);
    }
    function journey(action){
      recipient=targetAnchor(action.target);
      const trip=route(action.target);if(!trip||!canThrow(action.target)){reset();return;}
      scene.dataset.target=action.target;scene.dataset.action=action.action;scene.dataset.entrySide=trip.side;scene.dataset.exitSide='bottom';
      const dest=pose(trip.destination.x,trip.destination.y),entry=pose(trip.entrance.x,trip.entrance.y);
      const exit=pose(96,(geometry.bounds.height-geometry.top)/geometry.unit+20);
      if(reduced.matches){openPortal();rig.style.transform=dest;act(action,trip);return;}
      climb(()=>{
        setPhase('exiting');walk(emotePose,exit,600,()=>{
          setPhase('offscreen');rig.style.opacity='0';
          schedule(()=>{
            if(!canThrow(action.target)){reset();return;}
            setPhase('entering');rig.style.opacity='1';
            walk(entry,dest,650,()=>act(action,trip,()=>{
              setPhase('leaving');facing.removeAttribute('transform');
              walk(dest,entry,500,()=>{
                setPhase('offscreen-return');rig.style.opacity='0';
                schedule(()=>{
                  setPhase('homecoming');rig.style.opacity='1';
                  walk(exit,emotePose,500,()=>returnHome(true));
                },160);
              });
            }));
          },240);
        });
      });
    }
    function run(request,prepare){
      const throwable=typeof request==='object'&&request?.kind==='throwable';
      const textOnly=request===null&&typeof prepare==='function';
      if(!textOnly&&(throwable?(!['A','B'].includes(request.action)||!canThrow(request.target)):!['happy','sad','angry','climb'].includes(request)))return 'unavailable';
      if(!textOnly&&!enabled()){notify('Select Momo in Settings → Avatars to use character actions.');return 'unavailable';}
      if(active){if(pending){notify('Momo is busy. One action is already queued.');return 'busy';}pending={action:request,prepare};notify('One action is queued.');return 'queued';}
      active=true;
      const token=generation,isCurrent=()=>generation===token&&active;
      const start=()=>{
        if(textOnly){finish();return;}
        if(!mount(throwable||request==='climb'?'happy':request)){finish();return;}
        if(throwable)journey(request);else if(request==='climb')climb();else expression(request);
      };
      const failed=error=>{if(!isCurrent())return;reset();notify('Momo could not play. The avatar is ready to try again.');console.error(error);};
      // Reserve the shared action slot before asynchronous work. The caller checks
      // isCurrent before committing a send, so reset also cancels unsent messages.
      try{
        if(prepare)Promise.resolve(prepare(isCurrent)).then(ready=>{if(isCurrent()){if(ready)start();else finish();}}).catch(failed);
        else start();
        return 'started';
      }catch(error){failed(error);return 'unavailable';}
    }
    const play=request=>run(request);
    window.addEventListener('resize',reset);window.addEventListener('blur',reset);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});reduced.addEventListener('change',reset);
    return Object.freeze({play,run,returnHome,reset});
  }
  window.MahjongCharacter=Object.freeze({asset,load,create});
})();
