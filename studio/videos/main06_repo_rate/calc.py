def pmt(P, r, n): i=r/12; return P*i/(1-(1+i)**-n)
print('BT check R1m 20y 10.50 vs 10.75:', round(pmt(1e6,.105,240),2), round(pmt(1e6,.1075,240),2))
for rate in (.105,.1075,.11,.1125,.1175):
    print('bond 1.2m 20y', rate, round(pmt(1.2e6,rate,240),2))
b0,b1=pmt(1.2e6,.1075,240),pmt(1.2e6,.11,240)
print('bond diff/month',round(b1-b0,2),'per year',round((b1-b0)*12,2),'over 20y',round((b1-b0)*240,2))
print('bond total interest at 10.75', round(b0*240-1.2e6,2))
c0,c1=pmt(413000,.1075,72),pmt(413000,.11,72)
print('car',round(c0,2),round(c1,2),'diff',round(c1-c0,2),'yr',round((c1-c0)*12,2), 'total extra 72m', round((c1-c0)*72,2))
print('savings 10000 +0.25%/yr', 10000*.0025)
print('card 20000 21.25->21.5 per month', round(20000*.0025/12,2),'yr',20000*.0025)
tot=(b1-b0)+(c1-c0)+20000*.0025/12
print('total per month',round(tot,2),'yr',round(tot*12,2))
# 1 percentage point (4 moves) on the bond
print('bond +1pt',round(pmt(1.2e6,.1175,240)-b0,2))
# cut 0.25
print('bond cut to 10.50', round(b0-pmt(1.2e6,.105,240),2), 'car cut', round(c0-pmt(413000,.105,72),2))
# since May 2026: 6.75 -> 7.25 repo, prime 10.25 -> 10.75
print('bond since May (prime 10.25->10.75)', round(b0-pmt(1.2e6,.1025,240),2))
# paying the higher instalment now at 10.75%
P=1.2e6; i=.1075/12; pay=pmt(1.2e6,.11,240); m=0; tot=0
while P>0.005:
    P=P*(1+i); x=min(pay,P); P-=x; tot+=x; m+=1
print('pay 12386.26 at 10.75: months',m, 'years',round(m/12,2),'interest',round(tot-1.2e6,2),'saved', round(pmt(1.2e6,.1075,240)*240-tot,2))
print('rule per R100k bond 20y per 0.25', round((pmt(1e5,.11,240)-pmt(1e5,.1075,240)),2), 'car 72m', round(pmt(1e5,.11,72)-pmt(1e5,.1075,72),2))
print('repo+3.5', 7.25+3.5, 'caps', 7.25+12, 7.25+14, 7.25+21)
