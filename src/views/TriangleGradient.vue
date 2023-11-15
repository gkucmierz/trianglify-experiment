<script setup>
import { ref, onMounted } from 'vue';
import convert from 'color-convert';

const px = n => `${n}px`;

let ctx;
const canvas = ref(null);
const dots = ref(null);
const size = ref(500);
const dotSize = ref(24);
const dotColors = ref([
  { val: '#ff0000' },
  { val: '#00ff00' },
  { val: '#0000ff' },
]);
const pos = ref([
  [20, 20],
  [20, 100],
  [100, 20],
]);

const makeDraggable = (dots, pos, update) => {
  const getOffset = el => {
    var position = el.getBoundingClientRect();
    return {left: position.left + window.scrollX, top: position.top + window.scrollY};
  };
  const setPos = (id, xy) => {
    dots[id].style.left = `${xy[0]}px`;
    dots[id].style.top = `${xy[1]}px`;
    pos[id] = xy.map(c => c + dotSize.value / 2);
  };
  let dragged = -1;
  const xd = [];
  const yd = [];
  dots.map((dot, i) => {
    dot.addEventListener('mousedown', e => {
      dragged = i;
      const offset = getOffset(dot);
      xd[dragged] = offset.left - e.clientX;
      yd[dragged] = offset.top - e.clientY;
    });
    document.body.addEventListener('mousemove', e => {
      if (dragged < 0) return;
      setPos(dragged, [e.clientX+xd[dragged], e.clientY+yd[dragged]]);
      update(pos);
    });
    document.body.addEventListener('mouseup', e => {
      dragged = -1;
    });
  });
  pos.map((xy, i) => setPos(i, xy));
  update(pos);
}

const barycentricCoordinates = (p, a, b, c) => {
  const [X, Y] = [0, 1];
  const l1 = ((b[Y]-c[Y])*(p[X]-c[X]) + (c[X]-b[X])*(p[Y]-c[Y])) / ((b[Y]-c[Y])*(a[X]-c[X]) + (c[X]-b[X])*(a[Y]-c[Y]));
  const l2 = ((c[Y]-a[Y])*(p[X]-c[X]) + (a[X]-c[X])*(p[Y]-c[Y])) / ((b[Y]-c[Y])*(a[X]-c[X]) + (c[X]-b[X])*(a[Y]-c[Y]));
  const l3 = 1 - l1 - l2;
  return [l1, l2, l3];
};

const draw = () => {
  drawFill();
  drawStroke();
};

const drawFill = () => {
  const imageData = ctx.createImageData(size.value, size.value);
  const c = dotColors.value.map(c => convert.hex.rgb(c.val));

  for (let i = 0; i < imageData.data.length; i += 4) {
    const x = (i / 4) % size.value;
    const y = (i / 4) / size.value | 0;
    const bc = barycentricCoordinates([x, y], ...pos.value);
    imageData.data[i + 0] = c[0][0] * bc[0] + c[1][0] * bc[1] + c[2][0] * bc[2];
    imageData.data[i + 1] = c[0][1] * bc[0] + c[1][1] * bc[1] + c[2][1] * bc[2];
    imageData.data[i + 2] = c[0][2] * bc[0] + c[1][2] * bc[1] + c[2][2] * bc[2];
    imageData.data[i + 3] = 255; // A value
  }

  ctx.putImageData(imageData, 0, 0);
};

const drawStroke = () => {
  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.moveTo(...pos.value.at(-1));
  pos.value.map(xy => ctx.lineTo(...xy));
  ctx.stroke();
};

const clear = () => {
  ctx.fillStyle = '#eee';
  ctx.fillRect(0, 0, size.value, size.value);
};

onMounted(() => {
  ctx = canvas.value.getContext('2d');

  makeDraggable([...dots.value.querySelectorAll('.dot')], pos.value, pos => {
    clear();
    drawStroke();
  });
});

</script>

<template>
  <div>
    <canvas ref="canvas" :width="size" :height="size"></canvas>
    <span v-for="color in dotColors">
      <input type="color" v-model="color.val" />
    </span>
    <input type="button" value="Draw Triangle" @click="draw()"/>
    <pre>{{ JSON.stringify(pos, null, '  ') }}</pre>
    <div ref="dots">
      <div class="dot dot0"></div>
      <div class="dot dot1"></div>
      <div class="dot dot2"></div>
    </div>
  </div>
</template>

<style scoped>
.dot {
  cursor: pointer;
  position: absolute;
  top: 0;
  left: 0;
  background: #08f;
  opacity: 0.4;
  border-radius: 50%;
  width: v-bind(px(dotSize));
  height: v-bind(px(dotSize));
}
.dot:hover {
  opacity: 0.8;
}
.dot0 { background-color: v-bind(dotColors[0].val); }
.dot1 { background-color: v-bind(dotColors[1].val); }
.dot2 { background-color: v-bind(dotColors[2].val); }
pre {
  user-select: none;
}
</style>
