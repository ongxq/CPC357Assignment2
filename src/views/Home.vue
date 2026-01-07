<template>
  <div>
    <div class="dashboard-grid">
      <!-- LEFT COLUMN -->
      <div class="left-panel">
        <!-- =========================
        WATER LEVEL ALERT CARD (TOP)
        ========================== -->
        <div
          class="water-card-alert"
          :class="{
            red: latestWaterLevel >= 70,
            orange: latestWaterLevel < 70 && latestWaterLevel >= 40,
            green: latestWaterLevel < 40,
            blink: latestWaterLevel >= 70,
          }"
        >
          <h3>Water Level Status</h3>
          <p class="value">{{ latestWaterLevel }}%</p>
          <p class="status">{{ waterStatusText }}</p>
          <p class="time">Updated: {{ latestTime }}</p>
        </div>

        <!-- =========================
        FLOOD PREDICTION + BLOCKAGE CARD (SIDE BY SIDE)
        ========================== -->
        <div class="side-by-side-cards">
          <div
            class="flood-alert-card"
            :class="floodAlertActive ? 'danger' : 'normal'"
          >
            <h3>Flood Prediction</h3>
            <p>{{ floodStatusText }}</p>
          </div>

          <div
            v-if="latestBlockage"
            class="blockage-status-card"
            :class="
              latestBlockage.status === 'BLOCKAGE' ? 'blockage' : 'normal'
            "
          >
            <div class="header">
              <span v-if="latestBlockage.status === 'BLOCKAGE'">
                ⚠️ Blockage Detected
              </span>
              <span v-else>✅ Drain Normal</span>
              <small
                >{{ latestBlockage.date }} • {{ latestBlockage.time }}</small
              >
            </div>
            <div class="body">
              <p><strong>Water Level:</strong> {{ latestBlockage.water }}%</p>
            </div>
          </div>
        </div>

        <!-- =========================
        WEATHER FORECAST CARD (BOTTOM LEFT)
        ========================== -->
        <div class="daily-card-wrapper">
          <div v-if="selectedDay" class="weather-card">
            <div class="weather-top">
              <div class="left">
                <h3 class="date-text">{{ formatDate(selectedDay.date) }}</h3>
                <img
                  :src="`https://openweathermap.org/img/wn/${selectedDay.summary.weather[0].icon}@4x.png`"
                  class="big-icon"
                />
              </div>
              <div class="right">
                <p class="label">Weather</p>
                <p class="value">
                  {{ selectedDay.summary.weather[0].description }}
                </p>

                <p class="label">Temperature</p>
                <p class="value">
                  {{ Math.round(selectedDay.minTemp) }}°C —
                  {{ Math.round(selectedDay.maxTemp) }}°C
                </p>
              </div>
            </div>

            <div class="date-dots">
              <div
                v-for="day in dailyForecast"
                :key="day.date"
                class="dot"
                :class="{ active: selectedDate === day.date }"
                @click="selectedDate = day.date"
              >
                {{ new Date(day.date).getDate() }}
                <br />
                <span class="month">
                  {{
                    new Date(day.date).toLocaleString("en-US", {
                      month: "short",
                    })
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="right-panel">
        <!-- =========================
        WATER LEVEL CHART (TOP)
        ========================== -->
        <!-- Water Level Chart with Date Range -->
        <div class="chart-card scroll-chart">
          <!-- Chart Header: title left, filter right -->
          <div
            class="chart-header"
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            "
          >
            <h3 style="margin: 0">Water Level Status</h3>

            <div
              class="date-filter"
              style="display: flex; gap: 5px; align-items: center"
            >
              <label>
                Start:
                <input type="date" v-model="startWaterLevelDate" />
              </label>
              <label>
                End:
                <input type="date" v-model="endWaterLevelDate" />
              </label>
              <button
                @click="resetWaterLevelDateFilter"
                style="padding: 2px 6px"
              >
                Reset
              </button>
            </div>
          </div>

          <!-- Chart -->
          <bar-chart
            :chart-data="waterLevelChartData"
            :chart-options="waterLevelChartOptions"
          />
        </div>

        <!-- =========================
        WATER LEVEL VS RAIN STATE (BOTTOM)
        ========================== -->
        <div class="chart-card scroll-chart">
          <!-- Chart Header -->
          <div
            class="chart-header"
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            "
          >
            <h3 style="margin: 0">Water Level vs Rain State</h3>

            <!-- Mode switch + Historical Date Filter -->
            <div style="display: flex; gap: 10px; align-items: center">
              <!-- Mode switch -->
              <div class="mode-switch">
                <label>
                  <input
                    type="radio"
                    value="realtime"
                    v-model="rainChartMode"
                  />
                  Real-time
                </label>
                <label>
                  <input
                    type="radio"
                    value="historical"
                    v-model="rainChartMode"
                  />
                  Historical
                </label>
              </div>
              <!-- Time filter (only for historical) -->
              <div
                v-if="rainChartMode === 'historical'"
                style="display: flex; gap: 10px; align-items: center"
              >
                <label>
                  Show:
                  <select v-model="rainTimeFilter">
                    <option value="all">All</option>
                    <option value="1h">Last 1h</option>
                    <option value="6h">Last 6h</option>
                    <option value="24h">Last 24h</option>
                    <option value="dateRange">Date Range</option>
                  </select>
                </label>

                <!-- Show date pickers only if Date Range is selected -->
                <div
                  v-if="rainTimeFilter === 'dateRange'"
                  style="display: flex; gap: 5px; align-items: center"
                >
                  <label>
                    Start:
                    <input type="date" v-model="startRainDate" />
                  </label>
                  <label>
                    End:
                    <input type="date" v-model="endRainDate" />
                  </label>
                  <button @click="resetRainDateFilter" style="padding: 2px 6px">
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Chart -->
          <bar-chart
            :chart-data="rainChartData"
            :chart-options="rainChartOptions"
          />
        </div>
      </div>
    </div>

    <!-- =========================
    TABLES (FULL WIDTH BOTTOM)
    ========================== -->
    <div class="tables-section">
      <h1>Drain Water Level Data</h1>
      <table border="1" cellpadding="5">
        <thead>
          <tr>
            <th>ID</th>
            <th>Water Level (%)</th>
            <th>Water Depth (cm)</th>
            <th>Distance (cm)</th>
            <th>Rain State</th>
            <th>Status</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.water_level }}</td>
            <td>{{ item.water_depth }}</td>
            <td>{{ item.distance }}</td>
            <td>{{ item.rain_state ? "Yes" : "No" }}</td>
            <td>{{ item.status }}</td>
            <td>
              {{
                new Date(item.created_at).toLocaleString("en-MY", {
                  timeZone: "Asia/Kuala_Lumpur",
                })
              }}
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Forecast Data (Next 5 Days)</h2>
      <table border="1" cellpadding="5">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Temperature (°C)</th>
            <th>Weather</th>
            <th>Rain (mm)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in forecast" :key="item.dt">
            <td>{{ new Date(item.dt_txt).toLocaleString() }}</td>
            <td>{{ item.main.temp.toFixed(1) }}</td>
            <td>{{ item.weather[0].description }}</td>
            <td>
              {{ (item.rain?.["3h"] || item.rain?.["1h"] || 0).toFixed(1) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from "vue"; // <-- UPDATED: added watch + computed
import supabase from "../config/supabaseClient.js";
//import LineChart from "./LineChart.vue";
import BarChart from "./BarChart.vue";
import "../style.css";

const data = ref([]);
const forecast = ref([]);
const timeFilter = ref("all"); // default: show all
const chartMode = ref("realtime"); // default mode

const rainTimeFilter = ref("all");
const rainChartMode = ref("realtime");

const blockageAlert = ref(null); // will hold the latest blockage info

const blockageHistory = ref([]);

const floodRisk = ref(false);
const highCount = ref(0);
const weatherRisk = ref(false);

const startWaterLevelDate = ref("");
const endWaterLevelDate = ref("");

function resetWaterLevelDateFilter() {
  startWaterLevelDate.value = "";
  endWaterLevelDate.value = "";
}

const filteredWaterLevelData = computed(() => {
  let filtered = data.value;

  if (startWaterLevelDate.value) {
    const start = new Date(startWaterLevelDate.value);
    filtered = filtered.filter((item) => new Date(item.created_at) >= start);
  }

  if (endWaterLevelDate.value) {
    const end = new Date(endWaterLevelDate.value);
    end.setDate(end.getDate() + 1); // include the end date fully
    filtered = filtered.filter((item) => new Date(item.created_at) < end);
  }

  return filtered;
});

const startRainDate = ref("");
const endRainDate = ref("");

function resetRainDateFilter() {
  startRainDate.value = "";
  endRainDate.value = "";
}

// const filteredRainDataWithDate = computed(() => {
//   let filtered = data.value;

//   if (startRainDate.value) {
//     const start = new Date(startRainDate.value);
//     filtered = filtered.filter((item) => new Date(item.created_at) >= start);
//   }

//   if (endRainDate.value) {
//     const end = new Date(endRainDate.value);
//     end.setDate(end.getDate() + 1); // include end date fully
//     filtered = filtered.filter((item) => new Date(item.created_at) < end);
//   }

//   // Apply mode/time filters
//   if (rainChartMode.value === "historical") {
//     if (rainTimeFilter.value === "all") return filtered;
//     const now = new Date();
//     let filterTime = now;
//     if (rainTimeFilter.value === "1h") filterTime = new Date(now - 60 * 60 * 1000);
//     if (rainTimeFilter.value === "6h") filterTime = new Date(now - 6 * 60 * 60 * 1000);
//     if (rainTimeFilter.value === "24h") filterTime = new Date(now - 24 * 60 * 60 * 1000);
//     return filtered.filter((item) => new Date(item.created_at) >= filterTime);
//   }

//   // Realtime: last 500 points
//   return filtered.slice(-500);
// });

let subscription = null;

//water level & depth chart data over time

const filteredData = computed(() => {
  if (chartMode.value === "realtime") {
    // Last 500 points
    return data.value.slice(-500);
  } else {
    // Historical with time filter
    if (timeFilter.value === "all") return data.value;
    const now = new Date();
    let filterTime = now;
    if (timeFilter.value === "1h") filterTime = new Date(now - 60 * 60 * 1000);
    if (timeFilter.value === "6h")
      filterTime = new Date(now - 6 * 60 * 60 * 1000);
    if (timeFilter.value === "24h")
      filterTime = new Date(now - 24 * 60 * 60 * 1000);
    return data.value.filter((item) => new Date(item.created_at) >= filterTime);
  }
});

const chartData = computed(() => {
  return {
    labels: filteredData.value.map((d) =>
      new Date(d.created_at).toLocaleTimeString()
    ),
    datasets: [
      {
        label: "Water Depth ()",
        data: filteredData.value.map((d) => d.water_depth),
        // Dynamic colors based on value
        backgroundColor: filteredData.value.map((d) => {
          if (d.water_depth < 40) return "rgba(0,200,0,0.9)"; // Green
          if (d.water_depth < 70) return "rgba(255,165,0,0.9)"; // Orange
          return "rgba(255,0,0,0.9)"; // Red
        }),
        stack: "stack",
      },
      {
        label: "Distance From Sensor (cm)",
        data: filteredData.value.map((d) => d.distance),
        backgroundColor: "rgba(128,0,128,0.9)",
        stack: "stack",
      },
    ],
  };
});

// const filteredRainData = computed(() => {
//   if (rainChartMode.value === "realtime") {
//     // Last 500 points
//     return data.value.slice(-500);
//   } else {
//     // Historical with time filter
//     if (rainTimeFilter.value === "all") return data.value;
//     const now = new Date();
//     let filterTime = now;
//     if (rainTimeFilter.value === "1h")
//       filterTime = new Date(now - 60 * 60 * 1000);
//     if (rainTimeFilter.value === "6h")
//       filterTime = new Date(now - 6 * 60 * 60 * 1000);
//     if (rainTimeFilter.value === "24h")
//       filterTime = new Date(now - 24 * 60 * 60 * 1000);
//     return data.value.filter((item) => new Date(item.created_at) >= filterTime);
//   }
// });

// const filteredRainData = computed(() => {
//   let filtered = data.value;

//   // Apply date range filter first
//   if (startRainDate.value) {
//     const start = new Date(startRainDate.value);
//     filtered = filtered.filter((item) => new Date(item.created_at) >= start);
//   }

//   if (endRainDate.value) {
//     const end = new Date(endRainDate.value);
//     end.setDate(end.getDate() + 1); // include end date fully
//     filtered = filtered.filter((item) => new Date(item.created_at) < end);
//   }

//   // Apply mode/time filters for historical mode
//   if (rainChartMode.value === "historical") {
//     if (rainTimeFilter.value === "all") return filtered;

//     const now = new Date();
//     let filterTime = now;

//     if (rainTimeFilter.value === "1h")
//       filterTime = new Date(now - 60 * 60 * 1000);
//     if (rainTimeFilter.value === "6h")
//       filterTime = new Date(now - 6 * 60 * 60 * 1000);
//     if (rainTimeFilter.value === "24h")
//       filterTime = new Date(now - 24 * 60 * 60 * 1000);

//     filtered = filtered.filter(
//       (item) => new Date(item.created_at) >= filterTime
//     );
//   }

//   // Realtime: only last 500 points
//   if (rainChartMode.value === "realtime") {
//     filtered = filtered.slice(-500);
//   }

//   return filtered;
// });

// const filteredRainData = computed(() => {
//   let filtered = data.value;

//   // --- Apply date range filter if selected ---
//   if (rainTimeFilter.value === "dateRange") {
//     if (startRainDate.value) {
//       const start = new Date(startRainDate.value);
//       filtered = filtered.filter((item) => new Date(item.created_at) >= start);
//     }
//     if (endRainDate.value) {
//       const end = new Date(endRainDate.value);
//       end.setDate(end.getDate() + 1); // include end date fully
//       filtered = filtered.filter((item) => new Date(item.created_at) < end);
//     }
//     return filtered; // DONE: skip 1h/6h/24h
//   }

//   // --- Apply historical filters (1h/6h/24h) ---
//   else if (rainChartMode.value === "historical") {
//     const now = new Date();
//     let filterTime = now;

//     if (rainTimeFilter.value === "1h")
//       filterTime = new Date(now - 60 * 60 * 1000);
//     if (rainTimeFilter.value === "6h")
//       filterTime = new Date(now - 6 * 60 * 60 * 1000);
//     if (rainTimeFilter.value === "24h")
//       filterTime = new Date(now - 24 * 60 * 60 * 1000);

//     filtered = filtered.filter(
//       (item) => new Date(item.created_at) >= filterTime
//     );
//   }

//   // --- Realtime: last 500 points ---
//   if (rainChartMode.value === "realtime") {
//     filtered = filtered.slice(-500);
//   }

//   return filtered;
// });

const filteredRainData = computed(() => {
  let filtered = data.value;

  // --- Historical mode ---
  if (rainChartMode.value === "historical") {
    if (rainTimeFilter.value === "dateRange") {
      // Date range filter
      if (startRainDate.value) {
        const start = new Date(startRainDate.value);
        filtered = filtered.filter(
          (item) => new Date(item.created_at) >= start
        );
      }
      if (endRainDate.value) {
        const end = new Date(endRainDate.value);
        end.setDate(end.getDate() + 1);
        filtered = filtered.filter((item) => new Date(item.created_at) < end);
      }
    } else if (rainTimeFilter.value === "1h") {
      const start = new Date(Date.now() - 60 * 60 * 1000);
      filtered = filtered.filter((item) => new Date(item.created_at) >= start);
    } else if (rainTimeFilter.value === "6h") {
      const start = new Date(Date.now() - 6 * 60 * 60 * 1000);
      filtered = filtered.filter((item) => new Date(item.created_at) >= start);
    } else if (rainTimeFilter.value === "24h") {
      const start = new Date(Date.now() - 24 * 60 * 60 * 1000);
      filtered = filtered.filter((item) => new Date(item.created_at) >= start);
    }
  }

  // --- Realtime mode ---
  if (rainChartMode.value === "realtime") {
    filtered = filtered.slice(-500);
  }

  return filtered;
});

const waterLevelChartData = computed(() => {
  return {
    labels: filteredWaterLevelData.value.map((d) =>
      new Date(d.created_at).toLocaleDateString()
    ),

    datasets: [
      {
        label: "Water Level (%)",
        data: filteredWaterLevelData.value.map((d) => d.water_level),

        backgroundColor: filteredWaterLevelData.value.map((d) => {
          if (d.water_level < 40) return "rgba(0,200,0,0.9)"; // Green
          if (d.water_level < 70) return "rgba(255,165,0,0.9)"; // Orange
          return "rgba(255,0,0,0.9)"; // Red
        }),

        borderRadius: 4,
      },
    ],
  };
});

const waterLevelChartOptions = {
  responsive: true,
  maintainAspectRatio: false, // ← this is key
  plugins: {
    legend: {
      display: true,
      // labels: {
      //   font: { size: 14 },
      // },
    },
    title: {
      display: true,
      text: "Water Level Over Time",
      // font: { size: 18 },
    },
    tooltip: {
      callbacks: {
        // Show full datetime in tooltip
        title: (tooltipItems) => {
          const idx = tooltipItems[0].dataIndex;
          const timestamp = filteredWaterLevelData.value[idx].created_at;
          return new Date(timestamp).toLocaleString(); // full date + time
        },
        label: (tooltipItem) => `Water Level: ${tooltipItem.raw}%`,
      },
    },
  },
  scales: {
    // x: {
    //   title: { display: true, text: "Date" },
    // },
    y: {
      title: { display: true, text: "Water Level (%)" },
      beginAtZero: true,
      max: 100,
    },
  },
};

const latestPoint = computed(() => filteredData.value.slice(-1)[0] || null);

const latestWaterLevel = computed(() =>
  latestPoint.value ? latestPoint.value.water_level : 0
);

const latestTime = computed(() =>
  latestPoint.value
    ? new Date(latestPoint.value.created_at).toLocaleTimeString()
    : "-"
);

const waterCardColor = computed(() => {
  const v = latestWaterLevel.value;

  if (v < 40) return "green-card";
  if (v < 70) return "orange-card";
  return "red-card";
});

const waterStatusText = computed(() => {
  const v = latestWaterLevel.value;

  if (v < 40) return "Normal • Safe";
  if (v < 70) return "Warning • Rising";
  return "Danger • High Water Level";
});

const rainChartData = computed(() => {
  const rapidRiseThreshold = 5; // % increase per interval during rain
  const windowSize = 30; // points to check after rain
  const tolerance = 5; // how close to baseline is considered normal
  const minDropRequired = 10; // must drop at least this much to be safe

  let baseline = null;
  let rainStarted = false;
  let rainStopIndex = null;

  const colors = [];
  const labels = [];
  const waterLevels = [];

  filteredRainData.value.forEach((item, i) => {
    labels.push(new Date(item.created_at).toLocaleDateString());
    waterLevels.push(item.water_level);

    // Default colors
    let color = item.rain_state
      ? "rgba(135,206,250,0.9)" // light blue during rain
      : "rgba(0,123,255,0.9)"; // default blue when no rain

    // 🌧️ Rain start → store baseline
    if (item.rain_state && !rainStarted) {
      rainStarted = true;
      baseline =
        i > 0 ? filteredRainData.value[i - 1].water_level : item.water_level;
      console.log(`🌧️ Rain started at index ${i}. Baseline = ${baseline}`);
      rainStopIndex = null;
    }

    // 🔥 During rain → rapid rise check
    if (item.rain_state && i >= 1) {
      const rise = item.water_level - filteredRainData.value[i - 1].water_level;
      if (rise >= rapidRiseThreshold) {
        color = "rgba(255,0,0,0.9)"; // red
        console.log(`🔥 Rapid rise detected at index ${i}: Rise = ${rise}`);
      }
    }

    // ☀️ Rain stopped → mark index
    if (!item.rain_state && rainStarted && rainStopIndex === null) {
      rainStopIndex = i;
      console.log(`☀️ Rain stopped at index ${i}`);
    }

    // 📊 After rain → rolling window check (only within windowSize)
    if (rainStopIndex !== null && !item.rain_state) {
      const countAfterRain = i - rainStopIndex + 1;

      if (countAfterRain <= windowSize) {
        const recent = filteredRainData.value.slice(rainStopIndex, i + 1);
        const start = recent[0].water_level;
        const end = recent[recent.length - 1].water_level;
        const drop = start - end;

        if (end > baseline + tolerance && drop < minDropRequired) {
          color = "rgba(255,165,0,0.9)"; // orange = blockage
          console.log(
            `📊 Index ${i}: start=${start}, end=${end}, drop=${drop}, baseline=${baseline} → ORANGE (possible blockage)`
          );
        } else if (end <= baseline + tolerance) {
          color = "rgba(0,200,0,0.9)"; // green = near baseline
          console.log(
            `📊 Index ${i}: start=${start}, end=${end}, drop=${drop}, baseline=${baseline} → GREEN (drain OK)`
          );
        }
      }
    }

    // 🚨 New rain starts → reset for next cycle
    if (item.rain_state && rainStopIndex !== null) {
      rainStopIndex = null;
      rainStarted = true;

      // find last non-null water_level before this rain
      for (let j = i - 1; j >= 0; j--) {
        if (filteredRainData.value[j].water_level != null) {
          baseline = filteredRainData.value[j].water_level;
          break;
        }
      }

      console.log(
        `🌧️ New rain detected at index ${i}. Reset baseline = ${baseline}`
      );
    }

    colors.push(color);
  });

  return {
    labels,
    datasets: [
      {
        label: "Water Level (%)",
        data: waterLevels,
        backgroundColor: colors,
        borderRadius: 4,
      },
    ],
  };
});

const latestBlockage = computed(() => {
  const rapidRiseThreshold = 5;
  const windowSize = 30;
  const tolerance = 5;
  const minDropRequired = 10;

  let baseline = null;
  let rainStarted = false;
  let rainStopIndex = null;

  let lastOrange = null;
  let lastGreen = null;

  filteredRainData.value.forEach((item, i) => {
    // 🌧️ Rain starts → set baseline
    if (item.rain_state && !rainStarted) {
      rainStarted = true;
      baseline =
        i > 0 ? filteredRainData.value[i - 1].water_level : item.water_level;
      rainStopIndex = null;
    }

    // ☀️ Rain stops
    if (!item.rain_state && rainStarted && rainStopIndex === null) {
      rainStopIndex = i;
    }

    // 📊 Rolling window check
    if (rainStopIndex !== null && !item.rain_state) {
      const count = i - rainStopIndex + 1;

      if (count <= windowSize) {
        const recent = filteredRainData.value.slice(rainStopIndex, i + 1);
        const last = recent[recent.length - 1];

        const start = recent[0].water_level;
        const end = last.water_level;
        const drop = start - end;

        const dateObj = new Date(last.created_at);

        const formattedDate = dateObj.toLocaleDateString();
        const formattedTime = dateObj.toLocaleTimeString();

        // 🔶 ORANGE - blockage
        if (end > baseline + tolerance && drop < minDropRequired) {
          lastOrange = {
            status: "BLOCKAGE",
            water: end,
            index: i,
            created_at: last.created_at,
            date: formattedDate,
            time: formattedTime,
          };
        }

        // 🟢 GREEN - clear
        if (end <= baseline + tolerance) {
          lastGreen = {
            status: "CLEAR",
            water: end,
            index: i,
            created_at: last.created_at,
            date: formattedDate,
            time: formattedTime,
          };
        }
      }
    }
  });

  return lastOrange || lastGreen || null;
});

const rainChartOptions = reactive({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      labels: {
        generateLabels: () => [
          { text: "No Rain", fillStyle: "rgba(0,123,255,0.9)" },
          { text: "Raining", fillStyle: "rgba(135,206,250,0.9)" },
          { text: "Blocked (After Rain)", fillStyle: "rgba(255,165,0,0.9)" },
          { text: "Rapid Rise (During Rain)", fillStyle: "rgba(255,0,0,0.9)" },
          { text: "water decade (After Rain)", fillStyle: "rgba(0,200,0,0.9)" },
        ],
      },
    },
    tooltip: {
      callbacks: {
        // Full datetime in tooltip
        title: (tooltipItems) => {
          const idx = tooltipItems[0].dataIndex;
          const timestamp = filteredRainData.value[idx].created_at;
          return new Date(timestamp).toLocaleString(); // full date + time
        },
        label: (tooltipItem) => `Water Level: ${tooltipItem.raw}%`,
      },
    },
  },
  scales: {
    y: { beginAtZero: true, title: { display: true, text: "Water Level (%)" } },
  },
});

const chartOptions = reactive({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
  },
  scales: {
    x: {
      stacked: true,
      title: {
        display: true,
        text: "Time",
      },
    },
    y: {
      stacked: true,
      title: {
        display: true,
        text: "CM",
      },
      beginAtZero: true,
    },
  },
});

// watch data to update chart automatically in real-time
watch(data, () => {
  // Chart.js automatically updates with reactive chartData
});

// watch(filteredRainData, (newData) => {
//   const rapidRiseThreshold = 5; // % increase during rain
//   const windowSize = 30; // number of points to check after rain
//   const tolerance = 5; // how close to baseline is considered safe
//   const minDropRequired = 10; // must drop this much to consider drain ok

//   let baseline = null;
//   let rainStarted = false;
//   let rainStopIndex = null;

//   // iterate over all points
//   for (let i = 0; i < newData.length; i++) {
//     const item = newData[i];

//     // Rain start → set baseline
//     if (item.rain_state && !rainStarted) {
//       rainStarted = true;
//       baseline = i > 0 ? newData[i - 1].water_level : item.water_level;
//       rainStopIndex = null;
//     }

//     // Rain stopped → mark index
//     if (!item.rain_state && rainStarted && rainStopIndex === null) {
//       rainStopIndex = i;
//     }

//     // After rain → check if water not dropping properly
//     if (rainStopIndex !== null && !item.rain_state) {
//       const countAfterRain = i - rainStopIndex + 1;
//       if (countAfterRain <= windowSize) {
//         const recent = newData.slice(rainStopIndex, i + 1);
//         const start = recent[0].water_level;
//         const end = recent[recent.length - 1].water_level;
//         const drop = start - end;

//         // If water still high → blockage
//         if (end > baseline + tolerance && drop < minDropRequired) {
//           blockageAlert.value = `Drain blockage detected at ${new Date(
//             item.created_at
//           ).toLocaleTimeString()}`;
//         } else if (end <= baseline + tolerance) {
//           blockageAlert.value = null; // drain back to normal
//         }
//       }
//     }

//     // If new rain starts → reset baseline for next cycle
//     if (item.rain_state && rainStopIndex !== null) {
//       rainStopIndex = null;
//       rainStarted = true;
//       for (let j = i - 1; j >= 0; j--) {
//         if (newData[j].water_level != null) {
//           baseline = newData[j].water_level;
//           break;
//         }
//       }
//     }
//   }
// });

const selectedDate = ref(null);

// -------------------------
// GROUP FORECAST BY DATE
// -------------------------
const dailyForecast = computed(() => {
  if (!forecast.value.length) return [];

  const groups = {};
  forecast.value.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
  });

  return Object.keys(groups)
    .sort()
    .map((date) => {
      const items = groups[date];

      // --- Most Frequent Weather ---
      const weatherCount = {};
      items.forEach((i) => {
        const key = i.weather[0].main;
        if (!weatherCount[key]) weatherCount[key] = { count: 0, item: i };
        weatherCount[key].count++;
      });

      let mostCommon = Object.values(weatherCount).sort(
        (a, b) => b.count - a.count
      )[0].item;

      // -----------------------------
      // FORCE DAY ICON
      mostCommon = {
        ...mostCommon,
        weather: [
          {
            ...mostCommon.weather[0],
            icon: mostCommon.weather[0].icon.slice(0, 2) + "d", // force day icon
          },
        ],
      };

      // --- Temp Range ---
      const temps = items.map((i) => i.main.temp);
      const minTemp = Math.min(...temps);
      const maxTemp = Math.max(...temps);

      return {
        date,
        summary: mostCommon,
        minTemp,
        maxTemp,
        all: items,
      };
    });
});

// -------------------------

watch(dailyForecast, (val) => {
  if (val.length && !selectedDate.value) {
    selectedDate.value = val[0].date;
  }
});

//flood prediction logic
// watch(
//   data,
//   (newVal) => {
//     if (!newVal.length) return;

//     const latest = newVal[newVal.length - 1];

//     if (latest.water_level >= 70) {
//       highCount.value++;
//     } else {
//       highCount.value = 0;
//     }

//     floodRisk.value = highCount.value >= 15;
//   },
//   { deep: true }
// );

// watch(
//   forecast,
//   (list) => {
//     if (!list || !list.length) return;

//     weatherRisk.value = list.some((f) => {
//       const rain = f?.rain?.["3h"] || f?.rain?.["1h"] || 0;

//       const condition = f.weather?.[0]?.main?.toLowerCase() || "";

//       return rain >= 10 || condition.includes("storm");
//     });
//   },
//   { deep: true }
// );

//flood prediction

const last30Data = computed(() => {
  return data.value.slice(-2); // last 30 readings
});

// Get the next forecast with rain (change threshold for testing)
const nextFloodForecast = computed(() => {
  if (!forecast.value.length) return null;
  return forecast.value.find((f) => {
    const rain = f?.rain?.["3h"] || f?.rain?.["1h"] || 0;
    return rain >= 1; // low for testing
  });
});

// Flood alert: all last 30 water high AND forecast predicts rain
const floodAlertActive = computed(() => {
  const latest = last30Data.value.slice(-1)[0];
  if (!latest) return false;

  const allWaterHigh =
    last30Data.value.length === 2 &&
    last30Data.value.every((d) => d.water_level >= 70);
  const forecastHeavyRain = !!nextFloodForecast.value;

  // Show flood if all water high and forecast has heavy rain
  if (allWaterHigh && forecastHeavyRain && latest.water_level >= 40)
    return true;

  // Hide if water is back safe
  return false;
});

// Text to display in template
const floodStatusText = computed(() => {
  if (floodAlertActive.value) {
    const forecastTime = nextFloodForecast.value
      ? new Date(nextFloodForecast.value.dt_txt).toLocaleString()
      : "-";
    return `⚠️ Flood predicted at ${forecastTime}`;
  }
  return "✅ No flood predicted";
});

// const waterHigh = computed(() => {
//   // True if all of last 30 readings >= 70
//   return last30Data.value.every((d) => d.water_level >= 70);
// });

// const predictedFlood = computed(() => {
//   if (!waterHigh.value || !nextFloodForecast.value) return false;

//   const now = new Date();
//   const forecastTime = new Date(nextFloodForecast.value.dt_txt);

//   // Only predict if forecast is in the future
//   return forecastTime > now;
// });

// const nextFloodForecast = computed(() => {
//   if (!forecast.value.length) return null;
//   return forecast.value.find((f) => {
//     const rain = f?.rain?.["3h"] || f?.rain?.["1h"] || 0;
//     const condition = f.weather?.[0]?.main?.toLowerCase() || "";
//     return rain >= 1 || condition.includes("storm");
//   });
// });

// const floodAlertActive = computed(() => {
//   const now = new Date();
//   const forecastTime = nextFloodForecast.value
//     ? new Date(nextFloodForecast.value.dt_txt)
//     : null;

//   // Active if predicted flood & water still high OR forecast not passed
//   if (!predictedFlood.value) return false;
//   if (latestWaterLevel.value < 40) return false; // water back to safe
//   if (forecastTime && now > forecastTime) return false; // predicted time passed

//   return true;
// });

// -------------------------
// EASY ACCESS SELECTED OBJECT
// -------------------------
const selectedDay = computed(() =>
  dailyForecast.value.find((d) => d.date === selectedDate.value)
);

// -------------------------
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-MY", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

// -------------------------
async function fetchData() {
  const { data: drainData, error } = await supabase
    .from("drain_data")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) console.error("Error fetching data:", error);
  else data.value = drainData;
}

function subscribeToDrainData() {
  subscription = supabase
    .channel("public:drain_data")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "drain_data" },
      (payload) => {
        switch (payload.eventType) {
          case "INSERT":
            data.value.push(payload.new);
            break;
          case "UPDATE":
            const idx = data.value.findIndex((i) => i.id === payload.new.id);
            if (idx !== -1) data.value[idx] = payload.new;
            break;
          case "DELETE":
            data.value = data.value.filter((i) => i.id !== payload.old.id);
            break;
        }
      }
    )
    .subscribe();
}

// -------------------------
async function fetchForecast() {
  try {
    const lat = 5.4141;
    const lon = 100.3288;
    const apiKey = import.meta.env.VITE_OPENWEATHER_KEY;

    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const dataJson = await res.json();
    forecast.value = dataJson.list;
  } catch (err) {
    console.error("Forecast fetch failed:", err);
  }
}

// -------------------------
onMounted(async () => {
  await fetchData();
  await fetchForecast();
  subscribeToDrainData();
});

// -------------------------
onUnmounted(() => {
  if (subscription) subscription.unsubscribe();
});
</script>
