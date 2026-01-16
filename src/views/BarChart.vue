<template>
  <div class="bar-chart-container">
    <div class="header">
      <router-link to="/" class="back-button">← Back to Home</router-link>
      <h1>Bar Chart - Drain Data Analysis</h1>
    </div>

    <div v-if="loading" class="loading">Loading chart data...</div>
    <div v-else-if="chartData && chartData.labels && chartData.labels.length > 0" class="chart-wrapper">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
    <div v-else class="no-data">No data available</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "vue-chartjs";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../config/supabaseClient.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const loading = ref(true);
const processedData = ref([]);

// Extract data from Firestore nested structure (same as Home.vue)
const extractData = (docData) => {
  const extracted = {};
  if (docData.fields) {
    for (const [key, value] of Object.entries(docData.fields)) {
      if (value.stringValue !== undefined) extracted[key] = value.stringValue;
      else if (value.doubleValue !== undefined) extracted[key] = value.doubleValue;
      else if (value.booleanValue !== undefined) extracted[key] = value.booleanValue;
      else if (value.integerValue !== undefined) extracted[key] = parseInt(value.integerValue);
      else extracted[key] = value;
    }
  }
  return Object.keys(extracted).length > 0 ? extracted : docData;
};

const chartData = computed(() => {
  if (!processedData.value.length) {
    return { labels: [], datasets: [] };
  }

  // Sort data by index
  const sortedData = [...processedData.value].sort((a, b) => {
    return a.index - b.index;
  });

  // Create labels
  const labels = sortedData.map((item, index) => {
    return `Record ${index + 1}`;
  });

  // Extract values for each field
  const waterLevelValues = sortedData.map((item) => {
    const val = parseFloat(item.water_level) || 0;
    return isNaN(val) ? 0 : val;
  });

  const distanceValues = sortedData.map((item) => {
    const val = parseFloat(item.distance) || 0;
    return isNaN(val) ? 0 : val;
  });

  const waterDepthValues = sortedData.map((item) => {
    const val = parseFloat(item.water_depth) || 0;
    return isNaN(val) ? 0 : val;
  });

  return {
    labels,
    datasets: [
      {
        label: "Water Level",
        data: waterLevelValues,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Distance",
        data: distanceValues,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Water Depth",
        data: waterDepthValues,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      display: true,
      position: "top",
      labels: {
        color: "#333",
        font: { size: 12 },
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "#fff",
      bodyColor: "#fff",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(0, 0, 0, 0.1)",
      },
      ticks: {
        color: "#666",
      },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#666",
      },
    },
  },
};

const fetchData = async () => {
  try {
    const snapshot = await getDocs(collection(db, "drain_data"));
    processedData.value = snapshot.docs.map((doc, index) => {
      const docData = doc.data();
      const extracted = extractData(docData);
      return { ...extracted, index };
    });
    console.log("Bar Chart Data:", processedData.value);
  } catch (err) {
    console.error("Error fetching data:", err);
    processedData.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>

<style scoped>
.bar-chart-container {
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  margin-bottom: 2rem;
  color: white;
}

.back-button {
  display: inline-block;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: white;
  text-decoration: none;
  transition: background 0.3s;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.header h1 {
  font-size: 2rem;
  margin: 0;
}


.chart-wrapper {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  height: 500px;
}

.loading,
.no-data {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  color: #666;
  font-size: 1.1rem;
}
</style>
