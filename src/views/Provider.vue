<template>
  <Card class="main-card">
    <div class="container p-6">
      <h1 class="mb-8 text-2xl font-bold">Provider & Stakeholder Management</h1>

      <Message v-if="generalAlert.show" :severity="generalAlert.type" :closable="true" class="mb-4">
        {{ generalAlert.message }}
      </Message>

      <div>
        <h2 class="mb-3 text-xl font-semibold">Manage Stakeholders</h2>
        <DataTable
          :value="allStakeholders"
          :loading="isLoading"
          responsive-layout="scroll"
          class="custom-table"
          dataKey="did"
        >
          <Column field="did" header="DID" style="width: 35%"></Column>
          <Column field="name" header="Name" style="width: 15%"></Column>
          <Column field="probabilistic_trust" header="Probabilistic Trust" style="width: 15%"></Column>
          <Column field="deterministic_trust" header="Deterministic Trust" style="width: 15%"></Column>
          <Column header="Created At" style="width: 20%">
            <template #body="slotProps">
              {{ formatTimestamp(slotProps.data.created_at) }}
            </template>
          </Column>
          <Column header="Actions" style="width: 10%; text-align: center">
            <template #body="slotProps">
              <Button 
                icon="pi pi-trash" 
                class="p-button-danger p-button-rounded p-button-text" 
                @click="handleRemoveStakeholder(slotProps.data.did)" 
              />
            </template>
          </Column>
          <template #empty>
            <div class="p-4 text-center text-gray-500">No stakeholders found. Start by creating a new one below!</div>
          </template>
        </DataTable>
      </div>

      <div class="my-10 border-t border-gray-200"></div>

      <div>
        <h2 class="mb-6 text-xl font-semibold">Create New Stakeholder</h2>

        <Message v-if="createFormAlert.show" :severity="createFormAlert.type" :closable="true" class="mb-4">
          {{ createFormAlert.message }}
        </Message>

        <div class="form-grid">
          <div class="form-field"> 
            <label for="stakeholderType">Stakeholder Type</label>
            <Dropdown 
              id="stakeholderType"
              v-model="newStakeholder.type" 
              :options="stakeholderTypes" 
              optionLabel="text" 
              optionValue="value" 
              placeholder="Select a Type" 
            />
          </div>

          <div class="form-field">
            <label for="stakeholderName">Stakeholder Name</label>
            <InputText 
              id="stakeholderName"
              v-model="newStakeholder.name" 
              placeholder="Enter stakeholder name" 
            />
          </div>

          <div v-if="requiresMetrics" class="form-field full-width">
            <label for="metricsUrl">Metrics URL</label>
            <InputText 
              id="metricsUrl"
              v-model="newStakeholder.metrics_url" 
              placeholder="https://example.com/metrics"
            />
          </div>

          <div v-if="requiresProvider" class="form-field full-width">
            <label for="providerDid">Provider DID <span class="text-red-500">*</span></label>
            <InputText 
              id="providerDid"
              v-model="newStakeholder.provider_did" 
              placeholder="Enter Provider DID (e.g. did:example:provider1)"
            />
          </div>
        </div>
        <div>
          <br>
        </div>
        <div class="mt-8 flex justify-end">
          <Button
            label="Create Stakeholder"
            icon="pi pi-plus"
            :loading="isCreating"
            :disabled="!isFormValid"
            @click="handleCreateStakeholder"
            class="p-button-lg"
          />
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
/// <reference types="vite/client" />
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

interface Stakeholder {
  did: string;
  name: string;
  created_at: string;
  probabilistic_trust: number;
  deterministic_trust: number;
}
type AlertType = 'success' | 'info' | 'warn' | 'error';

const allStakeholders = ref<Stakeholder[]>([]);
const isLoading = ref(false);
const isCreating = ref(false);
const newStakeholder = ref({
  type: null as string | null,
  name: '',
  metrics_url: '',
  provider_did: ''
});
const generalAlert = ref({ show: false, type: 'success' as AlertType, message: '' });
const createFormAlert = ref({ show: false, type: 'success' as AlertType, message: '' });

const evaluatorUrl = 'http://' + import.meta.env.VITE_TRUST_METRIC_EVALUATOR_HOST + ':' + import.meta.env.VITE_TRUST_METRIC_EVALUATOR_PORT;
const stakeholderTypeMap: { [key: string]: number } = {
  resource_provider: 0,
  resource_capacity: 1,
  application_provider: 2,
  resource: 3,
  capacity_provider: 4
};
const stakeholderTypes = [
  { text: 'Resource Provider', value: 'resource_provider' },
  { text: 'Resource Capacity', value: 'resource_capacity' },
  { text: 'Application Provider', value: 'application_provider' },
  { text: 'Resource', value: 'resource' },
  { text: 'Resource Capacity Provider', value: 'capacity_provider' },
];

const requiresMetrics = computed(() => {
  const selectedType = newStakeholder.value.type;
  return selectedType === 'resource_capacity' || selectedType === 'resource'; 
});
const requiresProvider = computed(() => {
  const selectedType = newStakeholder.value.type;
  return selectedType === 'resource_capacity' || selectedType === 'resource'; 
});
const isFormValid = computed(() => {
  const baseValid = newStakeholder.value.type && newStakeholder.value.name;
  if (requiresMetrics.value && requiresProvider.value) {
    return baseValid && newStakeholder.value.metrics_url && newStakeholder.value.provider_did;
  }
  if (requiresMetrics.value) {
    return baseValid && newStakeholder.value.metrics_url;
  }
  if (requiresProvider.value) {
    return baseValid && newStakeholder.value.provider_did;
  }
  return baseValid;
});

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

const showAlert = (message: string, type: AlertType = 'success', targetAlert: 'general' | 'createForm' = 'general') => {
  const alertToUpdate = targetAlert === 'general' ? generalAlert : createFormAlert;
  alertToUpdate.value = { show: true, message, type };
  setTimeout(() => { alertToUpdate.value.show = false; }, 5000);
};

const resetForm = () => {
  newStakeholder.value = { type: null, name: '', metrics_url: '', provider_did: '' };
  createFormAlert.value.show = false;
};

const fetchStakeholders = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(`/stakeholders/${import.meta.env.VITE_OWNER_DID}`);
    allStakeholders.value = response.data.stakeholders; 
  } catch (error) {
    console.error('Failed to fetch stakeholders:', error);
    showAlert('Failed to fetch stakeholders. Check console for details.', 'error', 'general');
  } finally {
    isLoading.value = false;
  }
};

const handleRemoveStakeholder = async (stakeholderDid: string) => {
  if (!confirm('Are you sure you want to remove this stakeholder?')) return;
  try {
    await axios.delete(`/stakeholder/${stakeholderDid}`);
    showAlert('Stakeholder removed successfully!', 'success', 'general');
    await fetchStakeholders();
  } catch (error) {
    const detail = (error as any).response?.data?.detail || 'Failed to remove stakeholder.';
    showAlert(detail, 'error', 'general');
  }
};

const handleCreateStakeholder = async () => {
  if (!isFormValid.value) {
    showAlert('Please fill in all required fields.', 'warn', 'createForm');
    return;
  }
  isCreating.value = true;
  const newDid = `did:example:${Date.now()}`;
  const params: { [key: string]: any } = {
    stakeholder_type: stakeholderTypeMap[newStakeholder.value.type!],
    name: newStakeholder.value.name,
    owner: import.meta.env.VITE_OWNER_DID,
  };
  if (requiresMetrics.value) {
    params.metrics_url = newStakeholder.value.metrics_url;
  }
  if (requiresProvider.value) {
    params.provider = newStakeholder.value.provider_did;
  }
  try {
    await axios.post(`/stakeholder/${newDid}`, null, { params });
    showAlert('Stakeholder created successfully!', 'success', 'general');
    resetForm();
    await fetchStakeholders();
  } catch (error) {
    const detail = (error as any).response?.data?.detail || 'Failed to create stakeholder.';
    showAlert(detail, 'error', 'createForm');
  } finally {
    isCreating.value = false;
  }
};

onMounted(fetchStakeholders);
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-field label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.full-width {
  grid-column: 1 / -1;
}

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
.main-card {
  border: 1px solid #dcdce5;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background-color: #fff;
}
</style>