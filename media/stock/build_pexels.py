"""Add curated Pexels clips (Pexels License: free for commercial use and YouTube, no credit needed; credit is kind)
to the B-roll library. Picked from Pexels video searches on 14 Nov 2026 (johannesburg, cape town, soweto, township,
taxi rank, spaza shop, counting money, mobile money, load shedding, braai...). Search hits that were mislabelled
(e.g. Sandton footage under "harare") are listed by what they actually show.

Each clip is downloaded at 1080p, kept as a 720p copy for browsing, and the 1080p URL stays in manifest.json so the
full-quality file can be fetched again when a clip is used.
"""
import json, os, subprocess, time

BASE = 'https://videos.pexels.com/video-files/'
# category, pexels id, what it shows, author, 1080p file path
CLIPS = [
 ('city', 33644275, 'Aerial view of Sandton City and skyline, Johannesburg', 'kelly', '33644275/14297473_1920_1080_24fps.mp4'),
 ('city', 33644274, 'Aerial view of Sandton skyline, Johannesburg', 'kelly', '33644274/14297421_1920_1080_24fps.mp4'),
 ('city', 33637800, 'Aerial timelapse of city lights at night (Johannesburg)', 'kelly', '33637800/14294712_1920_1080_24fps.mp4'),
 ('city', 26846271, "Cape Town, Lion's Head mountain", 'visualsbyjered', '26846271/12021149_1920_1080_30fps.mp4'),
 ('city', 33646242, 'Cape Town sunset, aerial', 'kelly', '33646242/14298557_1920_1080_24fps.mp4'),
 ('city', 11534828, '360 pan of a harbour and city (Durban search)', 'Magda-Ehlers-Pexels', '11534828/11534828-hd_1920_1080_30fps.mp4'),
 ('city', 33644513, 'Sandton skyline at night, aerial', 'kelly', '33644513/14297632_1920_1080_24fps.mp4'),
 ('city', 33644339, 'Sandton skyline at dawn, aerial', 'kelly', '33644339/14297274_1920_1080_24fps.mp4'),
 ('city', 33644362, 'Sandton skyline at sunset, aerial', 'kelly', '33644362/14297485_1920_1080_24fps.mp4'),
 ('city', 33646487, 'Cape Town skyline at night, aerial', 'kelly', '33646487/14298713_1920_1080_24fps.mp4'),
 ('city', 30188139, 'Maputo, Mozambique, aerial', 'sinalmultimedia', '30188139/12944806_1920_1080_30fps.mp4'),
 ('city', 15613515, 'Crowded open-air market, Addis Ababa, Ethiopia', '', '15613515/15613515-hd_1920_1080_30fps.mp4'),
 ('city', 15613509, 'Buses and passengers at Meskel Square, Addis Ababa', '', '15613509/15613509-hd_1920_1080_30fps.mp4'),
 ('city', 29069375, 'Nairobi cityscape at sunset, aerial', 'mwauraken', '29069375/12564026_1920_1080_60fps.mp4'),
 ('city', 15556119, 'Timelapse of Westlands, Nairobi', 'Simplice', '15556119/15556119-hd_1920_1080_30fps.mp4'),
 ('city', 31369897, 'Roundabout in Tanzania, drone', '', '31369897/13386184_1920_1080_30fps.mp4'),
 ('city', 27985966, 'Victoria Island, Lagos, Nigeria', 'VitalisNwenyi', '27985966/12281488_1920_1080_30fps.mp4'),
 ('places', 35067278, 'Soweto cooling towers, aerial', 'xldrewit', '35067278/14854288_1920_1080_24fps.mp4'),
 ('places', 33643215, 'Informal settlement, South Africa, aerial', 'kelly', '33643215/14296836_1920_1080_24fps.mp4'),
 ('places', 33643211, 'South African informal settlement, aerial', 'kelly', '33643211/14296824_1920_1080_24fps.mp4'),
 ('places', 17812146, 'South African township', '', '17812146/17812146-hd_1920_1080_24fps.mp4'),
 ('places', 3845352, 'Rural village below a mountain', 'kelly', '3845352/3845352-hd_1920_1080_24fps.mp4'),
 ('people', 5135876, 'Father and son looking at the camera', 'vanessa-loring', '5135876/5135876-hd_1920_1080_25fps.mp4'),
 ('people', 4298260, 'Family putting plates on the table', 'august-de-richelieu', '4298260/4298260-hd_1920_1080_25fps.mp4'),
 ('people', 4298391, 'Man walking while on a phone call', 'august-de-richelieu', '4298391/4298391-hd_1920_1080_25fps.mp4'),
 ('people', 6637182, 'Man talking on a cell phone', 'gustavo-fring', '6637182/6637182-hd_1920_1080_30fps.mp4'),
 ('people', 6612214, 'Man holding a mobile phone', 'tima-miroshnichenko', '6612214/6612214-hd_1920_1080_25fps.mp4'),
 ('people', 5664426, 'Woman on a phone call', 'diva-plavalaguna', '5664426/5664426-hd_1920_1080_25fps.mp4'),
 ('people', 5664430, 'Woman talking on the phone, close-up', 'diva-plavalaguna', '5664430/5664430-hd_1920_1080_25fps.mp4'),
 ('people', 39541763, 'Busy African market with a tuk-tuk', '', '39541763/16848030_1920_1080_30fps.mp4'),
 ('people', 27165007, 'Market women trading, Lagos', 'Xtrovarts', '27165007/12087872_1920_1080_25fps.mp4'),
 ('people', 3967176, 'People trading in an open market', 'kelly', '3967176/3967176-hd_1366_720_24fps.mp4'),
 ('transport', 3978612, 'Man washing a minibus in a yard', 'kelly', '3978612/3978612-hd_1920_1080_24fps.mp4'),
 ('transport', 39367435, 'Inside a crowded minibus ride', '', '39367435/16758501_1920_1440_24fps.mp4'),
 ('transport', 34723030, 'African market street with vehicles and vendors', '', '34723030/14718561_1920_1080_24fps.mp4'),
 ('transport', 32755226, 'Driving on a South African highway', '', '32755226/13964457_1920_1080_30fps.mp4'),
 ('transport', 32282726, 'Motorbike ride in the South African highlands', '', '32282726/13767190_1920_1080_30fps.mp4'),
 ('transport', 33637720, 'Suburb and main road, aerial', 'kelly', '33637720/14294657_1920_1080_24fps.mp4'),
 ('shopping', 35687039, 'Busy street market with shops', 'DRECTOR', '35687039/15124994_1920_1080_30fps.mp4'),
 ('shopping', 34225457, 'Scanning groceries at a self-checkout', '', '34225457/14505132_1920_1080_30fps.mp4'),
 ('shopping', 8421356, 'People at a cashier counter', 'kampus', '8421356/8421356-hd_1920_1080_25fps.mp4'),
 ('shopping', 39240100, 'Supermarket checkout', '', '39240100/16698839_1920_1080_60fps.mp4'),
 ('shopping', 8465750, 'Man buying fruit in a grocery shop', 'kampus', '8465750/8465750-hd_1920_1080_25fps.mp4'),
 ('shopping', 28827282, 'Hand holding a card terminal and receipt', '', '28827282/12487432_1920_1080_60fps.mp4'),
 ('shopping', 4121750, 'Cashless payment in a store', 'jack-sparrow', '4121750/4121750-hd_1920_1080_25fps.mp4'),
 ('shopping', 34723040, 'Busy African market with vendors', '', '34723040/14718376_1920_1080_24fps.mp4'),
 ('shopping', 27165159, 'Woman selling food at an outdoor market', 'Xtrovarts', '27165159/12087890_1920_1080_25fps.mp4'),
 ('money', 3977228, 'Banknotes close-up', 'LukaszRadziejewski', '3977228/3977228-hd_1920_1080_30fps.mp4'),
 ('money', 37080143, 'Market woman counting cash outdoors', '', '37080143/15708449_1920_1080_60fps.mp4'),
 ('money', 39740470, 'Woman counting money, close-up', '', '39740470/16945257_1920_1080_60fps.mp4'),
 ('money', 9453911, 'Finger pressing a keypad, close-up (ATM-style)', '', '9453911/9453911-hd_1920_1080_30fps.mp4'),
 ('money', 6693625, 'Banknotes close-up (2)', 'tima-miroshnichenko', '6693625/6693625-hd_1920_1080_25fps.mp4'),
 ('phone', 34786893, 'Phone screen with a green message bubble', '', '34786893/14748788_1920_1080_50fps.mp4'),
 ('phone', 39494839, 'Texting with one hand, close-up', 'hamimrony', '39494839/16824491_1920_1080_25fps.mp4'),
 ('phone', 4109600, 'Woman paying with her smartphone', 'marcus-aurelius', '4109600/4109600-hd_1920_1080_25fps.mp4'),
 ('phone', 7567653, 'Man shopping on his phone', 'ivan-s', '7567653/7567653-hd_1920_1080_25fps.mp4'),
 ('phone', 10374923, 'Hands typing a message on a phone', 'rdne', '10374923/10374923-hd_1920_1080_24fps.mp4'),
 ('phone', 5617952, 'Sending a text message', 'rdne', '5617952/5617952-hd_1920_1080_24fps.mp4'),
 ('phone', 34786856, 'Phone with a text notification, close-up', '', '34786856/14748770_1920_1080_50fps.mp4'),
 ('energy', 31008623, 'Power lines silhouetted at sunset', '', '31008623/13256464_1920_1080_30fps.mp4'),
 ('energy', 28933364, 'Rural power lines at sunset', 'AhtoPalmre', '28933364/12521240_1920_1080_30fps.mp4'),
 ('energy', 27844418, 'Electrical substation with power lines', '', '27844418/12240414_1920_1080_60fps.mp4'),
 ('energy', 8677061, 'Lighting candles (load shedding)', 'ian-panelo', '8677061/8677061-hd_1920_1080_25fps.mp4'),
 ('energy', 30915325, 'Power plant, aerial', 'Toanbds668', '30915325/13218260_1920_1080_60fps.mp4'),
 ('energy', 30915329, 'Large electrical substation, aerial', 'Toanbds668', '30915329/13218290_1920_1080_60fps.mp4'),
 ('fuel', 14627006, 'Cars at a petrol station at night (Shell branding visible)', '', '14627006/14627006-hd_1920_1080_24fps.mp4'),
 ('fuel', 34964490, 'Foggy night street with a petrol station', 'MatthiasGroeneveld', '34964490/14811555_1920_1080_24fps.mp4'),
 ('festive', 6259628, 'Man in a Santa hat driving', 'rdne', '6259628/6259628-hd_1920_1080_30fps.mp4'),
 ('festive', 6259236, 'Santa at the beach', 'rdne', '6259236/6259236-hd_1920_1080_30fps.mp4'),
 ('festive', 3207801, 'Two men braaiing steaks outdoors', 'MatthiasGroeneveld', '3207801/3207801-hd_1920_1080_24fps.mp4'),
 ('festive', 3207802, 'Meat on a braai grill', 'MatthiasGroeneveld', '3207802/3207802-hd_1920_1080_24fps.mp4'),
 # added 14 Nov 2026 evening: Black Friday, malls, supermarkets, petrol prices, refineries
 ('shopping', 5889066, 'Man holding Black Friday shopping bags', 'max-fischer', '5889066/5889066-hd_1920_1080_25fps.mp4'),
 ('shopping', 8829017, 'Woman holding shopping bags', 'gustavo-fring', '8829017/8829017-hd_1366_720_25fps.mp4'),
 ('shopping', 34787766, 'Shopping mall interior with people', '', '34787766/14749307_1920_1080_60fps.mp4'),
 ('shopping', 39240106, 'People shopping in a supermarket', '', '39240106/16698863_1920_1080_60fps.mp4'),
 ('shopping', 40793137, 'Grocery store aisle', '', '40793137/17426538_1920_1080_59fps.mp4'),
 ('shopping', 39238831, 'Busy supermarket', '', '39238831/16698708_1920_1080_25fps.mp4'),
 ('fuel', 4092535, 'Petrol station seen from a moving car', '', '4092535/4092535-hd_1920_1080_25fps.mp4'),
 ('fuel', 3999354, 'Fuel price sign (US station, prices in $)', 'kelly', '3999354/3999354-hd_1920_1080_24fps.mp4'),
 ('fuel', 9592759, 'Fuel pump display close-up', '', '9592759/9592759-hd_1920_1080_24fps.mp4'),
 ('fuel', 37151630, 'Oil refinery, aerial', 'JULIAN', '37151630/15738797_1920_1080_30fps.mp4'),
 ('fuel', 10386895, 'Oil refinery at night, drone', 'tomfisk', '10386895/10386895-hd_1920_1080_30fps.mp4'),
]

ROOT = '/home/claude/stock'
man_path = f'{ROOT}/manifest.json'
man = json.load(open(man_path))
tmp = f'{ROOT}/_dl'; os.makedirs(tmp, exist_ok=True)
for cat, pid, desc, user, path in CLIPS:
    key = f'{cat}/pexels_{pid}.mp4'
    if f'pexels_{pid}' in man and os.path.exists(f'{ROOT}/{key}'): continue
    os.makedirs(f'{ROOT}/{cat}', exist_ok=True)
    raw = f'{tmp}/{pid}.mp4'
    r = subprocess.run(['curl', '-s', '-L', '-m', '300', '-o', raw, '-w', '%{http_code}', BASE + path], capture_output=True, text=True)
    if r.stdout != '200' or os.path.getsize(raw) < 100000:
        print('FAIL', pid, r.stdout, flush=True); time.sleep(5); continue
    subprocess.run(['nice', '-n', '19', 'ffmpeg', '-v', 'error', '-y', '-i', raw, '-vf', 'scale=-2:720', '-an', '-c:v', 'libx264',
                    '-preset', 'veryfast', '-crf', '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', f'{ROOT}/{key}'], check=True)
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'{ROOT}/{key}'],
                               capture_output=True, text=True).stdout.strip() or 0)
    os.remove(raw)
    entry = dict(file=key, category=cat, desc=desc, source='pexels', id=pid, author=user, duration=round(dur, 1),
                 page=f'https://www.pexels.com/video/{pid}/', url_1080=BASE + path,
                 license='Pexels License (free for commercial use incl. YouTube; attribution not required)')
    man[f'pexels_{pid}'] = entry
    json.dump(man, open(man_path, 'w'), indent=1)
    print('ok', key, round(dur, 1), flush=True)
    time.sleep(1)
print('DONE')
