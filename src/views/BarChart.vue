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

  // Use dates as labels
  const labels = sortedData.map((item) =>
    new Date(item.created_at).toLocaleDateString()
  );

  // Extract values for water level only
  const waterLevelValues = sortedData.map((item) => {
    const val = parseFloat(item.water_level) || 0;
    return isNaN(val) ? 0 : val;
  });

  // Generate colors based on water level status AND rain state
  const backgroundColor = sortedData.map((item) => {
    const level = parseFloat(item.water_level) || 0;
    
    if (item.rain_state) {
      // During rain: lighter shades
      if (level < 40) return "rgba(0,200,0,0.7)"; // Light green (rain)
      if (level < 70) return "rgba(255,165,0,0.7)"; // Light orange (rain)
      return "rgba(255,0,0,0.7)"; // Light red (rain)
    } else {
      // No rain: standard shades
      if (level < 40) return "rgba(0,200,0,0.9)"; // Green (safe)
      if (level < 70) return "rgba(255,165,0,0.9)"; // Orange (warning)
      return "rgba(255,0,0,0.9)"; // Red (danger)
    }
  });

  return {
    labels,
    datasets: [
      {
        label: "Water Level (%)",
        data: waterLevelValues,
        backgroundColor: backgroundColor,
        borderRadius: 4,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      labels: {
        generateLabels: (chart) => {
          return [
            { text: "Normal (Safe) - No Rain", fillStyle: "rgba(0,200,0,0.9)" },
            { text: "Normal (Safe) - Raining", fillStyle: "rgba(0,200,0,0.7)" },
            { text: "Warning (Rising) - No Rain", fillStyle: "rgba(255,165,0,0.9)" },
            { text: "Warning (Rising) - Raining", fillStyle: "rgba(255,165,0,0.7)" },
            { text: "Danger (High) - No Rain", fillStyle: "rgba(255,0,0,0.9)" },
            { text: "Danger (High) - Raining", fillStyle: "rgba(255,0,0,0.7)" },
          ];
        },
      },
    },
    tooltip: {
      callbacks: {
        title: (tooltipItems) => {
          const idx = tooltipItems[0].dataIndex;
          const timestamp = processedData.value[idx].created_at;
          return new Date(timestamp).toLocaleString();
        },
        label: (tooltipItem) => {
          const idx = tooltipItem.dataIndex;
          const rainState = processedData.value[idx].rain_state ? "Raining" : "No Rain";
          return `Water Level: ${tooltipItem.raw}% • ${rainState}`;
        },
      },
    },
  },
  scales: {
    y: {
      title: { display: true, text: "Water Level (%)" },
      beginAtZero: true,
      max: 100,
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
    const allData = snapshot.docs.map((doc, index) => {
      const docData = doc.data();
      const extracted = extractData(docData);
      return { ...extracted, index };
    });
    
    // Keep only the last 30 records
    processedData.value = allData.slice(-30);
    console.log("Bar Chart Data (Last 30):", processedData.value);
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
