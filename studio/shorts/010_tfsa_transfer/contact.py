from PIL import Image;import glob,sys
fs=sorted(glob.glob('check/s_*.png'),key=lambda f:float(f[8:-4]))
W,H=360,640;n=len(fs);c=min(n,7);im=Image.new('RGB',(W*c,H*((n+c-1)//c)))
for i,f in enumerate(fs):im.paste(Image.open(f).resize((W,H)),((i%c)*W,(i//c)*H))
im.save(sys.argv[1] if len(sys.argv)>1 else 'check/contact.png')
