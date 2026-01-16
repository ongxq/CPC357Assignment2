<template>
  <div>
    <h1>Firebase Data Test</h1>
    <div v-if="data">
      <pre>{{ data }}</pre>
    </div>
    <div v-else>Loading...</div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { getDocs, collection, getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// ====== Firebase config ======
const firebaseConfig = {
  apiKey: "AIzaSyAFYGSZjbjHBhhJjjJnYGgIOo",
  projectId: "cpc357project-29ccf",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default {
  setup() {
    const data = ref(null);

    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, "drain_data"));
        const docs = snapshot.docs.map((doc) => doc.data());
        data.value = docs;
        console.log("Firebase data:", docs);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    onMounted(fetchData);

    return { data };
  },
};
</script>
