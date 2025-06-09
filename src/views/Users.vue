<template>
  <Card class="main-card">
    <div class="container p-6">
      <h1 class="mb-5 text-2xl font-bold">Stakeholder Trust Overview</h1>

      <div class="mb-6 flex items-center gap-4">
        <label class="font-semibold text-lg">Minimum Trust Filter</label>
        <InputNumber v-model="minTrust" :min="0" :max="100" placeholder="0-100" />
      </div>
      
      <div>
        <h2 class="mb-3 text-xl font-semibold">Stakeholders</h2>
        <DataTable
          :value="filteredStakeholders"
          :responsive-layout="'scroll'"
          class="custom-table"
          selectionMode="single"
          v-model:selection="selectedStakeholders"
          dataKey="did"
          >
          <Column field="did" header="DID" />
          <Column field="name" header="Name" />
          <Column field="probabilistic_trust" header="Probabilistic Trust" />
          <Column field="deterministic_trust" header="Deterministic Trust" />
          <Column header="Created At">
            <template #body="slotProps">
              {{ formatTimestamp(slotProps.data.created_at) }}
            </template>
          </Column>
          <template #empty>
            <div class="p-4 text-center text-gray-500">No stakeholders available.</div>
          </template>
        </DataTable>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
/// <reference types="vite/client" />
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

interface Stakeholder {
  did: string;
  name: string;
  created_at: string;
  probabilistic_trust: number;
  deterministic_trust: number;
}

const selectedStakeholders = ref<Stakeholder | null>(null);
const allStakeholders = ref<Stakeholder[]>([]);
const minTrust = ref(0);

const formatTimestamp = (isoString: string) => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString.endsWith('Z') ? isoString : isoString + 'Z');
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(async () => {
  try {
    const response = await axios.get('/stakeholders');
    allStakeholders.value = response.data.stakeholders;
  } catch (error) {
    console.error('Failed to fetch resources:', error);
  }
});

const filteredStakeholders = computed(() =>
  allStakeholders.value.filter(s => s.probabilistic_trust >= minTrust.value || s.deterministic_trust >= minTrust.value)
);

</script>

<style scoped>
.custom-table .p-datatable {
  font-size: 1.125rem;
  border: 1px solid #ccc;
  border-radius: 12px;
  overflow: hidden;
}
.custom-table .p-datatable-thead > tr > th {
  background-color: #f5f5fa;
  font-weight: 600;
  font-size: 1.25rem;
  padding: 1.2rem;
  border-bottom: 2px solid #ddd;
}
.custom-table .p-datatable-tbody > tr > td {
  padding: 1.4rem;
  font-size: 1.125rem;
}
.custom-table .p-datatable-tbody > tr:nth-child(even) {
  background-color: #fafafa;
}
.custom-table .p-datatable-tbody > tr:hover {
  background-color: #e9f5ff;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
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