<script setup>
import { defineProps, watch, onMounted, ref } from "vue";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  TimeScale,
} from "chart.js";
import { Line } from "vue-chartjs";
import "chartjs-adapter-date-fns";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  TimeScale
);

const props = defineProps({
  chartData: Object,
  chartOptions: Object,
});
</script>

<template>
  <Line :data="chartData" :options="chartOptions" />
</template>
