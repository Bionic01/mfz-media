import sys,os,glob
from PIL import Image,ImageDraw
d=sys.argv[1]; fs=sorted(glob.glob(d+'/[0-9]*.png')); per=16; W,H=640,360
for p in range(0,len(fs),per):
    im=Image.new('RGB',(W*4,H*4),'black'); dr=ImageDraw.Draw(im)
    for i,f in enumerate(fs[p:p+per]):
        t=Image.open(f).convert('RGB').resize((W,H)); x,y=(i%4)*W,(i//4)*H; im.paste(t,(x,y)); dr.rectangle([x,y,x+110,y+26],fill='black'); dr.text((x+4,y+4),os.path.basename(f)[:-4],fill='yellow')
    im.save(f'{d}/page{p//per:02d}.jpg',quality=80)
print('ok')
