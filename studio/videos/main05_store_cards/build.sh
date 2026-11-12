cat scene_head.js scene_cuts.js > scene.js
echo "console.warn('CUTS ' + JSON.stringify(cuts.map((c, i) => [+c[0].toFixed(2), +(i + 1 < cuts.length ? cuts[i + 1][0] : END + 2.6).toFixed(2)])));" >> scene.js
