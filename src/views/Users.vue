<template>
  <Card class="main-card">
    <div class="container p-6">
      <h1 class="mb-5 text-2xl font-bold">User TODO did</h1>

      <div class="mb-6 flex items-center gap-4">
        <label class="font-semibold text-lg">Minimum Trust Filter </label>
        <InputNumber v-model="minTrust" :min="0" :max="100" placeholder="0-100" />
      </div>
      
      <div>
        <h2 class="mb-3 text-xl font-semibold">Stakeholders</h2>
        <DataTable
          :value="filteredResources"
          :responsive-layout="'scroll'"
          class="custom-table"
          selectionMode="single"
          v-model:selection="selectedResource"
          dataKey="did"
          >
          <Column field="did" header="DID" />
          <Column field="name" header="Name" />
          <Column field="probabilistic_trust" header="Probabilistic Trust" />
          <Column field="deterministic_trust" header="Deterministic Trust" />
          <Column field="created_at" header="Created At" />
          <template #empty>
            <div class="p-4 text-center text-gray-500">No stakeholders available.</div>
          </template>
        </DataTable>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, onMounted } from 'vue';
import axios from 'axios';

/*export default defineComponent({
  setup() {
    const data = ref<any>(null);

    onMounted(async () => {
      try {
        const evaluator_url = import.meta.env.VITE_TRUST_METRIC_EVALUATOR_HOST + ':' + import.meta.env.VITE_TRUST_METRIC_EVALUATOR_PORT
        const response = await fetch(evaluator_url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        data.value = await response.json();
        console.log('API response:', data.value);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    });

    return {
      data,
    };
  },
});*/

interface Resource {
  did: number;
  name: string;
  created_at: string;
  probabilistic_trust: number;
  deterministic_trust: number;
}

const selectedResource = ref<Resource | null>(null);  // For row highlighting

const allResources = ref<Resource[]>([
//  { did: 1, name: 'Service A', created_at: 1, probabilistic_trust: 85, deterministic_trust: 75 },
//  { did: 2, name: 'Service B', created_at: 1, probabilistic_trust: 60, deterministic_trust: 65 },
//  { did: 3, name: 'Service C', created_at: 1, probabilistic_trust: 95, deterministic_trust: 85 },
]);
const minTrust = ref(0);

// Fetch data from API
onMounted(async () => {
  try {
    const evaluator_url = import.meta.env.VITE_TRUST_METRIC_EVALUATOR_HOST + ':' + import.meta.env.VITE_TRUST_METRIC_EVALUATOR_PORT
    const response = await axios.get(`${evaluator_url}/stakeholders`);
    allResources.value = response.data;
    console.log(response.data)
  } catch (error) {
    console.error('Failed to fetch resources:', error);
  }
});

const filteredResources = computed(() =>
  allResources.value.filter(r => r.probabilistic_trust >= minTrust.value || r.deterministic_trust >= minTrust.value)
);
</script>

<style scoped>
.custom-table .p-datatable {
  font-size: 1.125rem; /* 18px base font size */
  border: 1px solid #ccc;
  border-radius: 12px;
  overflow: hidden;
}

.custom-table .p-datatable-thead > tr > th {
  background-color: #f5f5fa;
  font-weight: 600;
  font-size: 1.25rem; /* 20px for headers */
  padding: 1.2rem;
  border-bottom: 2px solid #ddd;
}

.custom-table .p-datatable-tbody > tr > td {
  padding: 1.4rem;
  font-size: 1.125rem; /* 18px for body cells */
}

/* Even row background */
.custom-table .p-datatable-tbody > tr:nth-child(even) {
  background-color: #fafafa;
}

/* Hover effect */
.custom-table .p-datatable-tbody > tr:hover {
  background-color: #e9f5ff;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

/* Selected row highlight */
.custom-table .p-datatable-tbody > tr.p-highlight {
  background-color: #d1eaff !important;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.main-card {
  border: 1px solid #dcdce5;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background-color: #fff;
}

</style>
