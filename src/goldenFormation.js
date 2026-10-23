// Local, finite canvas treatment of the original transparent PNG.
// Particles land on opaque source pixels; no figures are redrawn or separated.
export function createGoldenFormation(canvas, image) {
  const width = image.getBoundingClientRect().width;
  const height = width * image.naturalHeight / image.naturalWidth;
  if (!width || !height) throw Error('Invalid artwork bounds');
  const padX = 28, padTop = 66, padBottom = 20;
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.ceil((width + padX * 2) * ratio);
  canvas.height = Math.ceil((height + padTop + padBottom) * ratio);
  Object.assign(canvas.style, { left: -padX+'px', top: -padTop+'px', width: width+padX*2+'px', height: height+padTop+padBottom+'px' });
  const ctx = canvas.getContext('2d');
  const makeBuffer = () => {
    const node = document.createElement('canvas');
    node.width = Math.ceil(width * ratio); node.height = Math.ceil(height * ratio);
    const context = node.getContext('2d', { willReadFrequently: true });
    if (!context) throw Error('Canvas unavailable');
    context.scale(ratio, ratio);
    return { node, context };
  };
  if (!ctx) throw Error('Canvas unavailable');
  ctx.scale(ratio, ratio);
  const source = makeBuffer(), mask = makeBuffer(), revealed = makeBuffer();
  source.context.drawImage(image, 0, 0, width, height);
  const pixels = source.context.getImageData(0, 0, source.node.width, source.node.height).data;
  const points = [];
  for (let y=0; y<source.node.height; y+=3) for (let x=0; x<source.node.width; x+=3) {
    if(pixels[(y*source.node.width+x)*4+3]>80) points.push({x:x/ratio,y:y/ratio});
  }
  if (!points.length) throw Error('No artwork pixels');
  // Stable variation makes the choreography repeatable during visual review.
  let seed=371;
  const random=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
  const clamp=n=>Math.max(0,Math.min(1,n));
  const smooth=n=>{const t=clamp(n);return t*t*(3-2*t);};
  const particles=Array.from({length:28},()=>{
    const target=points[Math.floor(random()*points.length)];
    return {...target, startX:target.x+(random()-.5)*width*.6,
      startY:target.y+(random()-.5)*height*.4,
      delay:random()*.24, duration:.36+random()*.29,
      size:.45+random()*.95, brightness:.4+random()*.48,
      phase:random()*Math.PI*2, drift:6+random()*12, glint:random()>.86};
  });
  // The first light is between their faces. The flattened original is revealed
  // spatially: figures, moon, then the arch, without recolouring any pixels.
  const blooms=[
    {x:width*.53,y:height*.46,delay:0,radius:width*.31},
    {x:width*.48,y:height*.68,delay:.08,radius:width*.39},
    {x:width*.5,y:height*.91,delay:.16,radius:width*.36},
    {x:width*.48,y:height*.38,delay:.24,radius:width*.43},
  ];
  for(let i=0;i<13;i++){
    const angle=Math.PI+i/12*Math.PI;
    blooms.push({x:width*(.5+.44*Math.cos(angle)),y:height*(.42+.34*Math.sin(angle)),
      delay:.37+i*.017,radius:width*.27});
  }
  function draw(progress) {
    const p=clamp(progress);
    ctx.clearRect(0,0,width+padX*2,height+padTop+padBottom);
    mask.context.clearRect(0,0,width,height);
    for(const bloom of blooms){
      const growth=smooth((p-bloom.delay)/.48);
      if(!growth)continue;
      const radius=bloom.radius*growth;
      const gradient=mask.context.createRadialGradient(bloom.x,bloom.y,0,bloom.x,bloom.y,radius);
      gradient.addColorStop(0,'rgba(0,0,0,1)');
      gradient.addColorStop(.55,'rgba(0,0,0,.95)');
      gradient.addColorStop(1,'rgba(0,0,0,0)');
      mask.context.fillStyle=gradient;
      mask.context.fillRect(bloom.x-radius,bloom.y-radius,radius*2,radius*2);
    }
    // Resolve every fine detail without leaving small holes in the original image.
    mask.context.fillStyle='rgba(0,0,0,'+smooth((p-.72)/.18)+')';
    mask.context.fillRect(0,0,width,height);
    revealed.context.clearRect(0,0,width,height);
    revealed.context.globalCompositeOperation='source-over';
    revealed.context.drawImage(source.node,0,0,width,height);
    revealed.context.globalCompositeOperation='destination-in';
    revealed.context.drawImage(mask.node,0,0,width,height);
    revealed.context.globalCompositeOperation='source-over';
    ctx.drawImage(revealed.node,padX,padTop,width,height);
    for(const particle of particles){
      const t=clamp((p-particle.delay)/particle.duration);
      if(t<=0)continue;
      const glide=1-Math.pow(1-t,2);
      const x=padX+particle.startX+(particle.x-particle.startX)*glide+Math.sin(t*5+particle.phase)*particle.drift*(1-t);
      const y=padTop+particle.startY+(particle.y-particle.startY)*glide;
      const fade=smooth(t/.16)*(1-smooth((p-.76)/.22));
      const flicker=.62+.38*Math.pow(Math.sin(p*25+particle.phase),2);
      const alpha=particle.brightness*fade*flicker;
      ctx.fillStyle='rgba(164,122,48,'+alpha+')';
      ctx.beginPath();ctx.arc(x,y,particle.size,0,Math.PI*2);ctx.fill();
      if(particle.glint&&alpha>.35){
        const ray=1.4+flicker*1.7;
        ctx.strokeStyle='rgba(194,151,69,'+alpha*.65+')';
        ctx.lineWidth=.5;
        ctx.beginPath();ctx.moveTo(x-ray,y);ctx.lineTo(x+ray,y);
        ctx.moveTo(x,y-ray);ctx.lineTo(x,y+ray);ctx.stroke();
        ctx.fillStyle='rgba(255,239,187,'+alpha+')';ctx.fillRect(x-.4,y-.4,.8,.8);
      }
    }
  }
  return {draw, dispose(){ctx.clearRect(0,0,canvas.width,canvas.height);for(const buffer of [source,mask,revealed]){buffer.node.width=0;buffer.node.height=0;}}};
}
