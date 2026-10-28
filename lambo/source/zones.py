import numpy as np, colorsys
from PIL import Image
from scipy import ndimage as ndi
S=2048
im=Image.open('tex/carpaint_base.png').convert('RGB').resize((S,S),Image.LANCZOS)
a=np.asarray(im).astype(np.float32)/255
r,g,b=a[...,0],a[...,1],a[...,2]
mx=a.max(2); mn=a.min(2); lum=a@np.array([.299,.587,.114],np.float32)
sat=np.where(mx>1e-4,(mx-mn)/np.maximum(mx,1e-4),0)
# hue (degrees)
d=np.maximum(mx-mn,1e-6)
h=np.where(mx==r,((g-b)/d)%6,np.where(mx==g,(b-r)/d+2,(r-g)/d+4))*60
# hard classes: 0 carbon(black), 1 base, 2 accent (lime), 3 secondary (white)
L=np.ones((S,S),np.uint8)
L[lum<0.045]=0                                     # pure black = carbon / trim
L[(lum>0.55)&(sat<0.30)]=3                         # white decals / hood patch
lime=(sat>0.45)&(lum>0.35)&(h>45)&(h<110)
L[lime]=2                                          # yellow-green stripes
# soft grey (shadow gradient on the white hood patch): lum 0.2-0.55 low sat next to white -> secondary
grey=(lum>0.20)&(lum<=0.55)&(sat<0.25)
near_white=ndi.binary_dilation(L==3,iterations=40)
L[grey&near_white]=3
np.save('zones_L_raw.npy',L)

def remove_small(L,cls,area):
    m=(L==cls); lab,n=ndi.label(m)
    if n==0: return L
    sizes=ndi.sum(m,lab,range(1,n+1))
    small=np.isin(lab,[i+1 for i,s in enumerate(sizes) if s<area])
    L=L.copy(); L[small]=255; return L
def box(L,b,frm,to):
    x0,y0,x1,y1=[int(v*2) for v in b]; sub=L[y0:y1,x0:x1]
    if frm is None: sub[:]=to
    else: sub[np.isin(sub,frm)]=to
L2=L.copy()
# sponsor / logo areas (1024-space boxes): force to body colour
for b in ([880,262,955,505],[466,120,530,150],[0,0,92,30],[150,854,196,873],[277,854,323,873],[258,236,314,306],[0,50,22,100],[0,170,22,230],[398,50,422,100],[398,170,422,230],[190,115,225,215],[490,505,505,550],[638,0,730,22]):
    box(L2,b,None,1)
# Pirelli stickers: red rectangle inside a white wedge -> white
for b in ([398,900,470,968],[0,900,76,968]):
    box(L2,b,[2],3)
box(L2,[128,492,162,540],None,3)   # hood crest -> white patch
for cls,area in ((2,1000),(3,1000),(0,2500)):
    L2=remove_small(L2,cls,area)
base_small=remove_small(np.where(L2==1,1,0).astype(np.uint8),1,3000)
L2[(L2==1)&(base_small==255)]=255
unk=(L2==255)
idx=ndi.distance_transform_edt(unk,return_distances=False,return_indices=True)
L3=L2[idx[0],idx[1]]
np.save('zones_L.npy',L3)
# soft weights from one-hot, light blur for antialiasing
W=np.stack([ndi.gaussian_filter((L3==k).astype(np.float32),1.1) for k in (1,2,3)],-1)  # R=base,G=accent,B=second ; carbon=0
W=np.clip(W,0,1)
Image.fromarray((W*255+.5).astype(np.uint8)).save('tex/zonemap.png')
# preview: base=mid grey, accent=red, secondary=white, carbon=black
prev=np.zeros((S,S,3),np.float32)
for k,col in ((1,(.25,.25,.28)),(2,(.9,.05,.08)),(3,(.95,.95,.95))):
    prev+= (L3==k)[...,None]*np.array(col,np.float32)
Image.fromarray((prev*255).astype(np.uint8)).resize((1024,1024),Image.LANCZOS).save('tex/zones_preview.png')
orig_prev=im.resize((1024,1024),Image.LANCZOS); orig_prev.save('tex/orig_1024.png')
print({k:round(float((L3==k).mean()),3) for k in range(4)})
