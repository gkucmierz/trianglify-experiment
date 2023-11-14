<script setup>
import { ref, onMounted } from 'vue';
import Delaunator from 'delaunator';
import convert from 'color-convert';


const px = n => `${n}px`;
const hash = n => `#${n}`;
// const size = ref(600);
// const svgUri = ref('');
const canvas = ref(null);
const size = ref(500);

const centroid = (p0, p1, p2) => {
  return [
    (p0[0] + p1[0] + p2[0]) / 3,
    (p0[1] + p1[1] + p2[1]) / 3,
  ];
};

const getPoints = (size, cnt = 10) => {
  // return new Array(100).fill(0).map(() => {
  //   return [
  //     Math.round(Math.random() * size),
  //     Math.round(Math.random() * size),
  //   ];
  // });
  const rnd = 0.3;
  const arr = [];
  for (let i = 0; i < cnt; ++i) {
    for (let j = 0; j < cnt; ++j) {
      const x = (i + Math.random() * rnd) * size / cnt;
      const y = (j + Math.random() * rnd) * size / cnt;
      arr.push([x, y]);
    }
  }
  return arr;
};


onMounted(() => {
  const points = getPoints(size.value);
  const delaunay = Delaunator.from(points, o => o[0], o => o[1]);
  console.log(delaunay);
  const ctx = canvas.value.getContext('2d');
  ctx.fillStyle = '#eee';
  ctx.fillRect(0, 0, 1150, 1500);

  points.map(([x, y]) => {  
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#a60';
    // ctx.fill();
    ctx.strokeStyle = '#bbb';
    ctx.stroke();
  });

  for (let i = 0; i < delaunay.triangles.length; i += 3) {
    const [t0, t1, t2] = [
      delaunay.triangles[i+0],
      delaunay.triangles[i+1],
      delaunay.triangles[i+2],
    ];

    ctx.beginPath();     // Start a new path.
    ctx.moveTo(points[t0][0], points[t0][1]);
    ctx.lineTo(points[t1][0], points[t1][1]);
    ctx.lineTo(points[t2][0], points[t2][1]);
    ctx.lineTo(points[t0][0], points[t0][1]);
    const ce = centroid(points[t0], points[t1], points[t2]);
    const dist = Math.sqrt(ce[0]*ce[0]+ce[1]*ce[1]);
    const color = convert.rgb.hex(
      ce[0] / size.value * 255,
      ce[1] / size.value * 255,
      0,
    );
    console.log(color);
    ctx.fillStyle = hash(color);
    ctx.fill();
    ctx.lineWidth = '1';
    ctx.strokeStyle = hash(color);
    ctx.stroke();
  }

  // for (let i = 0; i < delaunay.coords.length; i += 2) {
  //   const x = delaunay.coords[i + 0];
  //   const y = delaunay.coords[i + 1];
  //   ctx.beginPath();
  //   ctx.arc(x, y, 3, 0, 2 * Math.PI);
  //   ctx.fillStyle = '#a60';
  //   ctx.fill();
  //   // ctx.stroke();
  // }
});

</script>

<template>
  <div>
    <canvas ref="canvas" :width="size" :height="size"></canvas>
    <!-- <img :src="svgURI" /> -->
  </div>
</template>

<style scoped>
/*img {
  width: v-bind(px(size));
  height: v-bind(px(size));
}*/
</style>
