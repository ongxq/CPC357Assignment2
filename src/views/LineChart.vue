<script setup>
import { defineProps, watch, onMounted, ref } from "vue";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LinearScale,
  CategoryScale,
} from "chart.js";
import { Bar } from "vue-chartjs";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  LinearScale,
  CategoryScale
);

const props = defineProps({
  chartData: Object,
  chartOptions: Object,
});
</script>

<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>